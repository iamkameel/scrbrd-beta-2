'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Theme, Match, SchoolRegistryItem } from "./types";
import WagonWheel from "./WagonWheel";
import ScorecardModal from "./ScorecardModal";
import { MATCH_SCORECARDS } from "./scorecardData";
import { SHOT_DATA_SAMPLE } from "./data";
import LiveMatchSettingsModal, { MatchSettingsState } from "./LiveMatchSettingsModal";
import LineupsBowlersModal, { BatterProfile, BowlerProfile } from "./LineupsBowlersModal";
import FieldPlacementEditorModal from "./FieldPlacementEditorModal";
import BowlerWorkloadMonitor from "./BowlerWorkloadMonitor";
import CaptainTacticalCockpit from "./CaptainTacticalCockpit";
import FullScorecardView from "./FullScorecardView";
import DeepMatchAnalyticsView from "./DeepMatchAnalyticsView";

interface BroadcastScorerProps {
  theme: Theme;
  onClose?: () => void;
  activeMatch?: Match;
  activeSchool?: SchoolRegistryItem;
}

// ── CANONICAL WAGON WHEEL SPATIAL COORDINATE ENGINE ─────
export interface WagonWheelShot {
  x: number; // -1.0 to 1.0 (striker at 0, 0, boundary radius ~1.0)
  y: number; // -1.0 to 1.0 (negative is towards bowler/top, positive behind batter)
  radius: number; // 0.0 to 1.0
  angle: number; // 0° to 360° (0° = Straight to bowler, 90° = Leg square RHB, 270° = Off square RHB)
  side: "OFF" | "LEG";
  sector: string; // e.g. "Deep Extra Cover", "Cover", "Point", "Mid-Wicket"
  depth: "close" | "infield" | "deep" | "boundary";
  shotType: string; // e.g. "Cover Drive", "Square Cut", "Pull Shot"
  batHand: "R" | "L";
  fieldingZone?: string;
  fieldingZoneDesc?: string;
  distanceMeters?: number;
  suggestedRuns?: number;
}

export interface DeliveryRecord {
  id: string;
  overIndex: number;
  ballInOver: number;
  isLegalDelivery: boolean;
  bowler: string;
  batter: string;
  batterHand: "R" | "L";
  runsOffBat: number;
  extraType?: "wd" | "nb" | "b" | "lb" | "pen";
  extraRuns: number;
  totalRuns: number;
  isWicket: boolean;
  wicketType?: string;
  fielder?: string;
  shot?: WagonWheelShot;
  pitchDelivery?: {
    line: "outside_off" | "off_stump" | "middle" | "leg_stump" | "down_leg";
    length: "yorker" | "full" | "good_length" | "back_of_length" | "short";
    paceType?: "fast" | "medium" | "off_spin" | "leg_spin";
  };
  telemetry?: {
    line: string;
    length: string;
    pace?: string;
  };
  trajectory?: "along_ground" | "aerial" | "lofted" | "defended";
  contactQuality?: "middle" | "edge" | "mishit" | "uncontrolled";
  verificationStatus: "verified" | "phase1_only" | "amended";
  amendmentReason?: string;
  commentary: string;
  timestamp: string;
  syncStatus: "synced" | "queued" | "syncing";
}

// Convert Cartesian (x, y) [-1 to 1] into canonical cricket angle, sector, depth, side, and exact fielding zone
export function classifyWagonCoordinates(
  x: number,
  y: number,
  batHand: "R" | "L" = "R"
): WagonWheelShot {
  const radius = Math.min(1.0, Math.sqrt(x * x + y * y));

  // Calculate angle where bowler (0, -1) is 0°, Leg side (+x) is 90° for RHB
  let rawAngleRad = Math.atan2(x, -y);
  if (rawAngleRad < 0) rawAngleRad += 2 * Math.PI;
  let angleDeg = Math.round((rawAngleRad * 180) / Math.PI); // 0 to 360

  // For Left-handed batter, mirror horizontally
  const effectiveAngle = batHand === "L" ? (360 - angleDeg) % 360 : angleDeg;

  // Off Side vs Leg Side for batter perspective
  const side = effectiveAngle >= 180 && effectiveAngle < 360 ? "OFF" : "LEG";

  // Radial Depth classification
  let depth: "close" | "infield" | "deep" | "boundary" = "infield";
  if (radius <= 0.22) depth = "close";
  else if (radius <= 0.52) depth = "infield";
  else if (radius <= 0.82) depth = "deep";
  else depth = "boundary";

  // Angular Sector & Precise Fielding Zone Identification
  let sector = "Cover";
  let fieldingZone = "Cover Point";
  let fieldingZoneDesc = "Infield 30-yard ring (Off-Side)";

  if (effectiveAngle >= 345 || effectiveAngle < 15) {
    if (depth === "boundary") {
      sector = "Straight Down Ground";
      fieldingZone = "Straight Boundary Sight-Screen";
      fieldingZoneDesc = "Deep Boundary (Straight)";
    } else if (depth === "deep") {
      sector = "Straight";
      fieldingZone = "Long Off/On Deep V";
      fieldingZoneDesc = "Outfield Straight Gap";
    } else if (depth === "infield") {
      sector = "Straight";
      fieldingZone = "Pitch Follow-Through / Bowler";
      fieldingZoneDesc = "Straight inner ring near bowler";
    } else {
      sector = "Straight";
      fieldingZone = "Batting Crease / Non-Striker";
      fieldingZoneDesc = "Pitch center close-in";
    }
  } else if (effectiveAngle >= 15 && effectiveAngle < 55) {
    if (depth === "boundary") {
      sector = "Long On";
      fieldingZone = "Long On Boundary";
      fieldingZoneDesc = "Deep Boundary Outfield (Leg-Side)";
    } else if (depth === "deep") {
      sector = "Long On";
      fieldingZone = "Deep Mid-On / Long On";
      fieldingZoneDesc = "Deep Outfield (Leg-Side)";
    } else if (depth === "infield") {
      sector = "Mid-On";
      fieldingZone = "Mid-On";
      fieldingZoneDesc = "30-Yard Ring (Leg-Side)";
    } else {
      sector = "Mid-On";
      fieldingZone = "Short Mid-On";
      fieldingZoneDesc = "Close Cordon (Leg-Side)";
    }
  } else if (effectiveAngle >= 55 && effectiveAngle < 105) {
    if (depth === "boundary") {
      sector = "Deep Mid-Wicket";
      fieldingZone = "Deep Mid-Wicket (Cow Corner)";
      fieldingZoneDesc = "Deep Boundary Outfield (Leg-Side)";
    } else if (depth === "deep") {
      sector = "Deep Mid-Wicket";
      fieldingZone = "Sweeper Mid-Wicket";
      fieldingZoneDesc = "Deep Outfield (Leg-Side)";
    } else if (depth === "infield") {
      sector = "Mid-Wicket";
      fieldingZone = "Mid-Wicket";
      fieldingZoneDesc = "30-Yard Ring (Leg-Side)";
    } else {
      sector = "Mid-Wicket";
      fieldingZone = "Short Mid-Wicket / Silly Mid-On";
      fieldingZoneDesc = "Close Cordon (Leg-Side)";
    }
  } else if (effectiveAngle >= 105 && effectiveAngle < 145) {
    if (depth === "boundary") {
      sector = "Deep Square Leg";
      fieldingZone = "Deep Square Leg";
      fieldingZoneDesc = "Deep Boundary Behind Square (Leg-Side)";
    } else if (depth === "deep") {
      sector = "Deep Square Leg";
      fieldingZone = "Deep Forward Square";
      fieldingZoneDesc = "Deep Outfield (Leg-Side)";
    } else if (depth === "infield") {
      sector = "Square Leg";
      fieldingZone = "Square Leg";
      fieldingZoneDesc = "30-Yard Ring (Leg-Side)";
    } else {
      sector = "Square Leg";
      fieldingZone = "Short Leg / Forward Short Leg";
      fieldingZoneDesc = "Close Cordon (Leg-Side)";
    }
  } else if (effectiveAngle >= 145 && effectiveAngle < 185) {
    if (depth === "boundary") {
      sector = "Deep Fine Leg";
      fieldingZone = "Deep Fine Leg";
      fieldingZoneDesc = "Deep Boundary Behind Stumps (Leg-Side)";
    } else if (depth === "deep") {
      sector = "Deep Fine Leg";
      fieldingZone = "Fine Leg Outfield";
      fieldingZoneDesc = "Deep Outfield (Leg-Side)";
    } else if (depth === "infield") {
      sector = "Fine Leg";
      fieldingZone = "Short Fine Leg";
      fieldingZoneDesc = "30-Yard Ring (Leg-Side)";
    } else {
      sector = "Fine Leg";
      fieldingZone = "Leg Slip / Leg Gully";
      fieldingZoneDesc = "Close Behind Crease (Leg-Side)";
    }
  } else if (effectiveAngle >= 185 && effectiveAngle < 225) {
    if (depth === "boundary") {
      sector = "Deep Third Man";
      fieldingZone = "Deep Third Man";
      fieldingZoneDesc = "Deep Boundary Behind Stumps (Off-Side)";
    } else if (depth === "deep") {
      sector = "Deep Third Man";
      fieldingZone = "Fly Slip / Third Man Outfield";
      fieldingZoneDesc = "Deep Outfield (Off-Side)";
    } else if (depth === "infield") {
      sector = "Third Man";
      fieldingZone = "Short Third Man";
      fieldingZoneDesc = "30-Yard Ring (Off-Side)";
    } else {
      sector = "Third Man";
      fieldingZone = "Wicket Keeper / 1st Slip";
      fieldingZoneDesc = "Slip Cordon (Off-Side)";
    }
  } else if (effectiveAngle >= 225 && effectiveAngle < 275) {
    if (depth === "boundary") {
      sector = "Deep Point";
      fieldingZone = "Deep Backward Point / Deep Point";
      fieldingZoneDesc = "Deep Boundary (Off-Side)";
    } else if (depth === "deep") {
      sector = "Deep Point";
      fieldingZone = "Sweeper Point";
      fieldingZoneDesc = "Deep Outfield (Off-Side)";
    } else if (depth === "infield") {
      sector = "Point";
      fieldingZone = "Backward Point / Gully";
      fieldingZoneDesc = "30-Yard Ring (Off-Side)";
    } else {
      sector = "Point";
      fieldingZone = "Gully / Silly Point";
      fieldingZoneDesc = "Close Cordon (Off-Side)";
    }
  } else if (effectiveAngle >= 275 && effectiveAngle < 315) {
    if (depth === "boundary") {
      sector = "Deep Extra Cover";
      fieldingZone = "Deep Extra Cover";
      fieldingZoneDesc = "Deep Boundary (Off-Side)";
    } else if (depth === "deep") {
      sector = "Deep Extra Cover";
      fieldingZone = "Sweeper Cover";
      fieldingZoneDesc = "Deep Outfield (Off-Side)";
    } else if (depth === "infield") {
      sector = "Cover";
      fieldingZone = "Cover / Extra Cover";
      fieldingZoneDesc = "30-Yard Ring (Off-Side)";
    } else {
      sector = "Cover";
      fieldingZone = "Short Extra Cover";
      fieldingZoneDesc = "Close Cordon (Off-Side)";
    }
  } else if (effectiveAngle >= 315 && effectiveAngle < 345) {
    if (depth === "boundary") {
      sector = "Long Off";
      fieldingZone = "Long Off Boundary";
      fieldingZoneDesc = "Deep Boundary (Off-Side)";
    } else if (depth === "deep") {
      sector = "Long Off";
      fieldingZone = "Deep Mid-Off";
      fieldingZoneDesc = "Deep Outfield (Off-Side)";
    } else if (depth === "infield") {
      sector = "Mid-Off";
      fieldingZone = "Mid-Off";
      fieldingZoneDesc = "30-Yard Ring (Off-Side)";
    } else {
      sector = "Mid-Off";
      fieldingZone = "Short Mid-Off";
      fieldingZoneDesc = "Close Cordon (Off-Side)";
    }
  }

  const distanceMeters = Math.round(radius * 85);
  let suggestedRuns = 1;
  if (depth === "boundary") suggestedRuns = radius > 0.92 ? 6 : 4;
  else if (depth === "deep") suggestedRuns = 2;
  else if (depth === "infield") suggestedRuns = 1;
  else suggestedRuns = 0;

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    radius: Number(radius.toFixed(2)),
    angle: angleDeg,
    side,
    depth,
    sector,
    shotType: "Drive",
    batHand,
    fieldingZone,
    fieldingZoneDesc,
    distanceMeters,
    suggestedRuns,
  };
}

export default function BroadcastScorer({
  theme: D,
  onClose,
  activeMatch,
  activeSchool,
}: BroadcastScorerProps) {
  // Context titles
  const homeTitle = activeMatch?.homeTeam || (activeSchool ? `${activeSchool.shortName} 1st XI` : "Westville Boys' High 1st XI");
  const awayTitle = activeMatch?.awayTeam || (activeSchool?.derbyRival ? `${activeSchool.derbyRival} 1st XI` : "Kearsney College 1st XI");
  const venueTitle = activeMatch?.venue || (activeSchool?.mainOval ? `${activeSchool.mainOval}, ${activeSchool.city}` : "Bowden's Field Oval, Westville");

  // Initial base state
  const baseStriker = useMemo(() => {
    if (activeSchool?.id === "HIL") return { name: "Matthew Stewart", runs: 104, balls: 132, fours: 12, sixes: 3, hand: "R" as const };
    if (activeSchool?.id === "MIC") return { name: "Hayden Higgs", runs: 62, balls: 54, fours: 6, sixes: 2, hand: "L" as const };
    if (activeSchool?.id === "MCB") return { name: "Chad Mason", runs: 81, balls: 89, fours: 9, sixes: 1, hand: "R" as const };
    if (activeSchool?.id === "DHS") return { name: "Semal Pillay", runs: 58, balls: 38, fours: 8, sixes: 1, hand: "R" as const };
    if (activeSchool?.id === "KEA") return { name: "Ross Coetzee", runs: 45, balls: 39, fours: 5, sixes: 1, hand: "R" as const };
    if (activeSchool?.id === "NOR") return { name: "Ryan Brand", runs: 54, balls: 41, fours: 6, sixes: 2, hand: "L" as const };
    return { name: "James Whitfield", runs: 67, balls: 44, fours: 7, sixes: 2, hand: "R" as const };
  }, [activeSchool]);

  const baseNonStriker = useMemo(() => {
    if (activeSchool?.id === "HIL") return { name: "Luke Campbell", runs: 48, balls: 61, fours: 4, sixes: 0, hand: "R" as const };
    if (activeSchool?.id === "MIC") return { name: "Murray Baker", runs: 33, balls: 40, fours: 3, sixes: 0, hand: "R" as const };
    if (activeSchool?.id === "MCB") return { name: "Luc Jacobs", runs: 34, balls: 40, fours: 3, sixes: 0, hand: "R" as const };
    if (activeSchool?.id === "DHS") return { name: "Kamran Moodley", runs: 22, balls: 20, fours: 2, sixes: 0, hand: "L" as const };
    if (activeSchool?.id === "NOR") return { name: "Ross Barnes", runs: 31, balls: 26, fours: 3, sixes: 0, hand: "R" as const };
    return { name: "Ethan Solomons", runs: 31, balls: 29, fours: 3, sixes: 0, hand: "R" as const };
  }, [activeSchool]);

  // Main top-level Navigation Tabs: Live Scorer Console, Full Scorecard, Deep Match Analytics, Commentary
  const [activeMainTab, setActiveMainTab] = useState<"scorer" | "scorecard" | "analytics" | "commentary">("scorer");

  // Capture Profiles: FULL, STANDARD, QUICK
  const [captureProfile, setCaptureProfile] = useState<"FULL" | "STANDARD" | "QUICK">("STANDARD");

  // Match Management Settings Modal & State
  const [matchSettingsModalOpen, setMatchSettingsModalOpen] = useState<boolean>(false);
  const [matchSettings, setMatchSettings] = useState<MatchSettingsState>({
    format: "T20",
    maxOvers: 20,
    maxOversPerBowler: 4,
    ballType: "White Kookaburra 156g",
    pitchCondition: "Hard & Bouncy",
    powerplay1Overs: 6,
    powerplay2Overs: 0,
    matchStatus: "In Progress",
    tossWinner: "home",
    tossDecision: "bat",
    dlsRevisedOvers: 18,
    dlsTarget: 168,
    autoRotateStrike: true,
    autoPromptBowlerAtOverEnd: true,
    showProHawkeyeRadar: true,
    showPitchHeatmap: true,
    showCommentaryFeed: true,
    showWagonHud: true,
  });

  // Lineups and Bowlers Management Modal & Squads State
  const [lineupsModalOpen, setLineupsModalOpen] = useState<boolean>(false);

  // Batting Squad (11 Players)
  const [battingSquad, setBattingSquad] = useState<BatterProfile[]>([
    { id: "bat_1", name: baseStriker.name, role: "Opening Batter", hand: baseStriker.hand, runs: baseStriker.runs, balls: baseStriker.balls, fours: baseStriker.fours, sixes: baseStriker.sixes, status: "batting" },
    { id: "bat_2", name: baseNonStriker.name, role: "Opening Batter", hand: baseNonStriker.hand, runs: baseNonStriker.runs, balls: baseNonStriker.balls, fours: baseNonStriker.fours, sixes: baseNonStriker.sixes, status: "batting" },
    { id: "bat_3", name: "Luke Campbell", role: "Top Order Batter", hand: "R", runs: 28, balls: 19, fours: 3, sixes: 1, status: "out", dismissal: "c M. Khumalo b T. Ndlovu" },
    { id: "bat_4", name: "Tristan van Rooyen", role: "Wicketkeeper / Middle Order", hand: "L", runs: 0, balls: 0, fours: 0, sixes: 0, status: "did_not_bat" },
    { id: "bat_5", name: "Gareth Jenkins", role: "All-Rounder", hand: "R", runs: 0, balls: 0, fours: 0, sixes: 0, status: "did_not_bat" },
    { id: "bat_6", name: "Siyabonga Sithole", role: "All-Rounder", hand: "R", runs: 0, balls: 0, fours: 0, sixes: 0, status: "did_not_bat" },
    { id: "bat_7", name: "Kieran Marais", role: "Bowling All-Rounder", hand: "L", runs: 0, balls: 0, fours: 0, sixes: 0, status: "did_not_bat" },
    { id: "bat_8", name: "Liam O'Connor", role: "Spin Bowler", hand: "R", runs: 0, balls: 0, fours: 0, sixes: 0, status: "did_not_bat" },
    { id: "bat_9", name: "Bradley Steyn", role: "Fast Bowler", hand: "R", runs: 0, balls: 0, fours: 0, sixes: 0, status: "did_not_bat" },
    { id: "bat_10", name: "Zack Pieterse", role: "Fast Bowler", hand: "R", runs: 0, balls: 0, fours: 0, sixes: 0, status: "did_not_bat" },
    { id: "bat_11", name: "Nathi Zuma", role: "Fast Bowler", hand: "R", runs: 0, balls: 0, fours: 0, sixes: 0, status: "did_not_bat" },
  ]);

  // Bowling Attack Squad
  const [bowlingAttack, setBowlingAttack] = useState<BowlerProfile[]>([
    { id: "bowl_1", name: "T. Ndlovu", bowlingStyle: "Right-arm fast medium", overs: 3.2, maxOvers: 4, maidens: 0, runs: 24, wickets: 2, dots: 11, isCurrent: true, isLastOver: false },
    { id: "bowl_2", name: "M. Khumalo", bowlingStyle: "Left-arm orthodox spin", overs: 4.0, maxOvers: 4, maidens: 1, runs: 28, wickets: 1, dots: 14, isCurrent: false, isLastOver: true },
    { id: "bowl_3", name: "D. Smith", bowlingStyle: "Right-arm off break", overs: 3.0, maxOvers: 4, maidens: 0, runs: 22, wickets: 0, dots: 8, isCurrent: false, isLastOver: false },
    { id: "bowl_4", name: "K. Govender", bowlingStyle: "Right-arm fast", overs: 2.0, maxOvers: 4, maidens: 0, runs: 19, wickets: 0, dots: 5, isCurrent: false, isLastOver: false },
    { id: "bowl_5", name: "A. Robertson", bowlingStyle: "Left-arm fast seam", overs: 2.0, maxOvers: 4, maidens: 0, runs: 18, wickets: 0, dots: 6, isCurrent: false, isLastOver: false },
    { id: "bowl_6", name: "S. Pillay", bowlingStyle: "Leg break googly", overs: 0.0, maxOvers: 4, maidens: 0, runs: 0, wickets: 0, dots: 0, isCurrent: false, isLastOver: false },
  ]);

  const [activeStrikerId, setActiveStrikerId] = useState<string>("bat_1");
  const [activeNonStrikerId, setActiveNonStrikerId] = useState<string>("bat_2");
  const [activeBowlerId, setActiveBowlerId] = useState<string>("bowl_1");

  // View Mode: Scorer Cockpit vs Spectator Overlay Preview
  const [viewMode, setViewMode] = useState<"scorer" | "spectator_overlay">("scorer");
  const [fieldEditorOpen, setFieldEditorOpen] = useState<boolean>(false);

  // Right column active sub-tab: Commentary feed vs Live Striker Wagon Wheel vs Over Audit vs Pitch Map vs Telemetry vs Quick Log
  const [rightPanelTab, setRightPanelTab] = useState<"wagon" | "pitchmap" | "telemetry" | "commentary" | "audit" | "quicklog">("wagon");

  // Active batter stance (Auto-predefined from player profile)
  const [activeBatHand, setActiveBatHand] = useState<"R" | "L">(baseStriker.hand);

  // Auto-sync activeBatHand whenever the active striker changes
  React.useEffect(() => {
    const curStriker = battingSquad.find(b => b.id === activeStrikerId);
    if (curStriker && (curStriker.hand || curStriker.battingHand)) {
      setActiveBatHand((curStriker.hand || curStriker.battingHand) as "R" | "L");
    }
  }, [activeStrikerId, battingSquad]);

  // Delivery Event Log (Single Source of Truth)
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([
    {
      id: "del_init_1",
      overIndex: 14,
      ballInOver: 1,
      isLegalDelivery: true,
      bowler: "T. Ndlovu",
      batter: baseStriker.name,
      batterHand: "R",
      runsOffBat: 1,
      extraRuns: 0,
      totalRuns: 1,
      isWicket: false,
      shot: {
        x: -0.62,
        y: -0.25,
        radius: 0.67,
        angle: 292,
        side: "OFF",
        sector: "Point",
        depth: "deep",
        shotType: "Steer",
        batHand: "R",
      },
      pitchDelivery: { line: "outside_off", length: "back_of_length", paceType: "fast" },
      trajectory: "along_ground",
      contactQuality: "middle",
      verificationStatus: "verified",
      commentary: "Back of a length outside off, steered through point for a brisk single.",
      timestamp: "14.1",
      syncStatus: "synced",
    },
    {
      id: "del_init_2",
      overIndex: 14,
      ballInOver: 2,
      isLegalDelivery: true,
      bowler: "T. Ndlovu",
      batter: baseNonStriker.name,
      batterHand: "R",
      runsOffBat: 0,
      extraRuns: 0,
      totalRuns: 0,
      isWicket: false,
      shot: {
        x: -0.22,
        y: -0.54,
        radius: 0.58,
        angle: 338,
        side: "OFF",
        sector: "Mid-Off",
        depth: "infield",
        shotType: "Forward Defence",
        batHand: "R",
      },
      pitchDelivery: { line: "off_stump", length: "good_length", paceType: "fast" },
      trajectory: "along_ground",
      contactQuality: "middle",
      verificationStatus: "verified",
      commentary: "Fuller delivery angling across, driven firmly straight to mid-off. Dot ball.",
      timestamp: "14.2",
      syncStatus: "synced",
    },
  ]);

  // Phase 2 Interactive Wagon Wheel Enrichment State
  const [enrichmentModalOpen, setEnrichmentModalOpen] = useState<boolean>(false);
  const [enrichingDelivery, setEnrichingDelivery] = useState<DeliveryRecord | null>(null);
  const [tempWagonShot, setTempWagonShot] = useState<WagonWheelShot | null>(null);
  const [tempShotType, setTempShotType] = useState<string>("Cover Drive");
  const [tempLine, setTempLine] = useState<"outside_off" | "off_stump" | "middle" | "leg_stump" | "down_leg">("outside_off");
  const [tempLength, setTempLength] = useState<"yorker" | "full" | "good_length" | "back_of_length" | "short">("good_length");
  const [tempFielder, setTempFielder] = useState<string>("T. Ndlovu");
  const [tempWicketType, setTempWicketType] = useState<string>("caught");

  // Mode Guide Comparison Modal
  const [modeGuideModalOpen, setModeGuideModalOpen] = useState<boolean>(false);

  // Mode-specific inline scoring controls state
  const [selectedInlineSector, setSelectedInlineSector] = useState<string>("Cover");
  const [selectedInlineStroke, setSelectedInlineStroke] = useState<string>("Cover Drive");
  const [fullBowlingPace, setFullBowlingPace] = useState<"140_express" | "128_fast_med" | "88_off_spin" | "78_leg_spin" | "slower">("140_express");
  const [fullContactQuality, setFullContactQuality] = useState<"middled" | "edged" | "inside_edge" | "leading_edge" | "mishit" | "beaten">("middled");
  const [fullTrajectory, setFullTrajectory] = useState<"along_ground" | "aerial" | "flat_lofted" | "skied">("along_ground");
  const [fullFielderPosition, setFullFielderPosition] = useState<string>("Cover");

  // Retroactive Ball Amendment Audit Modal
  const [amendModalOpen, setAmendModalOpen] = useState<boolean>(false);
  const [amendingDelivery, setAmendingDelivery] = useState<DeliveryRecord | null>(null);
  const [amendmentReason, setAmendmentReason] = useState<string>("Umpire boundary correction");
  const [amendedRuns, setAmendedRuns] = useState<number>(4);

  // Offline simulation & queue
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);

  // Scorer Token Lease state (heartbeat TTL)
  const [leaseSeconds, setLeaseSeconds] = useState<number>(42);
  const [tokenLeaseId] = useState<string>("TKN-SCR-8849-KZN");
  const [handoverModalOpen, setHandoverModalOpen] = useState<boolean>(false);
  const [handoverTarget, setHandoverTarget] = useState<string>("Dale Benkenstein (Opposition Scorer)");
  const [handoverStatus, setHandoverStatus] = useState<string | null>(null);

  // Heartbeat timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLeaseSeconds(prev => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals
  const [wicketModalOpen, setWicketModalOpen] = useState<boolean>(false);
  const [dlsModalOpen, setDlsModalOpen] = useState<boolean>(false);
  const [scorecardModalOpen, setScorecardModalOpen] = useState<boolean>(false);
  const [wagonWheelModalOpen, setWagonWheelModalOpen] = useState<boolean>(false);
  const [dlsRevisedOvers, setDlsRevisedOvers] = useState<number>(18);
  const [dlsTarget, setDlsTarget] = useState<number>(165);
  const [commentaryFilter, setCommentaryFilter] = useState<"broadcast" | "hype" | "technical">("broadcast");
  const [wagonFilterRuns, setWagonFilterRuns] = useState<number | "all">("all");

  // ── 3-PHASE INTERACTIVE SCORING ENGINE STATE ─────
  // Phase 1: Enrich Delivery Context
  const [scoringPhase, setScoringPhase] = useState<1 | 2 | 3>(1);
  const [phase1Line, setPhase1Line] = useState<"outside_off" | "off_stump" | "middle" | "leg_stump" | "down_leg">("outside_off");
  const [phase1Length, setPhase1Length] = useState<"yorker" | "full" | "good_length" | "back_of_length" | "short">("good_length");
  const [phase1Pace, setPhase1Pace] = useState<"140_fast" | "130_fast_med" | "88_off_spin" | "78_leg_spin" | "slower">("130_fast_med");
  const [phase1Category, setPhase1Category] = useState<"front_foot" | "back_foot" | "defensive" | "innovative" | "edges">("front_foot");
  const [selectedPhase1Shot, setSelectedPhase1Shot] = useState<string>("Cover Drive");
  const [phase1Contact, setPhase1Contact] = useState<"middled" | "outside_edge" | "inside_edge" | "leading_edge" | "top_edge" | "mishit" | "beaten">("middled");
  const [phase1Trajectory, setPhase1Trajectory] = useState<"along_ground" | "aerial" | "lofted" | "defended">("along_ground");

  // Phase 2: Enrich Delivery Context, Select Placement on Wagon Wheel
  const [selectedPhase2Landing, setSelectedPhase2Landing] = useState<WagonWheelShot | null>(() => classifyWagonCoordinates(-0.65, -0.65, "R"));
  const [phase2HoverCoord, setPhase2HoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Phase 3: Recording / Scoring Runs, Extras, Wickets
  const [phase3Runs, setPhase3Runs] = useState<number>(4);
  const [phase3Extra, setPhase3Extra] = useState<"none" | "wd" | "nb" | "b" | "lb" | "pen">("none");
  const [phase3IsWicket, setPhase3IsWicket] = useState<boolean>(false);
  const [phase3WicketType, setPhase3WicketType] = useState<string>("caught");
  const [phase3Fielder, setPhase3Fielder] = useState<string>("Deep Extra Cover");

  // ── EVENT-SOURCED REDUCER ("DERIVE, DON'T STORE") ─────
  const matchDerivedState = useMemo(() => {
    const baseTotalRuns = 142;
    const baseWickets = 3;
    const baseTotalLegalBalls = 14 * 6 + 2; // 86 balls

    let currentStrikerState = { ...baseStriker };
    let currentNonStrikerState = { ...baseNonStriker };
    let bowlerState = { name: "T. Ndlovu", oversBowled: 3.2, runsConceded: 28, wickets: 1, maidens: 0 };

    let addedRuns = 0;
    let addedWickets = 0;
    let addedLegalBalls = 0;
    let extrasBreakdown = { wides: 0, noBalls: 0, byes: 0, legByes: 0 };

    // Track strike rotation through deliveries added beyond initial set
    const userDeliveries = deliveries.slice(2); // Initial two are already part of base
    for (let i = userDeliveries.length - 1; i >= 0; i--) {
      const d = userDeliveries[i];
      addedRuns += d.totalRuns;
      if (d.isWicket) addedWickets += 1;
      if (d.isLegalDelivery) addedLegalBalls += 1;

      if (d.extraType === "wd") extrasBreakdown.wides += d.extraRuns;
      if (d.extraType === "nb") extrasBreakdown.noBalls += d.extraRuns;
      if (d.extraType === "b") extrasBreakdown.byes += d.extraRuns;
      if (d.extraType === "lb") extrasBreakdown.legByes += d.extraRuns;

      // Update batter
      if (d.runsOffBat > 0 || d.isLegalDelivery) {
        currentStrikerState.runs += d.runsOffBat;
        if (d.isLegalDelivery) currentStrikerState.balls += 1;
        if (d.runsOffBat === 4) currentStrikerState.fours += 1;
        if (d.runsOffBat === 6) currentStrikerState.sixes += 1;
      }

      // Bowler figures
      bowlerState.runsConceded += d.totalRuns;
      if (d.isWicket) bowlerState.wickets += 1;

      // Strike rotation on odd runs
      if (d.runsOffBat % 2 === 1 || (d.extraType === "wd" && d.totalRuns % 2 === 1)) {
        const temp = currentStrikerState;
        currentStrikerState = currentNonStrikerState;
        currentNonStrikerState = temp;
      }

      // Strike rotation at over end
      const totalLegal = baseTotalLegalBalls + addedLegalBalls;
      if (totalLegal % 6 === 0 && d.isLegalDelivery) {
        const temp = currentStrikerState;
        currentStrikerState = currentNonStrikerState;
        currentNonStrikerState = temp;
      }
    }

    const totalRuns = baseTotalRuns + addedRuns;
    const totalWickets = baseWickets + addedWickets;
    const totalBalls = baseTotalLegalBalls + addedLegalBalls;
    const completedOvers = Math.floor(totalBalls / 6);
    const remainderBalls = totalBalls % 6;
    const oversStr = `${completedOvers}.${remainderBalls}`;

    const currentRR = totalBalls > 0 ? ((totalRuns / totalBalls) * 6).toFixed(2) : "0.00";
    const target = dlsTarget || 187;
    const runsRequired = Math.max(0, target - totalRuns);
    const ballsRemaining = Math.max(0, 120 - totalBalls);
    const requiredRR = ballsRemaining > 0 ? ((runsRequired / ballsRemaining) * 6).toFixed(2) : "0.00";

    const queuedCount = deliveries.filter(d => d.syncStatus === "queued").length;

    return {
      totalRuns,
      totalWickets,
      totalBalls,
      oversStr,
      completedOvers,
      remainderBalls,
      currentRR,
      requiredRR,
      target,
      runsRequired,
      ballsRemaining,
      striker: currentStrikerState,
      nonStriker: currentNonStrikerState,
      bowler: bowlerState,
      extras: extrasBreakdown,
      wides: extrasBreakdown.wides,
      noBalls: extrasBreakdown.noBalls,
      byes: extrasBreakdown.byes,
      legByes: extrasBreakdown.legByes,
      extrasTotal: extrasBreakdown.wides + extrasBreakdown.noBalls + extrasBreakdown.byes + extrasBreakdown.legByes,
      fallOfWickets: [
        { wicketNumber: 1, score: 38, over: "4.1", batterName: "L. Campbell", wicket: 1, player: "L. Campbell" },
        { wicketNumber: 2, score: 84, over: "8.5", batterName: "G. Jenkins", wicket: 2, player: "G. Jenkins" },
        { wicketNumber: 3, score: 112, over: "12.3", batterName: "T. van Rooyen", wicket: 3, player: "T. van Rooyen" },
      ],
      queuedCount,
    };
  }, [deliveries, baseStriker, baseNonStriker, dlsTarget]);

  // Current over delivery bubbles
  const currentOverDeliveries = deliveries.filter(d => d.overIndex === matchDerivedState.completedOvers);

  // Filtered deliveries for current active striker wagon wheel
  const strikerDeliveries = useMemo(() => {
    return deliveries.filter(d => d.batter === matchDerivedState.striker.name && d.shot);
  }, [deliveries, matchDerivedState.striker.name]);

  // Striker wagon stats
  const strikerWagonStats = useMemo(() => {
    let offRuns = 0;
    let legRuns = 0;
    let totalRuns = 0;
    strikerDeliveries.forEach(d => {
      totalRuns += d.runsOffBat;
      if (d.shot?.side === "OFF") offRuns += d.runsOffBat;
      else legRuns += d.runsOffBat;
    });
    return {
      offRuns,
      legRuns,
      offPct: totalRuns > 0 ? Math.round((offRuns / totalRuns) * 100) : 50,
      legPct: totalRuns > 0 ? Math.round((legRuns / totalRuns) * 100) : 50,
      shotCount: strikerDeliveries.length,
    };
  }, [strikerDeliveries]);

  // ── PHASE 1: SCORE BALL (RESULT-FIRST COMMIT) ─────
  const handleScoreBall = (
    runVal: number,
    extra?: "wd" | "nb" | "b" | "lb",
    isWkt?: boolean,
    wktType?: string,
    customWagonShot?: WagonWheelShot
  ) => {
    const isLegal = extra !== "wd" && extra !== "nb";
    const extraVal = extra === "wd" || extra === "nb" ? 1 : 0;
    const totalAdded = runVal + extraVal;

    // Default wagon coordinates if not provided
    let defaultShot: WagonWheelShot | undefined = customWagonShot;
    if (!defaultShot && (runVal > 0 || isWkt)) {
      // Auto-assign sensible default coordinates based on outcome
      if (runVal === 4) defaultShot = classifyWagonCoordinates(-0.75, -0.65, activeBatHand); // Deep Extra Cover
      else if (runVal === 6) defaultShot = classifyWagonCoordinates(0.68, -0.72, activeBatHand); // Deep Mid-Wicket
      else if (runVal === 1) defaultShot = classifyWagonCoordinates(-0.45, -0.35, activeBatHand); // Cover Point
      else if (runVal === 2) defaultShot = classifyWagonCoordinates(0.55, -0.45, activeBatHand); // Mid-Wicket
      else if (runVal === 3) defaultShot = classifyWagonCoordinates(-0.68, -0.25, activeBatHand); // Deep Point
      else if (isWkt) defaultShot = classifyWagonCoordinates(0.52, -0.38, activeBatHand); // Mid-Wicket catch
    }

    // Default shot stroke suggestion
    let defaultStroke = "Drive";
    if (runVal === 4) defaultStroke = "Cover Drive";
    else if (runVal === 6) defaultStroke = "Lofted Drive";
    else if (runVal === 1) defaultStroke = "Push into Gap";
    else if (runVal === 2) defaultStroke = "Flick through Wicket";
    else if (runVal === 0) defaultStroke = "Forward Defence";
    if (defaultShot) defaultShot.shotType = defaultStroke;

    const zoneName = defaultShot?.sector || "Cover";

    // Build broadcast commentary
    let comm = "";
    if (isWkt) {
      comm = `OUT! ${matchDerivedState.striker.name} ${wktType || "caught"} at ${zoneName}! Breakthrough for ${matchDerivedState.bowler.name}!`;
    } else if (runVal === 6) {
      comm = `SIX! Towering stroke over ${zoneName}! ${matchDerivedState.striker.name} dispatches it into the pavilion trees.`;
    } else if (runVal === 4) {
      comm = `FOUR! Glorious ${defaultStroke} through ${zoneName}. Pure crack off the bat.`;
    } else if (extra === "wd") {
      comm = `Wide signaled by umpire. Strayed outside off pole.`;
    } else if (extra === "nb") {
      comm = `NO BALL! Overstepping on crease. Free hit signaled for next delivery!`;
    } else if (runVal === 0) {
      comm = `Solid defence towards ${zoneName}. Dot ball.`;
    } else {
      comm = `Pushed into the gap at ${zoneName} for ${runVal} run${runVal > 1 ? "s" : ""}.`;
    }

    const nextTimestamp = `${matchDerivedState.completedOvers}.${matchDerivedState.remainderBalls + (isLegal ? 1 : 0)}`;

    const newRecord: DeliveryRecord = {
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      overIndex: matchDerivedState.completedOvers,
      ballInOver: matchDerivedState.remainderBalls + (isLegal ? 1 : 0),
      isLegalDelivery: isLegal,
      bowler: matchDerivedState.bowler.name,
      batter: matchDerivedState.striker.name,
      batterHand: activeBatHand,
      runsOffBat: runVal,
      extraType: extra,
      extraRuns: extraVal,
      totalRuns: totalAdded,
      isWicket: !!isWkt,
      wicketType: wktType,
      fielder: isWkt ? "T. Ndlovu" : undefined,
      shot: defaultShot,
      pitchDelivery: { line: "outside_off", length: runVal === 6 ? "full" : "good_length", paceType: "fast" },
      trajectory: runVal === 6 ? "lofted" : runVal === 4 ? "along_ground" : "along_ground",
      contactQuality: "middle",
      verificationStatus: captureProfile === "QUICK" ? "phase1_only" : "verified",
      commentary: comm,
      timestamp: nextTimestamp,
      syncStatus: isOfflineSimulated ? "queued" : "synced",
    };

    // Prepend to deliveries (latest first)
    setDeliveries(prev => [newRecord, ...prev]);

    // If in STANDARD or FULL profile, open Phase 2 Wagon Wheel Enrichment HUD immediately
    if (captureProfile === "STANDARD" || captureProfile === "FULL") {
      setEnrichingDelivery(newRecord);
      setTempWagonShot(defaultShot || classifyWagonCoordinates(-0.7, -0.6, activeBatHand));
      setTempShotType(defaultStroke);
      setTempLine("outside_off");
      setTempLength(runVal === 6 ? "full" : "good_length");
      setTempFielder("T. Ndlovu");
      setTempWicketType(wktType || "caught");
      setEnrichmentModalOpen(true);
    }
  };

  // ── 3-PHASE SEQUENTIAL SCORING COMMIT ENGINE ─────
  const handleCommitThreePhaseBall = () => {
    const runVal = phase3Runs;
    const extra = phase3Extra === "none" ? undefined : phase3Extra;
    const isWkt = phase3IsWicket;
    const wktType = phase3IsWicket ? phase3WicketType : undefined;
    const isLegal = extra !== "wd" && extra !== "nb";
    const extraVal = extra === "wd" || extra === "nb" ? 1 : extra === "pen" ? 5 : 0;
    const totalAdded = runVal + extraVal;

    // Spatial Wagon Shot from Phase 2
    const finalShot: WagonWheelShot = selectedPhase2Landing
      ? { ...selectedPhase2Landing, shotType: selectedPhase1Shot, batHand: activeBatHand }
      : { ...classifyWagonCoordinates(-0.65, -0.65, activeBatHand), shotType: selectedPhase1Shot, batHand: activeBatHand };

    const zoneName = finalShot.fieldingZone || finalShot.sector || "Cover";
    const paceSpeed = phase1Pace === "140_fast" ? "142 km/h" : phase1Pace === "130_fast_med" ? "131 km/h" : phase1Pace === "88_off_spin" ? "88 km/h" : phase1Pace === "78_leg_spin" ? "78 km/h" : "114 km/h";
    const lineLabel = phase1Line.replace(/_/g, " ");
    const lengthLabel = phase1Length.replace(/_/g, " ");
    const contactLabel = phase1Contact.replace(/_/g, " ");

    // Dynamic AI Broadcast Commentary synthesizing Phase 1 + Phase 2 + Phase 3
    let comm = "";
    if (isWkt) {
      comm = `WICKET! ${lengthLabel} ball ${lineLabel} (${paceSpeed}). ${matchDerivedState.striker.name} goes for a ${selectedPhase1Shot} (${contactLabel}), ${wktType || "caught"} by ${phase3Fielder || zoneName}! Breakthrough for ${matchDerivedState.bowler.name}!`;
    } else if (runVal === 6) {
      comm = `SIX! ${lengthLabel} delivery ${lineLabel} at ${paceSpeed}. ${matchDerivedState.striker.name} launches a colossal ${selectedPhase1Shot} (${contactLabel}), cleared high over ${zoneName} (${finalShot.distanceMeters || 80}m) into the stands!`;
    } else if (runVal === 4) {
      comm = `FOUR! ${lengthLabel} ${lineLabel} (${paceSpeed}). Exquisite ${selectedPhase1Shot} (${contactLabel}) by ${matchDerivedState.striker.name}, piercing through ${zoneName} to the fence!`;
    } else if (extra === "wd") {
      comm = `Wide signaled by umpire. Strayed down leg/off. 1 extra run added.`;
    } else if (extra === "nb") {
      comm = `NO BALL! Overstepping on bowling crease (${paceSpeed}). Free hit signaled.`;
    } else if (runVal === 0) {
      comm = `${lengthLabel} delivery ${lineLabel} (${paceSpeed}). Firm ${selectedPhase1Shot} (${contactLabel}) straight to the fielder at ${zoneName}. Dot ball.`;
    } else {
      comm = `${lengthLabel} ${lineLabel} (${paceSpeed}). ${selectedPhase1Shot} (${contactLabel}) worked neatly into ${zoneName} for ${runVal} run${runVal > 1 ? "s" : ""}.`;
    }

    const nextTimestamp = `${matchDerivedState.completedOvers}.${matchDerivedState.remainderBalls + (isLegal ? 1 : 0)}`;

    const newRecord: DeliveryRecord = {
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      overIndex: matchDerivedState.completedOvers,
      ballInOver: matchDerivedState.remainderBalls + (isLegal ? 1 : 0),
      isLegalDelivery: isLegal,
      bowler: matchDerivedState.bowler.name,
      batter: matchDerivedState.striker.name,
      batterHand: activeBatHand,
      runsOffBat: runVal,
      extraType: extra,
      extraRuns: extraVal,
      totalRuns: totalAdded,
      isWicket: !!isWkt,
      wicketType: wktType,
      fielder: isWkt ? (phase3Fielder || `Fielder at ${zoneName}`) : undefined,
      shot: finalShot,
      pitchDelivery: {
        line: phase1Line,
        length: phase1Length,
        paceType: phase1Pace.includes("spin") ? (phase1Pace.includes("off") ? "off_spin" : "leg_spin") : (phase1Pace.includes("140") ? "fast" : "medium"),
      },
      trajectory: phase1Trajectory,
      contactQuality: phase1Contact === "middled" ? "middle" : (phase1Contact === "beaten" ? "uncontrolled" : "edge"),
      verificationStatus: "verified",
      commentary: comm,
      timestamp: nextTimestamp,
      syncStatus: isOfflineSimulated ? "queued" : "synced",
    };

    setDeliveries(prev => [newRecord, ...prev]);

    // Reset cleanly to Phase 1 ready for the next delivery
    setScoringPhase(1);
    setPhase3Runs(1);
    setPhase3Extra("none");
    setPhase3IsWicket(false);
  };

  // ── PHASE 2: SAVE ENRICHMENT (HOW DID IT HAPPEN?) ─────
  const handleSaveEnrichment = () => {
    if (!enrichingDelivery || !tempWagonShot) return;

    const enrichedShot: WagonWheelShot = {
      ...tempWagonShot,
      shotType: tempShotType,
      batHand: activeBatHand,
    };

    setDeliveries(prev =>
      prev.map(d =>
        d.id === enrichingDelivery.id
          ? {
              ...d,
              shot: enrichedShot,
              pitchDelivery: {
                line: tempLine,
                length: tempLength,
                paceType: "fast",
              },
              fielder: d.isWicket ? tempFielder : d.fielder,
              wicketType: d.isWicket ? tempWicketType : d.wicketType,
              verificationStatus: "verified",
              commentary: `${d.runsOffBat === 4 ? "FOUR" : d.runsOffBat === 6 ? "SIX" : d.isWicket ? "OUT" : `${d.runsOffBat} runs`}! ${enrichedShot.shotType} through ${enrichedShot.sector} (${enrichedShot.side} Side).`,
            }
          : d
      )
    );

    setEnrichmentModalOpen(false);
    setEnrichingDelivery(null);
  };

  // ── PHASE 3: AUDIT & AMENDMENT ─────
  const handleSaveAmendment = () => {
    if (!amendingDelivery) return;
    setDeliveries(prev =>
      prev.map(d =>
        d.id === amendingDelivery.id
          ? {
              ...d,
              runsOffBat: amendedRuns,
              totalRuns: amendedRuns + (d.extraRuns || 0),
              verificationStatus: "amended",
              amendmentReason,
              commentary: `[AMENDED: ${amendmentReason}] Score corrected to ${amendedRuns} runs.`,
            }
          : d
      )
    );
    setAmendModalOpen(false);
    setAmendingDelivery(null);
  };

  // True Atomic Undo (Pop newest event atomically)
  const handleUndoLastBall = () => {
    if (deliveries.length <= 2) return; // preserve initial baseline
    setDeliveries(prev => prev.slice(1));
  };

  // Offline Sync Replay Simulator
  const handleReplaySyncQueue = () => {
    if (matchDerivedState.queuedCount === 0) return;
    setIsSyncingQueue(true);
    setTimeout(() => {
      setDeliveries(prev =>
        prev.map(d => (d.syncStatus === "queued" ? { ...d, syncStatus: "synced" } : d))
      );
      setIsSyncingQueue(false);
      setIsOfflineSimulated(false);
    }, 800);
  };

  // Handover confirmation
  const handleExecuteHandover = () => {
    setHandoverStatus("Transferring token lease #TKN-SCR-8849-KZN with SHA-256 state hash verification...");
    setTimeout(() => {
      setHandoverStatus(`Success! Token lease transferred to ${handoverTarget}. Read-only broadcast mode engaged.`);
      setTimeout(() => {
        setHandoverModalOpen(false);
        setHandoverStatus(null);
      }, 1500);
    }, 1000);
  };

  // Quick Sector Picker buttons for rapid 1-tap placement
  const QUICK_SECTORS = [
    { label: "Cover", x: -0.75, y: -0.65 },
    { label: "Deep Point", x: -0.85, y: -0.15 },
    { label: "Third Man", x: -0.65, y: 0.55 },
    { label: "Long Off", x: -0.32, y: -0.88 },
    { label: "Straight", x: 0.0, y: -0.92 },
    { label: "Long On", x: 0.32, y: -0.88 },
    { label: "Mid-Wicket", x: 0.75, y: -0.65 },
    { label: "Deep Square", x: 0.85, y: -0.15 },
    { label: "Fine Leg", x: 0.65, y: 0.55 },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(3, 7, 18, 0.92)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1260px",
          maxHeight: "95vh",
          background: D.surf1,
          border: `1px solid ${D.borderMed}`,
          borderRadius: D.xl,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          overflow: "hidden",
          color: D.textPrimary,
        }}
      >
        {/* Top Control & Heartbeat Header */}
        <div
          style={{
            padding: "10px 18px",
            background: D.surf0,
            borderBottom: `1px solid ${D.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Match Brand & Primary Navigation Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: `${D.emerald}20`,
                padding: "4px 10px",
                borderRadius: D.pill,
                border: `1px solid ${D.emerald}40`,
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: D.emerald,
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
              <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.emerald, letterSpacing: "0.05em" }}>
                3-PHASE SCORING SUITE
              </span>
            </div>

            {/* DEDICATED MAIN TABS: LIVE SCORER, FULL SCORECARD, ANALYTICS */}
            <div style={{ display: "flex", background: D.surf2, borderRadius: D.pill, padding: "2px", border: `1px solid ${D.borderMed}` }}>
              {[
                { id: "scorer", label: "⚡ Live Scorer" },
                { id: "scorecard", label: "📊 Full Scorecard" },
                { id: "analytics", label: "📈 Match Analytics" },
                { id: "commentary", label: "🎙️ Commentary & Log" },
              ].map(tab => {
                const isActive = activeMainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id as any)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: D.pill,
                      border: "none",
                      background: isActive ? D.sky : "transparent",
                      color: isActive ? "#000" : D.textSecondary,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Management & Resilience Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {/* LIVE MATCH SETTINGS MODAL TRIGGER */}
            <button
              onClick={() => setMatchSettingsModalOpen(true)}
              style={{
                padding: "5px 11px",
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.borderMed}`,
                color: D.textPrimary,
                fontFamily: D.head,
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
              title="Configure Match Overs, DLS Target, Telemetry Toggles, & Scoring Automations"
            >
              ⚙️ Match Settings
            </button>

            {/* LINEUPS & BOWLER ROTATION MODAL TRIGGER */}
            <button
              onClick={() => setLineupsModalOpen(true)}
              style={{
                padding: "5px 11px",
                borderRadius: D.pill,
                background: `${D.emerald}18`,
                border: `1px solid ${D.emerald}55`,
                color: D.emerald,
                fontFamily: D.head,
                fontSize: "11px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
              title="Manage Batting Pairs, Lineup Order, and Bowler Rotations"
            >
              👥 Lineups & Bowlers
            </button>

            {/* FIELD PLACEMENT EDITOR TRIGGER */}
            <button
              onClick={() => setFieldEditorOpen(true)}
              style={{
                padding: "5px 11px",
                borderRadius: D.pill,
                background: `${D.sky}18`,
                border: `1px solid ${D.sky}55`,
                color: D.sky,
                fontFamily: D.head,
                fontSize: "11px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
              title="Interactive 11-Man Field Placement Editor & Powerplay Circle Validation"
            >
              🛡️ Field Editor
            </button>

            {/* Quick Toggle: Bowler Telemetry & Pitch Map */}
            <button
              onClick={() =>
                setMatchSettings(prev => ({
                  ...prev,
                  showPitchHeatmap: !prev.showPitchHeatmap,
                }))
              }
              style={{
                padding: "5px 10px",
                borderRadius: D.pill,
                background: matchSettings.showPitchHeatmap ? `${D.emerald}25` : D.surf2,
                border: `1px solid ${matchSettings.showPitchHeatmap ? D.emerald : D.border}`,
                color: matchSettings.showPitchHeatmap ? D.emerald : D.textMuted,
                fontFamily: D.head,
                fontSize: "10px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Enable or disable Bowler Delivery Telemetry & Pitch Location Map during live scoring"
            >
              <span>⚡ Telemetry & Pitch Map:</span>
              <strong style={{ color: matchSettings.showPitchHeatmap ? D.emerald : D.amber }}>
                {matchSettings.showPitchHeatmap ? "ON" : "OFF"}
              </strong>
            </button>

            {/* Quick Toggle: Hawkeye Radar */}
            <button
              onClick={() =>
                setMatchSettings(prev => ({
                  ...prev,
                  showProHawkeyeRadar: !prev.showProHawkeyeRadar,
                }))
              }
              style={{
                padding: "5px 9px",
                borderRadius: D.pill,
                background: matchSettings.showProHawkeyeRadar ? `${D.indigo}20` : D.surf2,
                border: `1px solid ${matchSettings.showProHawkeyeRadar ? D.indigo : D.border}`,
                color: matchSettings.showProHawkeyeRadar ? D.indigo : D.textMuted,
                fontFamily: D.mono,
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              title="Toggle Full Pro Analytics & Hawkeye Radar On/Off"
            >
              👁️ Radar: {matchSettings.showProHawkeyeRadar ? "ON" : "OFF"}
            </button>

            {/* Quick Toggle: Pitch Length Heatmap */}
            <button
              onClick={() =>
                setMatchSettings(prev => ({
                  ...prev,
                  showPitchHeatmap: !prev.showPitchHeatmap,
                }))
              }
              style={{
                padding: "5px 9px",
                borderRadius: D.pill,
                background: matchSettings.showPitchHeatmap ? `${D.emerald}20` : D.surf2,
                border: `1px solid ${matchSettings.showPitchHeatmap ? D.emerald : D.border}`,
                color: matchSettings.showPitchHeatmap ? D.emerald : D.textMuted,
                fontFamily: D.mono,
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              title="Toggle 2D Pitch Length & Line Heatmap On/Off"
            >
              🌿 Pitch Map: {matchSettings.showPitchHeatmap ? "ON" : "OFF"}
            </button>

            {/* 3-Phase Capture Profile Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ display: "flex", background: D.surf2, borderRadius: D.pill, padding: "2px", border: `1px solid ${D.border}` }}>
                {(["QUICK", "STANDARD", "FULL"] as const).map(p => {
                  const isActive = captureProfile === p;
                  const activeBg = p === "QUICK" ? D.amber : p === "STANDARD" ? D.sky : D.indigo;
                  const activeColor = p === "QUICK" ? "#000" : "#fff";
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        setCaptureProfile(p);
                        if (p === "QUICK") setRightPanelTab("quicklog");
                        else if (p === "STANDARD") setRightPanelTab("wagon");
                        else if (p === "FULL") setRightPanelTab("pitchmap");
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: D.pill,
                        border: "none",
                        background: isActive ? activeBg : "transparent",
                        color: isActive ? activeColor : D.textMuted,
                        fontFamily: D.head,
                        fontSize: "10px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>{p === "QUICK" ? "⚡ Quick" : p === "STANDARD" ? "🎯 Standard" : "🔬 Full"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Batting Hand Stance Switcher */}
            <button
              onClick={() => setActiveBatHand(prev => (prev === "R" ? "L" : "R"))}
              style={{
                padding: "4px 8px",
                borderRadius: D.pill,
                background: activeBatHand === "R" ? `${D.sky}20` : `${D.amber}20`,
                border: `1px solid ${activeBatHand === "R" ? D.sky : D.amber}`,
                color: activeBatHand === "R" ? D.sky : D.amber,
                fontFamily: D.mono,
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              title="Toggle Batter Stance (Mirrors Off/Leg on Wagon Wheel)"
            >
              🏏 {activeBatHand === "R" ? "RHB" : "LHB"}
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dynamic Mode-Specific Banner */}
        <div
          style={{
            padding: "8px 20px",
            background:
              captureProfile === "QUICK"
                ? `linear-gradient(90deg, ${D.amber}22, ${D.surf2})`
                : captureProfile === "STANDARD"
                ? `linear-gradient(90deg, ${D.sky}22, ${D.surf2})`
                : `linear-gradient(90deg, ${D.indigo}30, ${D.surf2})`,
            borderBottom: `1px solid ${D.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11px",
            color: D.textSecondary,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {captureProfile === "QUICK" && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ padding: "2px 8px", borderRadius: D.pill, background: D.amber, color: "#000", fontFamily: D.head, fontSize: "10px", fontWeight: 800 }}>
                  ⚡ QUICK 1-TAP MODE
                </span>
                <span style={{ color: D.textPrimary }}>
                  Zero modal interruptions · Rapid ball entry · Auto-estimated ball vectors · Instant strike rotation
                </span>
              </span>
            )}

            {captureProfile === "STANDARD" && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ padding: "2px 8px", borderRadius: D.pill, background: D.sky, color: "#000", fontFamily: D.head, fontSize: "10px", fontWeight: 800 }}>
                  🎯 STANDARD MATCH MODE
                </span>
                <span style={{ color: D.textPrimary }}>
                  Phase 1 (Score) + Phase 2 (360° Wagon-Wheel Vectoring & Stroke Category) · Interactive Field Placement
                </span>
              </span>
            )}

            {captureProfile === "FULL" && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ padding: "2px 8px", borderRadius: D.pill, background: D.indigo, color: "#fff", fontFamily: D.head, fontSize: "10px", fontWeight: 800 }}>
                  🔬 PRO BROADCAST & TELEMETRY
                </span>
                <span style={{ color: D.textPrimary }}>
                  Full Suite: 360° Vectors + 5-Zone Pitch Radar + Bowling Pace/Spin + Contact Quality + Fielder Tracking
                </span>
              </span>
            )}
          </div>

          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Batter Stance: <strong style={{ color: activeBatHand === "R" ? D.sky : D.amber }}>{activeBatHand === "R" ? "RHB (Right Hand)" : "LHB (Left Hand)"}</strong></span>
            <button
              onClick={() => setModeGuideModalOpen(true)}
              style={{
                background: "transparent",
                border: "none",
                color: D.sky,
                fontFamily: D.mono,
                fontSize: "10px",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Compare 3 Modes
            </button>
          </div>
        </div>

        {/* Active Main Tab 1: Live Scorer Console */}
        {activeMainTab === "scorer" && (
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", minHeight: 0, overflow: "hidden" }}>
          {/* Left Column: Live Scoreboard, Striker HUD & Scoring Controls */}
          <div
            style={{
              padding: "16px 20px",
              borderRight: `1px solid ${D.border}`,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Primary Live Broadcast Scoreboard Banner */}
            <div
              style={{
                padding: "16px",
                background: `linear-gradient(135deg, ${D.surf0}, ${D.surf2})`,
                borderRadius: D.lg,
                border: `1px solid ${D.borderMed}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 700, color: D.textMuted }}>
                  {homeTitle.toUpperCase()} 1ST INNINGS
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "2px" }}>
                  <span style={{ fontFamily: D.mono, fontSize: "38px", fontWeight: 800, color: D.textPrimary }}>
                    {matchDerivedState.totalRuns}/{matchDerivedState.totalWickets}
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: "16px", color: D.textMuted }}>
                    ({matchDerivedState.oversStr} / 20 ov)
                  </span>
                </div>
                <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.emerald, marginTop: "2px" }}>
                  Run Rate: {matchDerivedState.currentRR} · Target: {matchDerivedState.target} (Req: {matchDerivedState.requiredRR})
                </div>
              </div>

              {/* Quick Undo Last Ball Button (Atomic Reducer) */}
              <button
                onClick={handleUndoLastBall}
                className="pressBtn"
                style={{
                  padding: "8px 14px",
                  borderRadius: D.md,
                  background: D.surf3,
                  border: `1px solid ${D.border}`,
                  color: D.textSecondary,
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                ↩ Undo Last Ball
              </button>
            </div>

            {/* Captain's Tactical Cockpit & Win Predictor */}
            <CaptainTacticalCockpit
              theme={D}
              currentRunRate={Number(matchDerivedState.currentRR)}
              requiredRunRate={Number(matchDerivedState.requiredRR)}
              targetRuns={matchDerivedState.target}
              currentScore={matchDerivedState.totalRuns}
            />

            {/* CSA Fast Bowler Workload & Spell Fatigue Monitor */}
            <BowlerWorkloadMonitor theme={D} />

            {/* Active Batters & Bowler Telemetry HUD */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "10px" }}>
              {/* Batter Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {/* Batters Header with Strike Swapping & Squad Action */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px" }}>
                  <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, letterSpacing: "0.05em" }}>
                    BATTING PARTNERSHIP
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => {
                        const sId = activeStrikerId;
                        const nsId = activeNonStrikerId;
                        setActiveStrikerId(nsId);
                        setActiveNonStrikerId(sId);
                      }}
                      style={{
                        padding: "2px 7px",
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.sky,
                        fontFamily: D.mono,
                        fontSize: "9px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      title="Rotate Strike (Swap Striker & Non-Striker)"
                    >
                      ⇄ Swap Strike
                    </button>
                    <button
                      onClick={() => setLineupsModalOpen(true)}
                      style={{
                        padding: "2px 7px",
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.emerald,
                        fontFamily: D.mono,
                        fontSize: "9px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      title="Open Batting Lineup & Bowlers Manager"
                    >
                      👥 Lineup
                    </button>
                  </div>
                </div>

                {/* Striker */}
                <div
                  style={{
                    padding: "10px 12px",
                    background: `${D.emerald}14`,
                    border: `1px solid ${D.emerald}44`,
                    borderRadius: D.md,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: D.emerald }} />
                      <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.emerald }}>
                        {matchDerivedState.striker.name} *
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: "9px", padding: "1px 5px", borderRadius: D.pill, background: `${D.sky}20`, color: D.sky, border: `1px solid ${D.sky}40` }} title="Predefined from player master profile">
                        🔒 {activeBatHand === 'R' ? 'RHB' : 'LHB'} Predefined
                      </span>
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                      {matchDerivedState.striker.fours}x4, {matchDerivedState.striker.sixes}x6 · SR:{" "}
                      {((matchDerivedState.striker.runs / Math.max(1, matchDerivedState.striker.balls)) * 100).toFixed(1)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: D.mono, fontSize: "16px", fontWeight: 800, color: D.textPrimary }}>
                      {matchDerivedState.striker.runs}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                      ({matchDerivedState.striker.balls}b)
                    </div>
                  </div>
                </div>

                {/* Non-Striker */}
                <div
                  style={{
                    padding: "10px 12px",
                    background: D.surf0,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.md,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textSecondary }}>
                      {matchDerivedState.nonStriker.name}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                      {matchDerivedState.nonStriker.fours}x4, {matchDerivedState.nonStriker.sixes}x6
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: D.mono, fontSize: "16px", fontWeight: 800, color: D.textPrimary }}>
                      {matchDerivedState.nonStriker.runs}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                      ({matchDerivedState.nonStriker.balls}b)
                    </div>
                  </div>
                </div>
              </div>

              {/* Bowler Card */}
              <div
                style={{
                  padding: "10px 12px",
                  background: D.surf0,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.md,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: D.mono, fontSize: "9px", color: D.sky, fontWeight: 700, letterSpacing: "0.05em" }}>
                      CURRENT BOWLER
                    </span>
                    <button
                      onClick={() => setLineupsModalOpen(true)}
                      style={{
                        padding: "1px 6px",
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.sky,
                        fontFamily: D.mono,
                        fontSize: "9px",
                        cursor: "pointer",
                      }}
                    >
                      Change ⇄
                    </button>
                  </div>
                  <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, marginTop: "4px" }}>
                    {matchDerivedState.bowler.name}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>{matchDerivedState.bowler.bowlingStyle || 'Right-arm Fast'}</span>
                    <span style={{ padding: "0 4px", borderRadius: D.pill, background: `${D.indigo}20`, color: D.indigo, fontSize: "8px" }}>🔒 Predefined</span>
                    <span>· {matchSettings.maxOversPerBowler} ov quota</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "8px", paddingTop: "6px", borderTop: `1px solid ${D.border}` }}>
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                    {matchDerivedState.bowler.oversBowled} / {matchSettings.maxOversPerBowler}.0 ov
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 800, color: D.sky }}>
                    {matchDerivedState.bowler.wickets}/{matchDerivedState.bowler.runsConceded}
                  </span>
                </div>
              </div>
            </div>

            {/* Over Progress Bubble Strip & Phase 3 Verification Status */}
            <div style={{ padding: "10px 14px", background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, letterSpacing: "0.06em" }}>
                  OVER {matchDerivedState.completedOvers + 1} DELIVERIES (PHASE 1-3 AUDIT)
                </span>
                <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                  {currentOverDeliveries.length} / 6 legal balls
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {currentOverDeliveries.length === 0 ? (
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted, fontStyle: "italic" }}>
                    Ready for ball 1...
                  </span>
                ) : (
                  currentOverDeliveries.map((d, i) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setAmendingDelivery(d);
                        setAmendedRuns(d.runsOffBat);
                        setAmendModalOpen(true);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: D.pill,
                        background: d.isWicket
                          ? D.rose
                          : d.runsOffBat === 4
                          ? D.sky
                          : d.runsOffBat === 6
                          ? D.emerald
                          : D.surf2,
                        border: `1px solid ${d.verificationStatus === "phase1_only" ? D.amber : D.border}`,
                        color: d.isWicket || d.runsOffBat >= 4 ? "#fff" : D.textPrimary,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontFamily: D.mono,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      title={`Ball ${d.timestamp} · Click to amend/audit`}
                    >
                      <span>{d.isWicket ? "W" : d.extraType ? `${d.runsOffBat}${d.extraType}` : d.runsOffBat}</span>
                      {d.shot ? (
                        <span style={{ fontSize: "9px", opacity: 0.85 }}>🎯</span>
                      ) : (
                        <span style={{ fontSize: "9px", color: D.amber }}>⚠️</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── MODE-SPECIFIC SCORING DECK ── */}

            {/* 1. QUICK MODE: ULTRA-RAPID 1-TAP SCORING DECK */}
            {captureProfile === "QUICK" && (
              <div style={{ padding: "16px", background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.amber}55`, display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.amber, letterSpacing: "0.06em" }}>
                      ⚡ 1-TAP QUICK PAD (ZERO MODAL LATENCY)
                    </span>
                  </div>
                  <span style={{ fontFamily: D.mono, fontSize: "10px", padding: "2px 6px", borderRadius: D.pill, background: `${D.amber}25`, color: D.amber }}>
                    Direct Commit Active
                  </span>
                </div>

                {/* Big High-Touch Runs Keypad */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                  {[0, 1, 2, 3, 4, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => handleScoreBall(num)}
                      className="pressBtn"
                      style={{
                        padding: "16px 0",
                        borderRadius: D.md,
                        border: num === 4 ? `2px solid ${D.sky}` : num === 6 ? `2px solid ${D.emerald}` : `1px solid ${D.border}`,
                        background:
                          num === 0
                            ? D.surf2
                            : num === 4
                            ? `${D.sky}25`
                            : num === 6
                            ? `${D.emerald}25`
                            : D.surf3,
                        color: num === 4 ? D.sky : num === 6 ? D.emerald : D.textPrimary,
                        fontFamily: D.mono,
                        fontSize: "24px",
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      {num === 0 ? "•" : num}
                    </button>
                  ))}
                </div>

                {/* 1-Tap Fast Extras Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                  <button
                    onClick={() => handleScoreBall(0, "wd")}
                    style={{
                      padding: "10px 0",
                      borderRadius: D.md,
                      border: `1px solid ${D.amber}44`,
                      background: `${D.amber}18`,
                      color: D.amber,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    +1 Wide (wd)
                  </button>
                  <button
                    onClick={() => handleScoreBall(0, "nb")}
                    style={{
                      padding: "10px 0",
                      borderRadius: D.md,
                      border: `1px solid ${D.rose}44`,
                      background: `${D.rose}18`,
                      color: D.rose,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    +1 No Ball (nb)
                  </button>
                  <button
                    onClick={() => handleScoreBall(1, "b")}
                    style={{
                      padding: "10px 0",
                      borderRadius: D.md,
                      border: `1px solid ${D.border}`,
                      background: D.surf2,
                      color: D.textSecondary,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    +1 Bye (b)
                  </button>
                  <button
                    onClick={() => handleScoreBall(1, "lb")}
                    style={{
                      padding: "10px 0",
                      borderRadius: D.md,
                      border: `1px solid ${D.border}`,
                      background: D.surf2,
                      color: D.textSecondary,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    +1 Leg Bye (lb)
                  </button>
                </div>

                {/* 1-Tap Direct Dismissal Buttons (No Popup Dialog) */}
                <div>
                  <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, marginBottom: "4px" }}>
                    ⚡ 1-TAP QUICK DISMISSALS (NO POPUP)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                    {[
                      { label: "Bowled", val: "bowled" },
                      { label: "Caught", val: "caught" },
                      { label: "LBW", val: "lbw" },
                      { label: "Run Out", val: "run out" },
                      { label: "Stumped", val: "stumped" },
                    ].map(w => (
                      <button
                        key={w.val}
                        onClick={() => handleScoreBall(0, undefined, true, w.val)}
                        style={{
                          padding: "8px 0",
                          borderRadius: D.md,
                          background: `${D.rose}20`,
                          border: `1px solid ${D.rose}44`,
                          color: D.rose,
                          fontFamily: D.head,
                          fontSize: "10px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        ⚡ {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. STANDARD MODE: 3-PHASE INTERACTIVE SCORING ENGINE */}
            {captureProfile === "STANDARD" && (
              <div style={{ padding: "16px", background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.sky}44`, display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* 3-Phase Interactive Progress Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${D.border}`, paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.sky, letterSpacing: "0.06em" }}>
                      🎯 3-PHASE INTERACTIVE SCORING SUITE
                    </span>
                  </div>
                  {/* Stepper Tabs */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {[
                      { step: 1 as const, label: "Phase 1: Enrich Delivery Context", icon: "🎯", isDone: scoringPhase > 1 },
                      { step: 2 as const, label: "Phase 2: Ball Placement (Wagon Wheel)", icon: "📍", isDone: scoringPhase > 2 },
                      { step: 3 as const, label: "Phase 3: Record Runs, Extras & Wickets", icon: "⚡", isDone: false },
                    ].map(s => {
                      const isActive = scoringPhase === s.step;
                      return (
                        <button
                          key={s.step}
                          onClick={() => setScoringPhase(s.step)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: D.pill,
                            border: isActive ? `1.5px solid ${D.sky}` : `1px solid ${D.border}`,
                            background: isActive ? `${D.sky}25` : s.isDone ? `${D.emerald}18` : D.surf2,
                            color: isActive ? D.sky : s.isDone ? D.emerald : D.textMuted,
                            fontFamily: D.head,
                            fontSize: "11px",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            boxShadow: isActive ? `0 0 10px ${D.sky}30` : "none",
                          }}
                        >
                          <span>{s.icon}</span>
                          <span>{s.label}</span>
                          {s.isDone && <span style={{ fontSize: "10px", color: D.emerald }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    PHASE 1: ENRICH DELIVERY CONTEXT
                ════════════════════════════════════════════════════════════════ */}
                {scoringPhase === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Header with Striker and Batter Hand */}
                    <div style={{ padding: "10px 14px", background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>🎯</span>
                        <div>
                          <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary }}>
                            Phase 1: Enrich Delivery Context for {matchDerivedState.striker.name}
                          </div>
                          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                            Bowler: {matchDerivedState.bowler.name} ({matchDerivedState.bowler.oversBowled} ov, {matchDerivedState.bowler.runsConceded}/{matchDerivedState.bowler.wickets}) · Striker: {matchDerivedState.striker.runs}* ({matchDerivedState.striker.balls}b)
                          </div>
                        </div>
                      </div>

                      {/* Stance Switcher */}
                      <button
                        onClick={() => setActiveBatHand(prev => (prev === "R" ? "L" : "R"))}
                        style={{
                          padding: "5px 12px",
                          borderRadius: D.pill,
                          background: activeBatHand === "R" ? `${D.sky}25` : `${D.amber}25`,
                          border: `1.5px solid ${activeBatHand === "R" ? D.sky : D.amber}`,
                          color: activeBatHand === "R" ? D.sky : D.amber,
                          fontFamily: D.mono,
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                        title="Toggle batter stance (mirrors off-side/leg-side on wagon wheel)"
                      >
                        🏏 {activeBatHand === "R" ? "RHS (Right-Handed)" : "LHS (Left-Handed)"} ⇄
                      </button>
                    </div>

                    {/* Telemetry Row: Pitch Delivery (Line, Length, Pace) */}
                    <div style={{ padding: "12px", background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.sky, letterSpacing: "0.04em" }}>
                          📐 BOWLER DELIVERY TELEMETRY & PITCH MAP
                        </span>
                        <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                          Click to set Pitch Line & Length
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                        {/* Delivery Length */}
                        <div>
                          <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                            DELIVERY LENGTH
                          </label>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {[
                              { id: "yorker" as const, label: "Yorker (Blockhole)" },
                              { id: "full" as const, label: "Full / Slot" },
                              { id: "good_length" as const, label: "Good Length" },
                              { id: "back_of_length" as const, label: "Back of Length" },
                              { id: "short" as const, label: "Short / Bouncer" },
                            ].map(l => (
                              <button
                                key={l.id}
                                onClick={() => setPhase1Length(l.id)}
                                style={{
                                  padding: "6px 8px",
                                  borderRadius: D.sm,
                                  background: phase1Length === l.id ? `${D.sky}30` : D.surf2,
                                  border: phase1Length === l.id ? `1.5px solid ${D.sky}` : `1px solid ${D.border}`,
                                  color: phase1Length === l.id ? D.sky : D.textSecondary,
                                  fontFamily: D.mono,
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  textAlign: "left",
                                  cursor: "pointer",
                                }}
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Line */}
                        <div>
                          <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                            DELIVERY LINE
                          </label>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {[
                              { id: "outside_off" as const, label: "Outside Off (4th/5th Stump)" },
                              { id: "off_stump" as const, label: "Off Stump (Channel of Uncertainty)" },
                              { id: "middle" as const, label: "Middle Stump (At the Body)" },
                              { id: "leg_stump" as const, label: "Leg Stump" },
                              { id: "down_leg" as const, label: "Down Leg Side" },
                            ].map(l => (
                              <button
                                key={l.id}
                                onClick={() => setPhase1Line(l.id)}
                                style={{
                                  padding: "6px 8px",
                                  borderRadius: D.sm,
                                  background: phase1Line === l.id ? `${D.sky}30` : D.surf2,
                                  border: phase1Line === l.id ? `1.5px solid ${D.sky}` : `1px solid ${D.border}`,
                                  color: phase1Line === l.id ? D.sky : D.textSecondary,
                                  fontFamily: D.mono,
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  textAlign: "left",
                                  cursor: "pointer",
                                }}
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Bowling Pace / Style */}
                        <div>
                          <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                            PACE & RELEASE SPEED
                          </label>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {[
                              { id: "140_fast" as const, label: "⚡ Express (142 km/h)" },
                              { id: "130_fast_med" as const, label: "🚀 Fast-Med (131 km/h)" },
                              { id: "88_off_spin" as const, label: "🌀 Off-Spin (88 km/h)" },
                              { id: "78_leg_spin" as const, label: "🌪️ Leg-Spin (78 km/h)" },
                              { id: "slower" as const, label: "⏱️ Slower Ball (114 km/h)" },
                            ].map(p => (
                              <button
                                key={p.id}
                                onClick={() => setPhase1Pace(p.id)}
                                style={{
                                  padding: "6px 8px",
                                  borderRadius: D.sm,
                                  background: phase1Pace === p.id ? `${D.amber}30` : D.surf2,
                                  border: phase1Pace === p.id ? `1.5px solid ${D.amber}` : `1px solid ${D.border}`,
                                  color: phase1Pace === p.id ? D.amber : D.textSecondary,
                                  fontFamily: D.mono,
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  textAlign: "left",
                                  cursor: "pointer",
                                }}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shot Execution Section: Category & Strokes */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.sky, letterSpacing: "0.04em" }}>
                          🏏 BATTER STROKE & SHOT SELECTION
                        </span>
                        <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                          Selected: <strong style={{ color: D.sky }}>{selectedPhase1Shot}</strong>
                        </span>
                      </div>

                      {/* Shot Category Tabs */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                        {[
                          { id: "front_foot" as const, label: "💥 Front Foot Drives" },
                          { id: "back_foot" as const, label: "🏏 Back Foot & Cuts" },
                          { id: "defensive" as const, label: "🛡️ Defence & Leaves" },
                          { id: "innovative" as const, label: "🚀 Modern & Aerial" },
                          { id: "edges" as const, label: "⚡ Edges & Mis-hits" },
                        ].map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setPhase1Category(cat.id)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: D.pill,
                              border: phase1Category === cat.id ? `1.5px solid ${D.sky}` : `1px solid ${D.border}`,
                              background: phase1Category === cat.id ? D.sky : D.surf2,
                              color: phase1Category === cat.id ? "#fff" : D.textSecondary,
                              fontFamily: D.head,
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Shot Selection Buttons Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: "8px" }}>
                        {(phase1Category === "front_foot"
                          ? ["Cover Drive", "Straight Drive", "On Drive", "Off Drive", "Square Drive", "Lofted Drive", "Front Foot Push", "Inside-Out Drive"]
                          : phase1Category === "back_foot"
                          ? ["Square Cut", "Late Cut", "Pull Shot", "Hook Shot", "Backfoot Punch", "Leg Glance", "Upper Cut"]
                          : phase1Category === "defensive"
                          ? ["Forward Defence", "Backfoot Block", "Leave / Shouldered Arms", "Play & Miss"]
                          : phase1Category === "innovative"
                          ? ["Sweep Shot", "Reverse Sweep", "Ramp / Scoop", "Slog Sweep", "Helicopter Shot", "Switch Hit"]
                          : ["Outside Edge", "Inside Edge", "Top Edge", "Leading Edge"]
                        ).map(shot => {
                          const isSelected = selectedPhase1Shot === shot;
                          return (
                            <button
                              key={shot}
                              onClick={() => setSelectedPhase1Shot(shot)}
                              className="pressBtn"
                              style={{
                                padding: "10px 8px",
                                borderRadius: D.md,
                                border: isSelected ? `2px solid ${D.sky}` : `1px solid ${D.border}`,
                                background: isSelected ? `${D.sky}25` : D.surf2,
                                color: isSelected ? D.sky : D.textPrimary,
                                fontFamily: D.head,
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                                textAlign: "center",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {shot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contact Quality & Trajectory Controls */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "10px 12px", background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                      {/* Contact Quality */}
                      <div>
                        <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                          CONTACT QUALITY
                        </label>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {[
                            { id: "middled" as const, label: "✨ Sweet Spot" },
                            { id: "outside_edge" as const, label: "🔪 Outside Edge" },
                            { id: "inside_edge" as const, label: "📐 Inside Edge" },
                            { id: "leading_edge" as const, label: "🛡️ Leading Edge" },
                            { id: "mishit" as const, label: "⚠️ Mis-hit" },
                            { id: "beaten" as const, label: "💨 Beaten" },
                          ].map(cq => (
                            <button
                              key={cq.id}
                              onClick={() => setPhase1Contact(cq.id)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: D.sm,
                                background: phase1Contact === cq.id ? `${D.emerald}30` : D.surf2,
                                border: phase1Contact === cq.id ? `1.5px solid ${D.emerald}` : `1px solid ${D.border}`,
                                color: phase1Contact === cq.id ? D.emerald : D.textSecondary,
                                fontFamily: D.mono,
                                fontSize: "10px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {cq.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Trajectory */}
                      <div>
                        <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                          BALL TRAJECTORY
                        </label>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {[
                            { id: "along_ground" as const, label: "🌱 Along Ground" },
                            { id: "aerial" as const, label: "🚀 Aerial Drive" },
                            { id: "lofted" as const, label: "☁️ Lofted / High" },
                            { id: "defended" as const, label: "🛑 Defended" },
                          ].map(tr => (
                            <button
                              key={tr.id}
                              onClick={() => setPhase1Trajectory(tr.id)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: D.sm,
                                background: phase1Trajectory === tr.id ? `${D.sky}30` : D.surf2,
                                border: phase1Trajectory === tr.id ? `1.5px solid ${D.sky}` : `1px solid ${D.border}`,
                                color: phase1Trajectory === tr.id ? D.sky : D.textSecondary,
                                fontFamily: D.mono,
                                fontSize: "10px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {tr.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Real-time Enriched Context Synthesis Card */}
                    <div style={{ padding: "10px 14px", background: `${D.sky}12`, borderRadius: D.md, border: `1px solid ${D.sky}40`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>⚡</span>
                        <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textPrimary }}>
                          <strong>Enriched Context:</strong> {phase1Length.replace(/_/g, " ")} {phase1Line.replace(/_/g, " ")} ({phase1Pace === "140_fast" ? "142 km/h" : phase1Pace === "130_fast_med" ? "131 km/h" : phase1Pace === "88_off_spin" ? "88 km/h" : phase1Pace === "78_leg_spin" ? "78 km/h" : "114 km/h"}) ➔ <strong style={{ color: D.sky }}>{selectedPhase1Shot}</strong> ({phase1Contact.replace(/_/g, " ")}, {phase1Trajectory.replace(/_/g, " ")})
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setSelectedPhase1Shot("No Shot / Extra");
                            setPhase3Runs(0);
                            setPhase3Extra("wd");
                            setScoringPhase(3);
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: D.pill,
                            background: "transparent",
                            border: `1px dashed ${D.amber}`,
                            color: D.amber,
                            fontFamily: D.head,
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          ⚡ Quick Extras / Wide →
                        </button>

                        <button
                          onClick={() => setScoringPhase(2)}
                          className="pressBtn"
                          style={{
                            padding: "8px 18px",
                            borderRadius: D.pill,
                            background: D.sky,
                            color: "#fff",
                            border: "none",
                            fontFamily: D.head,
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: `0 2px 8px ${D.sky}40`,
                          }}
                        >
                          Proceed to Phase 2: Ball Placement →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════════════
                    PHASE 2: ENRICH DELIVERY CONTEXT, SELECT PLACEMENT OF BALL ON WAGON WHEEL
                ════════════════════════════════════════════════════════════════ */}
                {scoringPhase === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Top Breadcrumb Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, flexWrap: "wrap", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>Phase 1 Context:</span>
                        <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.sky }}>
                          🎯 {phase1Length.replace(/_/g, " ")} {phase1Line.replace(/_/g, " ")} · {selectedPhase1Shot} ({phase1Contact.replace(/_/g, " ")})
                        </span>
                        <span style={{ fontFamily: D.mono, fontSize: "9px", padding: "1px 6px", borderRadius: D.pill, background: `${activeBatHand === "R" ? D.sky : D.amber}22`, color: activeBatHand === "R" ? D.sky : D.amber }}>
                          {activeBatHand === "R" ? "RHS" : "LHS"}
                        </span>
                      </div>
                      <button
                        onClick={() => setScoringPhase(1)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: D.sky,
                          fontFamily: D.head,
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        ← Edit Phase 1 Context
                      </button>
                    </div>

                    {/* Interactive 360° Wagon Wheel Placement Turf */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", alignItems: "center" }}>
                      {/* High-Contrast Interactive Cricket Oval SVG */}
                      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", maxHeight: "280px", background: "#0c1810", borderRadius: D.lg, border: `1px solid ${D.emerald}55`, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {/* Dynamic Off / Leg side banners */}
                        <div style={{ position: "absolute", top: "8px", left: "10px", fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: activeBatHand === "R" ? D.sky : D.amber, opacity: 0.9, zIndex: 5 }}>
                          {activeBatHand === "R" ? "← OFF SIDE" : "← LEG SIDE"}
                        </div>
                        <div style={{ position: "absolute", top: "8px", right: "10px", fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: activeBatHand === "R" ? D.amber : D.sky, opacity: 0.9, zIndex: 5 }}>
                          {activeBatHand === "R" ? "LEG SIDE →" : "OFF SIDE →"}
                        </div>

                        <svg
                          viewBox="0 0 340 340"
                          style={{ width: "100%", height: "100%", cursor: "crosshair", userSelect: "none" }}
                          onClick={e => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const clickY = e.clientY - rect.top;
                            const normX = (clickX - 170) / 140;
                            const normY = (clickY - 170) / 140;
                            const calculated = classifyWagonCoordinates(normX, normY, activeBatHand);
                            setSelectedPhase2Landing(calculated);
                          }}
                        >
                          {/* Outer Turf & Boundary Ring */}
                          <circle cx="170" cy="170" r="140" fill="#0e2315" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" />
                          <circle cx="170" cy="170" r="140" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" />

                          {/* 30-Yard Infield Ring */}
                          <circle cx="170" cy="170" r="75" fill="#14331d" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.75" />

                          {/* Close-in Ring */}
                          <circle cx="170" cy="170" r="32" fill="#1a3f25" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />

                          {/* Pitch Rectangle (North/South orientation) */}
                          <rect x="164" y="142" width="12" height="56" rx="2" fill="#d97706" opacity="0.65" />

                          {/* Bowling Stumps (North) */}
                          <line x1="166" y1="145" x2="174" y2="145" stroke="#ffffff" strokeWidth="2" />

                          {/* Batting Crease (South) */}
                          <line x1="163" y1="195" x2="177" y2="195" stroke="#ffffff" strokeWidth="2.5" />
                          <circle cx="170" cy="195" r="3" fill="#ffffff" />

                          {/* Radial Sector Reference Rays */}
                          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                            const rad = (deg * Math.PI) / 180;
                            const x2 = 170 + 140 * Math.sin(rad);
                            const y2 = 170 - 140 * Math.cos(rad);
                            return <line key={deg} x1="170" y1="170" x2={x2} y2={y2} stroke="#ffffff" strokeWidth="0.5" opacity="0.12" />;
                          })}

                          {/* Dynamic Shot Tracer Ray from Crease to Landing */}
                          {selectedPhase2Landing && (
                            <>
                              {/* Laser Ray */}
                              <line
                                x1="170"
                                y1="195"
                                x2={170 + selectedPhase2Landing.x * 140}
                                y2={170 + selectedPhase2Landing.y * 140}
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />

                              {/* Landing Ripple Circle */}
                              <circle
                                cx={170 + selectedPhase2Landing.x * 140}
                                cy={170 + selectedPhase2Landing.y * 140}
                                r="8"
                                fill="#f59e0b"
                                opacity="0.4"
                              />
                              <circle
                                cx={170 + selectedPhase2Landing.x * 140}
                                cy={170 + selectedPhase2Landing.y * 140}
                                r="4"
                                fill="#ffffff"
                                stroke="#f59e0b"
                                strokeWidth="2"
                              />
                            </>
                          )}
                        </svg>
                      </div>

                      {/* Real-Time Identified Fielding Zone HUD */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ padding: "12px", background: D.surf2, borderRadius: D.md, border: `1px solid ${D.sky}44` }}>
                          <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, letterSpacing: "0.06em" }}>
                            📍 IDENTIFIED FIELDING AREA & POSITION
                          </div>
                          <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.sky, marginTop: "2px" }}>
                            {selectedPhase2Landing?.fieldingZone || "Cover"}
                          </div>
                          <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, marginTop: "2px" }}>
                            {selectedPhase2Landing?.fieldingZoneDesc || "Infield 30-yard ring (Off-Side)"}
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${D.border}` }}>
                            <div>
                              <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>FIELD REGION</div>
                              <div style={{ fontFamily: D.mono, fontSize: "11px", fontWeight: 700, color: selectedPhase2Landing?.side === "OFF" ? D.sky : D.amber }}>
                                {selectedPhase2Landing?.side === "OFF" ? "Off-Side" : "Leg-Side"} ({selectedPhase2Landing?.depth?.toUpperCase()})
                              </div>
                            </div>
                            <div>
                              <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>EST. DISTANCE</div>
                              <div style={{ fontFamily: D.mono, fontSize: "11px", fontWeight: 700, color: D.textPrimary }}>
                                {selectedPhase2Landing?.distanceMeters || 45} meters
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick 1-Tap Field Sector Buttons */}
                        <div>
                          <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, marginBottom: "4px" }}>
                            1-TAP FIELD SECTOR SNAPPING:
                          </div>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {[
                              { label: "3rd Man", x: -0.65, y: 0.55 },
                              { label: "Point", x: -0.75, y: -0.2 },
                              { label: "Cover", x: -0.65, y: -0.65 },
                              { label: "Mid-Off", x: -0.25, y: -0.75 },
                              { label: "Straight", x: 0, y: -0.85 },
                              { label: "Mid-On", x: 0.25, y: -0.75 },
                              { label: "Mid-Wkt", x: 0.65, y: -0.55 },
                              { label: "Sq Leg", x: 0.75, y: 0.1 },
                              { label: "Fine Leg", x: 0.55, y: 0.65 },
                            ].map(preset => (
                              <button
                                key={preset.label}
                                onClick={() => {
                                  // Mirror x if LHS
                                  const effectiveX = activeBatHand === "L" ? -preset.x : preset.x;
                                  const calculated = classifyWagonCoordinates(effectiveX, preset.y, activeBatHand);
                                  setSelectedPhase2Landing(calculated);
                                }}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: D.sm,
                                  background: selectedPhase2Landing?.sector?.includes(preset.label) ? D.sky : D.surf2,
                                  color: selectedPhase2Landing?.sector?.includes(preset.label) ? "#fff" : D.textSecondary,
                                  border: `1px solid ${D.border}`,
                                  fontFamily: D.head,
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA to advance to Phase 3 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: `1px solid ${D.border}` }}>
                      <span style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                        Suggested Outcome: <strong style={{ color: D.emerald }}>{selectedPhase2Landing?.suggestedRuns ?? 1} Runs</strong>
                      </span>
                      <button
                        onClick={() => {
                          setPhase3Runs(selectedPhase2Landing?.suggestedRuns ?? 1);
                          setScoringPhase(3);
                        }}
                        className="pressBtn"
                        style={{
                          padding: "8px 18px",
                          borderRadius: D.pill,
                          background: D.sky,
                          color: "#fff",
                          border: "none",
                          fontFamily: D.head,
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: `0 2px 8px ${D.sky}40`,
                        }}
                      >
                        Proceed to Phase 3: Score Outcome →
                      </button>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════════════
                    PHASE 3: RECORDING/SCORING RUNS, EXTRAS, WICKET
                ════════════════════════════════════════════════════════════════ */}
                {scoringPhase === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Full Sequence Summary Breadcrumbs */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, flexWrap: "wrap", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>Phase 1:</span>
                        <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.sky }}>
                          🎯 {selectedPhase1Shot} ({phase1Contact.replace(/_/g, " ")})
                        </span>
                        <span style={{ color: D.textMuted }}>➔</span>
                        <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>Phase 2:</span>
                        <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.amber }}>
                          📍 {selectedPhase2Landing?.fieldingZone || "Cover"} ({selectedPhase2Landing?.distanceMeters || 45}m · {selectedPhase2Landing?.side || "OFF"})
                        </span>
                      </div>
                      <button
                        onClick={() => setScoringPhase(2)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: D.sky,
                          fontFamily: D.head,
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        ← Back to Placement
                      </button>
                    </div>

                    {/* High-Touch Runs Keypad */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted }}>
                          CONFIRM RUNS SCORED OFF BAT
                        </span>
                        {selectedPhase2Landing && (
                          <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald }}>
                            Suggested: {selectedPhase2Landing.suggestedRuns} Runs
                          </span>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                        {[0, 1, 2, 3, 4, 6].map(num => {
                          const isSelected = phase3Runs === num && !phase3IsWicket;
                          const isSuggested = selectedPhase2Landing?.suggestedRuns === num;
                          return (
                            <button
                              key={num}
                              onClick={() => {
                                setPhase3Runs(num);
                                setPhase3Extra("none");
                                setPhase3IsWicket(false);
                              }}
                              className="pressBtn"
                              style={{
                                padding: "14px 0",
                                borderRadius: D.md,
                                border: isSelected
                                  ? `2px solid ${num === 4 ? D.sky : num === 6 ? D.emerald : D.textPrimary}`
                                  : isSuggested
                                  ? `2px dashed ${D.emerald}`
                                  : `1px solid ${D.border}`,
                                background: isSelected
                                  ? num === 4
                                    ? `${D.sky}35`
                                    : num === 6
                                    ? `${D.emerald}35`
                                    : D.surf3
                                  : D.surf2,
                                color: num === 4 ? D.sky : num === 6 ? D.emerald : D.textPrimary,
                                fontFamily: D.mono,
                                fontSize: "22px",
                                fontWeight: 900,
                                cursor: "pointer",
                                position: "relative",
                              }}
                            >
                              {num === 0 ? "•" : num}
                              {isSuggested && !isSelected && (
                                <span style={{ position: "absolute", top: "2px", right: "4px", fontSize: "8px", color: D.emerald }}>
                                  ★
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Extras Selector Row */}
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, marginBottom: "4px" }}>
                        OR RECORD EXTRAS
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                        {[
                          { id: "none" as const, label: "None (Off Bat)", val: 0 },
                          { id: "wd" as const, label: "+1 Wide (wd)", val: 1 },
                          { id: "nb" as const, label: "+1 No Ball (nb)", val: 1 },
                          { id: "b" as const, label: "+1 Bye (b)", val: 1 },
                          { id: "lb" as const, label: "+1 Leg Bye (lb)", val: 1 },
                        ].map(ex => (
                          <button
                            key={ex.id}
                            onClick={() => {
                              setPhase3Extra(ex.id);
                              if (ex.id !== "none") setPhase3IsWicket(false);
                            }}
                            style={{
                              padding: "8px 0",
                              borderRadius: D.md,
                              border: phase3Extra === ex.id ? `2px solid ${D.sky}` : `1px solid ${D.border}`,
                              background: phase3Extra === ex.id ? `${D.sky}25` : D.surf2,
                              color: phase3Extra === ex.id ? D.sky : D.textSecondary,
                              fontFamily: D.head,
                              fontSize: "10px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {ex.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wicket / Dismissal Section */}
                    <div style={{ padding: "10px", background: phase3IsWicket ? `${D.rose}18` : D.surf2, borderRadius: D.md, border: `1px solid ${phase3IsWicket ? D.rose : D.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={phase3IsWicket}
                            onChange={e => {
                              setPhase3IsWicket(e.target.checked);
                              if (e.target.checked) setPhase3Runs(0);
                            }}
                            style={{ cursor: "pointer", width: "16px", height: "16px" }}
                          />
                          <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: phase3IsWicket ? D.rose : D.textPrimary }}>
                            ⚡ Wicket / Dismissal on this ball
                          </span>
                        </label>
                        {phase3IsWicket && (
                          <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.rose }}>
                            Fielder at {selectedPhase2Landing?.fieldingZone || "Cover"}
                          </span>
                        )}
                      </div>

                      {phase3IsWicket && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginTop: "8px" }}>
                          {["caught", "bowled", "lbw", "run out", "stumped", "caught & bowled", "hit wicket"].map(w => (
                            <button
                              key={w}
                              onClick={() => setPhase3WicketType(w)}
                              style={{
                                padding: "6px 0",
                                borderRadius: D.sm,
                                border: phase3WicketType === w ? `1px solid ${D.rose}` : `1px solid ${D.border}`,
                                background: phase3WicketType === w ? D.rose : D.surf3,
                                color: phase3WicketType === w ? "#fff" : D.textPrimary,
                                fontFamily: D.head,
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "capitalize",
                                cursor: "pointer",
                              }}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Master 3-Phase Commit Button */}
                    <button
                      onClick={handleCommitThreePhaseBall}
                      className="pressBtn"
                      style={{
                        padding: "14px 0",
                        borderRadius: D.md,
                        background: phase3IsWicket ? D.rose : `linear-gradient(135deg, ${D.sky}, ${D.indigo})`,
                        color: "#fff",
                        border: "none",
                        fontFamily: D.head,
                        fontSize: "13px",
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow: `0 4px 14px ${phase3IsWicket ? D.rose : D.sky}40`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>⚡ COMMIT BALL & UPDATE MATCH</span>
                      <span style={{ fontFamily: D.mono, fontSize: "11px", opacity: 0.9 }}>
                        ({phase3IsWicket ? "WICKET" : `${phase3Runs} Runs ${phase3Extra !== "none" ? `+ ${phase3Extra}` : ""}`})
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. FULL PRO ANALYTICS & BROADCAST TELEMETRY SCORING DECK */}
            {captureProfile === "FULL" && (
              <div style={{ padding: "16px", background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.indigo}55`, display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.indigo, letterSpacing: "0.06em" }}>
                      🔬 FULL PRO ANALYTICS & HAWKEYE RADAR
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: D.mono, fontSize: "10px", padding: "2px 6px", borderRadius: D.pill, background: matchSettings.showProHawkeyeRadar ? `${D.indigo}25` : D.surf2, color: matchSettings.showProHawkeyeRadar ? D.indigo : D.textMuted }}>
                      {matchSettings.showProHawkeyeRadar ? "8 Telemetry Dimensions Active" : "Radar Telemetry Muted"}
                    </span>
                    <button
                      onClick={() => setMatchSettings(prev => ({ ...prev, showProHawkeyeRadar: !prev.showProHawkeyeRadar }))}
                      style={{
                        padding: "2px 6px",
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.textSecondary,
                        fontFamily: D.mono,
                        fontSize: "9px",
                        cursor: "pointer",
                      }}
                    >
                      {matchSettings.showProHawkeyeRadar ? "Turn Off" : "Turn On"}
                    </button>
                  </div>
                </div>

                {/* Conditional Hawkeye Live Pitch Delivery Radar (Line, Length, Contact, Speed) */}
                {matchSettings.showProHawkeyeRadar ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: D.surf1, padding: "10px", borderRadius: D.md, border: `1px solid ${D.border}` }}>
                      <div>
                        <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                          DELIVERY LINE
                        </label>
                        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                          {[
                            { label: "Out Off", val: "outside_off" },
                            { label: "Off", val: "off_stump" },
                            { label: "Mid", val: "middle" },
                            { label: "Leg", val: "leg_stump" },
                            { label: "Down Leg", val: "down_leg" },
                          ].map(l => (
                            <button
                              key={l.val}
                              onClick={() => setTempLine(l.val as any)}
                              style={{
                                padding: "3px 6px",
                                borderRadius: D.sm,
                                background: tempLine === l.val ? D.sky : D.surf2,
                                color: tempLine === l.val ? "#fff" : D.textSecondary,
                                border: `1px solid ${D.border}`,
                                fontFamily: D.mono,
                                fontSize: "9px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {l.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                          DELIVERY LENGTH
                        </label>
                        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                          {[
                            { label: "Yorker", val: "yorker" },
                            { label: "Full", val: "full" },
                            { label: "Good", val: "good_length" },
                            { label: "Back", val: "back_of_length" },
                            { label: "Short", val: "short" },
                          ].map(len => (
                            <button
                              key={len.val}
                              onClick={() => setTempLength(len.val as any)}
                              style={{
                                padding: "3px 6px",
                                borderRadius: D.sm,
                                background: tempLength === len.val ? D.emerald : D.surf2,
                                color: tempLength === len.val ? "#fff" : D.textSecondary,
                                border: `1px solid ${D.border}`,
                                fontFamily: D.mono,
                                fontSize: "9px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {len.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Contact Quality & Bowling Speed Quick Selector */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "8px", background: D.surf1, padding: "10px", borderRadius: D.md, border: `1px solid ${D.border}` }}>
                      <div>
                        <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                          CONTACT QUALITY
                        </label>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {[
                            { label: "Middled ⭐", val: "middled" },
                            { label: "Edged ⚡", val: "edged" },
                            { label: "Inside Edge", val: "inside_edge" },
                            { label: "Leading Edge", val: "leading_edge" },
                            { label: "Mis-hit", val: "mishit" },
                          ].map(cq => (
                            <button
                              key={cq.val}
                              onClick={() => setFullContactQuality(cq.val as any)}
                              style={{
                                padding: "3px 6px",
                                borderRadius: D.sm,
                                background: fullContactQuality === cq.val ? D.indigo : D.surf2,
                                color: fullContactQuality === cq.val ? "#fff" : D.textSecondary,
                                border: `1px solid ${D.border}`,
                                fontFamily: D.body,
                                fontSize: "9px",
                                cursor: "pointer",
                              }}
                            >
                              {cq.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                          PACE / SPIN TYPE
                        </label>
                        <select
                          value={fullBowlingPace}
                          onChange={e => setFullBowlingPace(e.target.value as any)}
                          style={{
                            width: "100%",
                            padding: "5px",
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            fontFamily: D.mono,
                            fontSize: "10px",
                          }}
                        >
                          <option value="140_express">140 km/h (Express Fast)</option>
                          <option value="128_fast_med">128 km/h (Fast-Med)</option>
                          <option value="88_off_spin">88 km/h (Off-Spin)</option>
                          <option value="78_leg_spin">78 km/h (Leg-Spin)</option>
                          <option value="slower">Slower Ball</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "10px 14px", background: D.surf1, borderRadius: D.md, border: `1px dashed ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                      Radar & telemetry inputs are disabled in settings. Balls score with standard pitch averages.
                    </span>
                    <button
                      onClick={() => setMatchSettings(prev => ({ ...prev, showProHawkeyeRadar: true }))}
                      style={{
                        padding: "3px 8px",
                        borderRadius: D.pill,
                        background: `${D.indigo}25`,
                        border: `1px solid ${D.indigo}55`,
                        color: D.indigo,
                        fontFamily: D.mono,
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Enable Hawkeye
                    </button>
                  </div>
                )}

                {/* Standard Runs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                  {[0, 1, 2, 3, 4, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => handleScoreBall(num)}
                      className="pressBtn"
                      style={{
                        padding: "14px 0",
                        borderRadius: D.md,
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottom: "none",
                        background:
                          num === 0
                            ? D.surf2
                            : num === 4
                            ? `${D.sky}25`
                            : num === 6
                            ? `${D.emerald}25`
                            : D.surf3,
                        borderTop: num === 4 ? `2px solid ${D.sky}` : num === 6 ? `2px solid ${D.emerald}` : "none",
                        color: num === 4 ? D.sky : num === 6 ? D.emerald : D.textPrimary,
                        fontFamily: D.mono,
                        fontSize: "20px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {num === 0 ? "•" : num}
                    </button>
                  ))}
                </div>

                {/* Extras and Dismissals */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                  <button
                    onClick={() => handleScoreBall(0, "wd")}
                    style={{
                      padding: "9px 0",
                      borderRadius: D.md,
                      border: `1px solid ${D.amber}33`,
                      background: `${D.amber}18`,
                      color: D.amber,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Wide (1wd)
                  </button>
                  <button
                    onClick={() => handleScoreBall(0, "nb")}
                    style={{
                      padding: "9px 0",
                      borderRadius: D.md,
                      border: `1px solid ${D.rose}33`,
                      background: `${D.rose}18`,
                      color: D.rose,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    No Ball (1nb)
                  </button>
                  <button
                    onClick={() => handleScoreBall(1, "b")}
                    style={{
                      padding: "9px 0",
                      borderRadius: D.md,
                      border: `1px solid ${D.border}`,
                      background: D.surf2,
                      color: D.textSecondary,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Bye (1b)
                  </button>
                  <button
                    onClick={() => handleScoreBall(1, "lb")}
                    style={{
                      padding: "9px 0",
                      borderRadius: D.md,
                      border: `1px solid ${D.border}`,
                      background: D.surf2,
                      color: D.textSecondary,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Leg Bye (1lb)
                  </button>
                  <button
                    onClick={() => setWicketModalOpen(true)}
                    style={{
                      padding: "9px 0",
                      borderRadius: D.md,
                      border: "none",
                      background: D.rose,
                      color: "#fff",
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: `0 4px 12px ${D.rose}40`,
                    }}
                  >
                    WICKET ⚡
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Telemetry Deck & Analytics */}
          <div style={{ background: D.surf0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Tab Header: Wagon Wheel vs Pitch Map vs Telemetry vs Commentary vs Over Audit vs Quick Log */}
            <div
              style={{
                padding: "10px 16px",
                borderBottom: `1px solid ${D.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                overflowX: "auto",
              }}
            >
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {captureProfile === "QUICK" && (
                  <button
                    onClick={() => setRightPanelTab("quicklog")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: D.pill,
                      border: "none",
                      background: rightPanelTab === "quicklog" ? D.amber : D.surf2,
                      color: rightPanelTab === "quicklog" ? "#000" : D.textMuted,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ⚡ Quick Ball Stream
                  </button>
                )}

                <button
                  onClick={() => setRightPanelTab("wagon")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: D.pill,
                    border: "none",
                    background: rightPanelTab === "wagon" ? D.sky : D.surf2,
                    color: rightPanelTab === "wagon" ? "#fff" : D.textMuted,
                    fontFamily: D.head,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🎯 360° Wagon Wheel
                </button>

                {captureProfile === "FULL" && (
                  <>
                    <button
                      onClick={() => setRightPanelTab("pitchmap")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: D.pill,
                        border: "none",
                        background: rightPanelTab === "pitchmap" ? D.emerald : D.surf2,
                        color: rightPanelTab === "pitchmap" ? "#fff" : D.textMuted,
                        fontFamily: D.head,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      🌿 Pitch Length Radar
                    </button>
                    <button
                      onClick={() => setRightPanelTab("telemetry")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: D.pill,
                        border: "none",
                        background: rightPanelTab === "telemetry" ? D.indigo : D.surf2,
                        color: rightPanelTab === "telemetry" ? "#fff" : D.textMuted,
                        fontFamily: D.head,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      📊 Pro Telemetry
                    </button>
                  </>
                )}

                <button
                  onClick={() => setRightPanelTab("commentary")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: D.pill,
                    border: "none",
                    background: rightPanelTab === "commentary" ? D.indigo : D.surf2,
                    color: rightPanelTab === "commentary" ? "#fff" : D.textMuted,
                    fontFamily: D.head,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🎙️ AI Commentary
                </button>
                <button
                  onClick={() => setRightPanelTab("audit")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: D.pill,
                    border: "none",
                    background: rightPanelTab === "audit" ? D.amber : D.surf2,
                    color: rightPanelTab === "audit" ? "#000" : D.textMuted,
                    fontFamily: D.head,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  📋 Audit Log ({deliveries.length})
                </button>
              </div>

              {rightPanelTab === "wagon" && (
                <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, whiteSpace: "nowrap" }}>
                  {matchDerivedState.striker.name}: {matchDerivedState.striker.runs} ({matchDerivedState.striker.balls}b)
                </div>
              )}
            </div>

            {/* TAB: Quick Ball Stream (for Quick Mode) */}
            {rightPanelTab === "quicklog" && (
              <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ padding: "10px 12px", background: `${D.amber}15`, borderRadius: D.md, border: `1px solid ${D.amber}33` }}>
                  <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.amber }}>
                    ⚡ QUICK SCORING STREAM ACTIVE
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, marginTop: "2px" }}>
                    Deliveries are written directly into memory and synced to spectators in real-time.
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {deliveries.slice(0, 15).map(d => (
                    <div
                      key={d.id}
                      style={{
                        padding: "8px 12px",
                        background: D.surf1,
                        borderRadius: D.md,
                        border: `1px solid ${D.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: D.mono, fontSize: "11px", fontWeight: 800, color: D.sky }}>
                          Ball {d.timestamp}
                        </span>
                        <span style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary }}>
                          {d.bowler} → {d.batter}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: D.pill,
                            background: d.isWicket ? D.rose : d.runsOffBat >= 4 ? D.sky : D.surf2,
                            color: d.isWicket || d.runsOffBat >= 4 ? "#fff" : D.textPrimary,
                            fontFamily: D.mono,
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {d.isWicket ? "WICKET" : `${d.totalRuns} R`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Pitch Length Radar (for Full Pro Mode) */}
            {rightPanelTab === "pitchmap" && (
              <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.emerald }}>
                    🌿 2D PITCH LENGTH & LINE HEATMAP
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                    {deliveries.length} balls tracked
                  </span>
                </div>

                {/* 2D Pitch Diagram SVG */}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    background: D.surf1,
                    borderRadius: D.lg,
                    border: `1px solid ${D.border}`,
                    padding: "16px",
                  }}
                >
                  <svg viewBox="0 0 200 320" style={{ width: "100%", maxWidth: "260px", height: "auto" }}>
                    {/* Pitch Turf */}
                    <rect x="20" y="10" width="160" height="300" fill="#2d4a2d" rx="6" stroke={D.border} strokeWidth="1.5" />

                    {/* Bowling Crease (Top) */}
                    <line x1="20" y1="40" x2="180" y2="40" stroke="#fff" strokeWidth="1.5" opacity={0.8} />
                    <text x="100" y="32" fill="#fff" fontSize="8" fontFamily={D.mono} textAnchor="middle" opacity={0.6}>BOWLER RELEASE</text>

                    {/* Pitch Zones Lines */}
                    {/* Short Pitch Zone */}
                    <line x1="20" y1="100" x2="180" y2="100" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" opacity={0.3} />
                    <text x="30" y="75" fill="#facc15" fontSize="8" fontFamily={D.mono} opacity={0.8}>SHORT (7-10m)</text>

                    {/* Back of Length Zone */}
                    <line x1="20" y1="170" x2="180" y2="170" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" opacity={0.3} />
                    <text x="30" y="140" fill="#38bdf8" fontSize="8" fontFamily={D.mono} opacity={0.8}>BACK OF LENGTH (6-8m)</text>

                    {/* Good Length Zone */}
                    <line x1="20" y1="240" x2="180" y2="240" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" opacity={0.3} />
                    <text x="30" y="210" fill="#4ade80" fontSize="8" fontFamily={D.mono} opacity={0.8}>GOOD LENGTH (4-6m)</text>

                    {/* Full / Yorker Zone */}
                    <text x="30" y="270" fill="#c084fc" fontSize="8" fontFamily={D.mono} opacity={0.8}>FULL / YORKER (0-4m)</text>

                    {/* Popping Crease & Stumps (Bottom) */}
                    <line x1="20" y1="280" x2="180" y2="280" stroke="#fff" strokeWidth="2" />
                    <rect x="94" y="284" width="12" height="4" fill="#fbbf24" rx="1" />
                    <text x="100" y="305" fill="#fff" fontSize="8" fontFamily={D.mono} textAnchor="middle">BATTER CREASE</text>

                    {/* Render Deliveries on Pitch */}
                    {deliveries.map((d, i) => {
                      let yPos = 210; // good length default
                      if (d.pitchDelivery?.length === "yorker") yPos = 275;
                      else if (d.pitchDelivery?.length === "full") yPos = 250;
                      else if (d.pitchDelivery?.length === "good_length") yPos = 205;
                      else if (d.pitchDelivery?.length === "back_of_length") yPos = 135;
                      else if (d.pitchDelivery?.length === "short") yPos = 70;

                      let xPos = 100; // middle
                      if (d.pitchDelivery?.line === "outside_off") xPos = 65;
                      else if (d.pitchDelivery?.line === "off_stump") xPos = 82;
                      else if (d.pitchDelivery?.line === "middle") xPos = 100;
                      else if (d.pitchDelivery?.line === "leg_stump") xPos = 118;
                      else if (d.pitchDelivery?.line === "down_leg") xPos = 135;

                      // Jitter slightly for visual realism
                      const jx = xPos + ((i % 5) - 2) * 3;
                      const jy = yPos + ((i % 7) - 3) * 3;

                      const dotColor = d.isWicket ? D.rose : d.runsOffBat === 6 ? D.emerald : d.runsOffBat === 4 ? D.sky : d.runsOffBat === 0 ? "#facc15" : D.indigo;

                      return (
                        <g key={d.id}>
                          <circle cx={jx} cy={jy} r="5" fill={dotColor} stroke="#fff" strokeWidth="1" />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* TAB: Pro Telemetry Breakdown (for Full Pro Mode) */}
            {rightPanelTab === "telemetry" && (
              <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.indigo }}>
                  📊 STRIKER & BOWLER PRO TELEMETRY
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ padding: "10px", background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>CONTACT QUALITY</div>
                    <div style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 800, color: D.emerald, marginTop: "4px" }}>
                      78.4%
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Middled / Clean strokes</div>
                  </div>

                  <div style={{ padding: "10px", background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>AVG BOWLING SPEED</div>
                    <div style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 800, color: D.sky, marginTop: "4px" }}>
                      131.2 km/h
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Peak: 139.8 km/h</div>
                  </div>
                </div>

                <div style={{ padding: "10px", background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textSecondary, marginBottom: "6px" }}>
                    LENGTH CONCEDED FIGURES
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontFamily: D.mono, fontSize: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Good Length:</span>
                      <strong style={{ color: D.emerald }}>12 balls · 8 runs (0 wkt)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Full / Yorker:</span>
                      <strong style={{ color: D.sky }}>6 balls · 14 runs (1 wkt)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Short / Back of Length:</span>
                      <strong style={{ color: D.amber }}>8 balls · 12 runs (0 wkt)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* TAB 1: Live Striker Wagon Wheel Telemetry */}
            {rightPanelTab === "wagon" && (
              <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Sector & Off/Leg Summary Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ padding: "10px", background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                      <span>OFF SIDE: {strikerWagonStats.offRuns} runs</span>
                      <span>{strikerWagonStats.offPct}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: D.surf3, borderRadius: "3px", overflow: "hidden", marginTop: "4px" }}>
                      <div style={{ width: `${strikerWagonStats.offPct}%`, height: "100%", background: D.sky }} />
                    </div>
                  </div>

                  <div style={{ padding: "10px", background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                      <span>LEG SIDE: {strikerWagonStats.legRuns} runs</span>
                      <span>{strikerWagonStats.legPct}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: D.surf3, borderRadius: "3px", overflow: "hidden", marginTop: "4px" }}>
                      <div style={{ width: `${strikerWagonStats.legPct}%`, height: "100%", background: D.emerald }} />
                    </div>
                  </div>
                </div>

                {/* Filter Runs Pills */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>Filter:</span>
                  {(["all", 4, 6, 1, 2, 0] as const).map(rf => (
                    <button
                      key={rf}
                      onClick={() => setWagonFilterRuns(rf)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: D.pill,
                        background: wagonFilterRuns === rf ? D.sky : D.surf2,
                        color: wagonFilterRuns === rf ? "#fff" : D.textMuted,
                        border: `1px solid ${D.border}`,
                        fontFamily: D.mono,
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {rf === "all" ? "All Shots" : rf === 0 ? "Dots (•)" : `${rf} Runs`}
                    </button>
                  ))}
                </div>

                {/* Render Interactive 360° Wagon Wheel Visualizer */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: D.surf1,
                    borderRadius: D.lg,
                    border: `1px solid ${D.border}`,
                    padding: "16px",
                  }}
                >
                  <svg viewBox="-140 -140 280 280" style={{ width: "100%", maxWidth: "340px", height: "auto" }}>
                    {/* Outfield Grass Circle */}
                    <circle cx="0" cy="0" r="128" fill={D.surf2} stroke={D.border} strokeWidth="2" />

                    {/* Boundary Rope */}
                    <circle cx="0" cy="0" r="124" fill="none" stroke={D.borderMed} strokeWidth="2" strokeDasharray="4 3" />

                    {/* 30-Yard Circle */}
                    <circle cx="0" cy="0" r="68" fill="none" stroke={D.border} strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Infield Ring */}
                    <circle cx="0" cy="0" r="32" fill="none" stroke={D.border} strokeWidth="1" opacity={0.5} />

                    {/* Radial Sector Divider Lines */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                      const rad = (deg * Math.PI) / 180;
                      const x2 = Math.sin(rad) * 124;
                      const y2 = -Math.cos(rad) * 124;
                      return (
                        <line
                          key={deg}
                          x1="0"
                          y1="0"
                          x2={x2}
                          y2={y2}
                          stroke={D.border}
                          strokeWidth="1"
                          strokeDasharray="2 4"
                          opacity={0.6}
                        />
                      );
                    })}

                    {/* Sector Labels */}
                    <text x="0" y="-130" fill={D.textMuted} fontSize="8" fontFamily={D.mono} textAnchor="middle">STRAIGHT</text>
                    <text x="95" y="-95" fill={D.textMuted} fontSize="8" fontFamily={D.mono} textAnchor="middle">MID-ON</text>
                    <text x="130" y="0" fill={D.textMuted} fontSize="8" fontFamily={D.mono} textAnchor="middle">SQ LEG</text>
                    <text x="95" y="95" fill={D.textMuted} fontSize="8" fontFamily={D.mono} textAnchor="middle">FINE LEG</text>
                    <text x="0" y="136" fill={D.textMuted} fontSize="8" fontFamily={D.mono} textAnchor="middle">BEHIND</text>
                    <text x="-95" y="95" fill={D.textMuted} fontSize="8" fontFamily={D.mono} textAnchor="middle">3RD MAN</text>
                    <text x="-130" y="0" fill={D.textMuted} fontSize="8" fontFamily={D.mono} textAnchor="middle">POINT</text>
                    <text x="-95" y="-95" fill={D.textMuted} fontSize="8" fontFamily={D.mono} textAnchor="middle">COVER</text>

                    {/* Pitch Crease Rectangle */}
                    <rect x="-6" y="-18" width="12" height="36" fill={D.surf3} rx="2" stroke={D.border} strokeWidth="1" />
                    <line x1="-8" y1="12" x2="8" y2="12" stroke={D.textMuted} strokeWidth="1.5" />
                    <line x1="-8" y1="-12" x2="8" y2="-12" stroke={D.textMuted} strokeWidth="1.5" />

                    {/* Render Filtered Shot Lines */}
                    {strikerDeliveries
                      .filter(d => (wagonFilterRuns === "all" ? true : d.runsOffBat === wagonFilterRuns))
                      .map((d, idx) => {
                        if (!d.shot) return null;
                        const px = d.shot.x * 124;
                        const py = d.shot.y * 124;
                        const strokeColor =
                          d.isWicket
                            ? D.rose
                            : d.runsOffBat === 6
                            ? D.emerald
                            : d.runsOffBat === 4
                            ? D.sky
                            : d.runsOffBat === 0
                            ? D.amber
                            : D.indigo;

                        return (
                          <g key={d.id || idx}>
                            <line
                              x1="0"
                              y1="0"
                              x2={px}
                              y2={py}
                              stroke={strokeColor}
                              strokeWidth={d.runsOffBat >= 4 ? 2.5 : 1.5}
                              strokeLinecap="round"
                              opacity={0.85}
                            />
                            <circle cx={px} cy={py} r={d.runsOffBat >= 4 ? 4 : 2.5} fill={strokeColor} />
                          </g>
                        );
                      })}

                    {/* Striker Batting Dot at Origin */}
                    <circle cx="0" cy="0" r="5" fill={D.emerald} />
                    <circle cx="0" cy="0" r="8" fill="none" stroke={D.emerald} strokeWidth="1.5" opacity={0.6} />
                  </svg>
                </div>
              </div>
            )}

            {/* TAB 2: AI Live Commentary Feed */}
            {rightPanelTab === "commentary" && (
              <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                {deliveries.map(d => (
                  <div
                    key={d.id}
                    style={{
                      padding: "10px 12px",
                      background: D.surf1,
                      borderRadius: D.md,
                      border: `1px solid ${D.border}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontFamily: D.mono, fontSize: "11px", fontWeight: 800, color: D.sky }}>
                          {d.timestamp}
                        </span>
                        <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700 }}>
                          {d.bowler} to {d.batter}
                        </span>
                      </div>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: D.pill,
                          background: d.isWicket ? `${D.rose}25` : d.runsOffBat >= 4 ? `${D.emerald}25` : D.surf2,
                          color: d.isWicket ? D.rose : d.runsOffBat >= 4 ? D.emerald : D.textMuted,
                          fontFamily: D.mono,
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {d.isWicket ? "WICKET" : `${d.totalRuns} run${d.totalRuns === 1 ? "" : "s"}`}
                      </span>
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, lineHeight: "1.4" }}>
                      {d.commentary}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Delivery Log & Over Audit */}
            {rightPanelTab === "audit" && (
              <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginBottom: "4px" }}>
                  Select any historical delivery to view audit history or amend the scoring event with official reasoning.
                </div>
                {deliveries.map(d => (
                  <div
                    key={d.id}
                    style={{
                      padding: "10px 12px",
                      background: D.surf1,
                      borderRadius: D.md,
                      border: `1px solid ${D.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontFamily: D.mono, fontSize: "12px", fontWeight: 700, color: D.sky }}>
                          Ball {d.timestamp}
                        </span>
                        <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700 }}>
                          {d.runsOffBat} runs · {d.shot?.sector || "No Wagon Data"}
                        </span>
                        <span
                          style={{
                            padding: "1px 6px",
                            borderRadius: D.pill,
                            background: d.verificationStatus === "verified" ? `${D.emerald}20` : `${D.amber}20`,
                            color: d.verificationStatus === "verified" ? D.emerald : D.amber,
                            fontSize: "9px",
                            fontFamily: D.mono,
                          }}
                        >
                          {d.verificationStatus}
                        </span>
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: "9px", color: D.textMuted, marginTop: "2px" }}>
                        ID: {d.id} · {d.bowler} → {d.batter}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setAmendingDelivery(d);
                        setAmendedRuns(d.runsOffBat);
                        setAmendModalOpen(true);
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.textSecondary,
                        fontFamily: D.head,
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Amend ✏️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Active Main Tab 2: Full Match Scorecard */}
        {activeMainTab === "scorecard" && (
          <FullScorecardView
            theme={D}
            homeTeamName={homeTitle}
            awayTeamName={awayTitle}
            matchState={matchDerivedState}
            deliveries={deliveries}
            battingSquad={battingSquad}
            bowlingAttack={bowlingAttack}
            matchSettings={matchSettings}
            innings1Data={{
              teamName: homeTitle,
              runs: matchDerivedState.totalRuns,
              wickets: matchDerivedState.totalWickets,
              overs: matchDerivedState.oversStr,
              batting: battingSquad,
              bowling: bowlingAttack,
              extras: {
                wides: matchDerivedState.wides,
                noBalls: matchDerivedState.noBalls,
                byes: matchDerivedState.byes,
                legByes: matchDerivedState.legByes,
                penalties: 0,
                total: matchDerivedState.extrasTotal,
              },
              fallOfWickets: matchDerivedState.fallOfWickets || [],
            }}
            activeInningsNumber={1}
            matchFormat="T20"
            venueName="Main Oval"
            matchStatus="LIVE"
            tossText={`${homeTitle} won the toss and elected to bat first`}
          />
        )}

        {/* Active Main Tab 3: Deep Match Analytics */}
        {activeMainTab === "analytics" && (
          <DeepMatchAnalyticsView
            theme={D}
            homeTeamName={homeTitle}
            awayTeamName={awayTitle}
            deliveries={deliveries}
            currentRuns={matchDerivedState.totalRuns}
            currentWickets={matchDerivedState.totalWickets}
            currentOvers={matchDerivedState.oversStr}
            targetRuns={matchDerivedState.target}
            battingSquad={battingSquad}
            bowlingAttack={bowlingAttack}
            matchSettings={matchSettings}
          />
        )}

        {/* Active Main Tab 4: Commentary & Audit Stream */}
        {activeMainTab === "commentary" && (
          <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: D.surf0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${D.border}`, paddingBottom: "12px" }}>
              <div>
                <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary }}>
                  🎙️ BALL-BY-BALL BROADCAST COMMENTARY FEED
                </div>
                <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted }}>
                  Live synchronized commentary log with boundary tracking and wicket telemetry
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ padding: "4px 10px", borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: "11px", fontWeight: 700 }}>
                  {deliveries.length} Total Balls Logged
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
              {deliveries.map(d => (
                <div
                  key={d.id}
                  style={{
                    padding: "14px 16px",
                    background: D.surf1,
                    borderRadius: D.lg,
                    border: `1px solid ${d.isWicket ? `${D.rose}60` : d.runsOffBat >= 4 ? `${D.emerald}40` : D.border}`,
                    boxShadow: d.isWicket ? `0 4px 14px ${D.rose}20` : undefined,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: D.pill, background: D.surf2, color: D.sky, fontFamily: D.mono, fontSize: "12px", fontWeight: 800 }}>
                        Over {d.timestamp}
                      </span>
                      <span style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800 }}>
                        {d.bowler} to {d.batter}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: D.pill,
                        background: d.isWicket ? D.rose : d.runsOffBat >= 6 ? D.emerald : d.runsOffBat >= 4 ? D.sky : D.surf2,
                        color: d.isWicket || d.runsOffBat >= 4 ? "#fff" : D.textPrimary,
                        fontFamily: D.mono,
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      {d.isWicket ? "⚡ WICKET" : `${d.totalRuns} RUN${d.totalRuns === 1 ? "" : "S"}`}
                    </span>
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "13px", color: D.textPrimary, lineHeight: "1.5" }}>
                    {d.commentary}
                  </div>
                  {d.shot && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", paddingTop: "6px", borderTop: `1px solid ${D.border}`, fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                      <span>Sector: {d.shot.sector}</span>
                      <span>·</span>
                      <span>Stroke: {d.shot.shotType || "Standard Drive"}</span>
                      {d.telemetry && (
                        <>
                          <span>·</span>
                          <span>Line: {d.telemetry.line}</span>
                          <span>·</span>
                          <span>Length: {d.telemetry.length}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE 2 ENRICHMENT HUD MODAL (THE WAGON WHEEL SCORING LOOP) ── */}
        {enrichmentModalOpen && enrichingDelivery && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              zIndex: 10002,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "780px",
                maxHeight: "92vh",
                background: D.surf1,
                border: `1px solid ${D.borderMed}`,
                borderRadius: D.xl,
                padding: "20px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: D.pill,
                        background: enrichingDelivery.runsOffBat === 4 ? D.sky : enrichingDelivery.runsOffBat === 6 ? D.emerald : enrichingDelivery.isWicket ? D.rose : D.indigo,
                        color: "#fff",
                        fontFamily: D.mono,
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      {enrichingDelivery.isWicket ? "WICKET" : `${enrichingDelivery.runsOffBat} RUNS`}
                    </span>
                    <span style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800 }}>
                      PHASE 2: ENRICH DELIVERY CONTEXT
                    </span>
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
                    Ball {enrichingDelivery.timestamp}: {enrichingDelivery.bowler} to {enrichingDelivery.batter} ({activeBatHand}HB)
                  </div>
                </div>

                {/* Never Block Next Ball Button */}
                <button
                  onClick={() => setEnrichmentModalOpen(false)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: D.pill,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textMuted,
                    fontFamily: D.head,
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                  title="Abandon enrichment and proceed immediately to live play"
                >
                  ⚡ Skip (Score Saved)
                </button>
              </div>

              {/* Main 2-Column: Interactive Field Canvas + Stroke Selectors */}
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px" }}>
                {/* Interactive Wagon Wheel Field SVG */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "280px",
                      height: "280px",
                      background: D.surf0,
                      borderRadius: "50%",
                      border: `1px solid ${D.border}`,
                      position: "relative",
                      cursor: "crosshair",
                    }}
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const clickY = e.clientY - rect.top;
                      const centerX = rect.width / 2;
                      const centerY = rect.height / 2;
                      const nx = (clickX - centerX) / (rect.width / 2);
                      const ny = (clickY - centerY) / (rect.height / 2);
                      const classified = classifyWagonCoordinates(nx, ny, activeBatHand);
                      setTempWagonShot(classified);
                    }}
                  >
                    <svg viewBox="-140 -140 280 280" style={{ width: "100%", height: "100%" }}>
                      <circle cx="0" cy="0" r="130" fill={D.surf2} />
                      <circle cx="0" cy="0" r="126" fill="none" stroke={D.border} strokeWidth="2" strokeDasharray="3 3" />
                      <circle cx="0" cy="0" r="70" fill="none" stroke={D.border} strokeWidth="1" strokeDasharray="2 3" />

                      {/* Sector guidelines */}
                      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                        const rad = (deg * Math.PI) / 180;
                        return (
                          <line
                            key={deg}
                            x1="0"
                            y1="-14"
                            x2={Math.sin(rad) * 126}
                            y2={-14 + Math.cos(rad) * 126}
                            stroke={D.border}
                            strokeWidth="1"
                            opacity={0.3}
                          />
                        );
                      })}

                      {/* Pitch Strip (Centered Vertically) */}
                      <rect x="-6" y="-20" width="12" height="40" fill="#c89658" rx="2" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
                      {/* Striker Batting Crease (North: y = -14) */}
                      <line x1="-8" y1="-14" x2="8" y2="-14" stroke="#ffffff" strokeWidth="1.2" />
                      <circle cx="0" cy="-17" r="1" fill="#fef08a" />
                      {/* Bowler End (South: y = +14) */}
                      <line x1="-8" y1="14" x2="8" y2="14" stroke="#ffffff" strokeWidth="1.2" />
                      <circle cx="0" cy="17" r="1" fill="#fef08a" />

                      {/* Sector Text Ring */}
                      <g fontSize="6" fontFamily={D.mono} fill={D.textMuted} opacity={0.8} textAnchor="middle">
                        {activeBatHand === 'R' ? (
                          <>
                            <text x="-70" y="-85">3RD MAN</text>
                            <text x="-95" y="0">POINT</text>
                            <text x="-70" y="80">COVERS</text>
                            <text x="-25" y="115">LONG OFF</text>
                            <text x="25" y="115">LONG ON</text>
                            <text x="70" y="80">MID-WKT</text>
                            <text x="95" y="0">SQ LEG</text>
                            <text x="70" y="-85">FINE LEG</text>
                          </>
                        ) : (
                          <>
                            <text x="70" y="-85">3RD MAN</text>
                            <text x="95" y="0">POINT</text>
                            <text x="70" y="80">COVERS</text>
                            <text x="25" y="115">LONG OFF</text>
                            <text x="-25" y="115">LONG ON</text>
                            <text x="-70" y="80">MID-WKT</text>
                            <text x="-95" y="0">SQ LEG</text>
                            <text x="-70" y="-85">FINE LEG</text>
                          </>
                        )}
                      </g>

                      {/* Active Tapped Vector Line (Radiates from Striker Batting Crease at (0, -14)) */}
                      {tempWagonShot && (
                        <g>
                          <line
                            x1="0"
                            y1="-14"
                            x2={tempWagonShot.x * 126}
                            y2={tempWagonShot.y * 126}
                            stroke={enrichingDelivery.runsOffBat === 4 ? D.sky : enrichingDelivery.runsOffBat === 6 ? D.emerald : enrichingDelivery.isWicket ? D.rose : D.amber}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle
                            cx={tempWagonShot.x * 126}
                            cy={tempWagonShot.y * 126}
                            r="6"
                            fill={enrichingDelivery.runsOffBat === 4 ? D.sky : enrichingDelivery.runsOffBat === 6 ? D.emerald : enrichingDelivery.isWicket ? D.rose : D.amber}
                          />
                        </g>
                      )}

                      {/* Striker Batting Dot at Origin (0, -14) */}
                      <circle cx="0" cy="-14" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="0" cy="-14" r="7" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
                    </svg>
                  </div>

                  <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "center" }}>
                    Tap anywhere on the field to place shot
                  </div>
                </div>

                {/* Right Context Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Derived Spatial Badge */}
                  <div style={{ padding: "10px 12px", background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted }}>
                      DERIVED SPATIAL PLACEMENT
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 800, color: D.sky }}>
                        {tempWagonShot?.sector || "Cover"}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: "11px", padding: "2px 6px", borderRadius: D.pill, background: `${D.indigo}25`, color: D.indigo }}>
                        {tempWagonShot?.side || "OFF"} SIDE
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                        Depth: {tempWagonShot?.depth || "infield"} ({tempWagonShot?.radius || 0.7})
                      </span>
                    </div>
                  </div>

                  {/* 1-Tap Quick Sector Selector */}
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                      QUICK FIELD SECTOR
                    </label>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {QUICK_SECTORS.map(sec => (
                        <button
                          key={sec.label}
                          onClick={() => {
                            const classified = classifyWagonCoordinates(sec.x, sec.y, activeBatHand);
                            setTempWagonShot(classified);
                          }}
                          style={{
                            padding: "3px 8px",
                            borderRadius: D.sm,
                            background: tempWagonShot?.sector.includes(sec.label) ? D.sky : D.surf2,
                            border: `1px solid ${D.border}`,
                            color: tempWagonShot?.sector.includes(sec.label) ? "#fff" : D.textSecondary,
                            fontFamily: D.body,
                            fontSize: "10px",
                            cursor: "pointer",
                          }}
                        >
                          {sec.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shot Stroke Classification */}
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                      SHOT STROKE TYPE
                    </label>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {[
                        "Cover Drive",
                        "Straight Drive",
                        "Square Cut",
                        "Pull Shot",
                        "Hook",
                        "Sweep",
                        "Flick off Hips",
                        "Forward Defence",
                        "Lofted Drive",
                        "Upper Cut",
                        "Edge",
                      ].map(st => (
                        <button
                          key={st}
                          onClick={() => setTempShotType(st)}
                          style={{
                            padding: "3px 8px",
                            borderRadius: D.sm,
                            background: tempShotType === st ? D.emerald : D.surf2,
                            border: `1px solid ${D.border}`,
                            color: tempShotType === st ? "#fff" : D.textSecondary,
                            fontFamily: D.body,
                            fontSize: "10px",
                            cursor: "pointer",
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pitch Delivery Line & Length (FULL Profile) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                        DELIVERY LINE
                      </label>
                      <select
                        value={tempLine}
                        onChange={e => setTempLine(e.target.value as any)}
                        style={{
                          width: "100%",
                          padding: "6px",
                          borderRadius: D.sm,
                          background: D.surf2,
                          border: `1px solid ${D.border}`,
                          color: D.textPrimary,
                          fontFamily: D.body,
                          fontSize: "11px",
                        }}
                      >
                        <option value="outside_off">Outside Off</option>
                        <option value="off_stump">Off Stump</option>
                        <option value="middle">Middle Stump</option>
                        <option value="leg_stump">Leg Stump</option>
                        <option value="down_leg">Down Leg</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, display: "block", marginBottom: "4px" }}>
                        DELIVERY LENGTH
                      </label>
                      <select
                        value={tempLength}
                        onChange={e => setTempLength(e.target.value as any)}
                        style={{
                          width: "100%",
                          padding: "6px",
                          borderRadius: D.sm,
                          background: D.surf2,
                          border: `1px solid ${D.border}`,
                          color: D.textPrimary,
                          fontFamily: D.body,
                          fontSize: "11px",
                        }}
                      >
                        <option value="full">Full / Half-Volley</option>
                        <option value="good_length">Good Length</option>
                        <option value="back_of_length">Back of Length</option>
                        <option value="short">Short Pitch</option>
                        <option value="yorker">Yorker</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commit Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => setEnrichmentModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: D.pill,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textMuted,
                    fontFamily: D.head,
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEnrichment}
                  className="pressBtn"
                  style={{
                    padding: "8px 20px",
                    borderRadius: D.pill,
                    background: D.emerald,
                    border: "none",
                    color: "#fff",
                    fontFamily: D.head,
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: `0 4px 14px ${D.emerald}40`,
                  }}
                >
                  ✓ Commit Phase 2 Enrichment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PHASE 3 AUDIT & AMENDMENT MODAL ── */}
        {amendModalOpen && amendingDelivery && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              zIndex: 10003,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "460px",
                background: D.surf1,
                border: `1px solid ${D.borderMed}`,
                borderRadius: D.lg,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.sky }}>
                📝 AMEND HISTORICAL DELIVERY (BALL {amendingDelivery.timestamp})
              </div>
              <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                Amendments are committed with an auditable reason code according to zero-trust event sourcing.
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: "11px", color: D.textSecondary, display: "block", marginBottom: "4px" }}>
                  Corrected Runs:
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[0, 1, 2, 3, 4, 6].map(r => (
                    <button
                      key={r}
                      onClick={() => setAmendedRuns(r)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: D.sm,
                        background: amendedRuns === r ? D.sky : D.surf2,
                        color: amendedRuns === r ? "#fff" : D.textPrimary,
                        border: `1px solid ${D.border}`,
                        fontFamily: D.mono,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: "11px", color: D.textSecondary, display: "block", marginBottom: "4px" }}>
                  Audit Amendment Reason:
                </label>
                <select
                  value={amendmentReason}
                  onChange={e => setAmendmentReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: D.sm,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: "12px",
                  }}
                >
                  <option value="Umpire boundary signal corrected from 4 to 3">Umpire boundary signal corrected from 4 to 3</option>
                  <option value="Overthrow runs added after official check">Overthrow runs added after official check</option>
                  <option value="Scorer mistouch during fast play">Scorer mistouch during fast play</option>
                  <option value="Leg bye corrected to off bat">Leg bye corrected to off bat</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  onClick={() => setAmendModalOpen(false)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: D.pill,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textMuted,
                    fontFamily: D.head,
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAmendment}
                  style={{
                    padding: "6px 16px",
                    borderRadius: D.pill,
                    background: D.sky,
                    border: "none",
                    color: "#000",
                    fontFamily: D.head,
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Save Amendment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DISMISSAL MODAL ── */}
        {wicketModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 10001,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "480px",
                background: D.surf1,
                border: `1px solid ${D.borderMed}`,
                borderRadius: D.lg,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.rose }}>
                ⚡ RECORD WICKET DISMISSAL
              </div>
              <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted }}>
                Striker {matchDerivedState.striker.name} ({matchDerivedState.striker.runs} runs)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {["Caught", "Bowled", "LBW", "Run Out", "Stumped", "Hit Wicket"].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      handleScoreBall(0, undefined, true, type.toLowerCase());
                      setWicketModalOpen(false);
                    }}
                    style={{
                      padding: "10px",
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.head,
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setWicketModalOpen(false)}
                style={{
                  padding: "8px",
                  borderRadius: D.pill,
                  background: D.surf3,
                  border: "none",
                  color: D.textMuted,
                  fontFamily: D.head,
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Full Scorecard Modal */}
        {scorecardModalOpen && (
          <ScorecardModal
            theme={D}
            scorecard={MATCH_SCORECARDS[activeMatch?.id || "m1"] || MATCH_SCORECARDS["m1"]}
            onClose={() => setScorecardModalOpen(false)}
          />
        )}

        {/* Scoring Modes Comparison Guide Modal */}
        {modeGuideModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 10005,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "720px",
                background: D.surf1,
                border: `1px solid ${D.borderMed}`,
                borderRadius: D.xl,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                boxShadow: "0 24px 48px rgba(0,0,0,0.7)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
                    ⚡ SCORING CAPTURE PROFILES
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
                    Choose the capture depth that suits your match format, scorer staffing, and broadcast needs.
                  </div>
                </div>
                <button
                  onClick={() => setModeGuideModalOpen(false)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textMuted,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                {/* QUICK CARD */}
                <div
                  onClick={() => {
                    setCaptureProfile("QUICK");
                    setRightPanelTab("quicklog");
                    setModeGuideModalOpen(false);
                  }}
                  style={{
                    padding: "16px",
                    borderRadius: D.lg,
                    background: captureProfile === "QUICK" ? `${D.amber}15` : D.surf2,
                    border: `2px solid ${captureProfile === "QUICK" ? D.amber : D.border}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.amber }}>
                      ⚡ QUICK
                    </span>
                    {captureProfile === "QUICK" && (
                      <span style={{ padding: "1px 6px", borderRadius: D.pill, background: D.amber, color: "#000", fontSize: "9px", fontFamily: D.mono, fontWeight: 800 }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary }}>
                    1-Tap Fast Entry
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, lineHeight: "1.4" }}>
                    Zero modals. Click any run or extra button to immediately record the ball and update the scoreboard. Perfect for fast-paced games or solo scorers.
                  </div>
                  <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: `1px solid ${D.border}`, fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                    • No wagon prompts<br />
                    • Direct ball stream<br />
                    • Minimal cognitive load
                  </div>
                </div>

                {/* STANDARD CARD */}
                <div
                  onClick={() => {
                    setCaptureProfile("STANDARD");
                    setRightPanelTab("wagon");
                    setModeGuideModalOpen(false);
                  }}
                  style={{
                    padding: "16px",
                    borderRadius: D.lg,
                    background: captureProfile === "STANDARD" ? `${D.sky}15` : D.surf2,
                    border: `2px solid ${captureProfile === "STANDARD" ? D.sky : D.border}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.sky }}>
                      🎯 STANDARD
                    </span>
                    {captureProfile === "STANDARD" && (
                      <span style={{ padding: "1px 6px", borderRadius: D.pill, background: D.sky, color: "#000", fontSize: "9px", fontFamily: D.mono, fontWeight: 800 }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary }}>
                    Wagon Wheel & Overlay
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, lineHeight: "1.4" }}>
                    Full scoring keypad with quick 8-sector Wagon Wheel HUD and boundary shot enrichment for live broadcast graphics and wagon wheel visualizers.
                  </div>
                  <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: `1px solid ${D.border}`, fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                    • 8-sector field picker<br />
                    • Shot type classification<br />
                    • Live wagon graphics
                  </div>
                </div>

                {/* FULL PRO CARD */}
                <div
                  onClick={() => {
                    setCaptureProfile("FULL");
                    setRightPanelTab("pitchmap");
                    setModeGuideModalOpen(false);
                  }}
                  style={{
                    padding: "16px",
                    borderRadius: D.lg,
                    background: captureProfile === "FULL" ? `${D.indigo}15` : D.surf2,
                    border: `2px solid ${captureProfile === "FULL" ? D.indigo : D.border}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.indigo }}>
                      📊 FULL PRO
                    </span>
                    {captureProfile === "FULL" && (
                      <span style={{ padding: "1px 6px", borderRadius: D.pill, background: D.indigo, color: "#fff", fontSize: "9px", fontFamily: D.mono, fontWeight: 800 }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary }}>
                    Pro Analytics Telemetry
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, lineHeight: "1.4" }}>
                    Complete telemetry suite: 2D Pitch Line & Length mapping, bowling speed & pace variation, contact quality (middled/edge/mishit), and fielders.
                  </div>
                  <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: `1px solid ${D.border}`, fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                    • Pitch length radar<br />
                    • Speed & contact quality<br />
                    • Deep analyst stats
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setModeGuideModalOpen(false)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: D.pill,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.head,
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE MATCH SETTINGS MODAL ── */}
        <LiveMatchSettingsModal
          theme={D}
          isOpen={matchSettingsModalOpen}
          onClose={() => setMatchSettingsModalOpen(false)}
          settings={matchSettings}
          onUpdateSettings={(newSettings) => setMatchSettings(prev => ({ ...prev, ...newSettings }))}
          homeTeam={homeTitle}
          awayTeam={awayTitle}
          currentOvers={matchDerivedState.oversStr}
          currentRuns={matchDerivedState.totalRuns}
          currentWickets={matchDerivedState.totalWickets}
        />

        {/* ── LINEUPS & BOWLER ROTATION MANAGEMENT MODAL ── */}
        <LineupsBowlersModal
          theme={D}
          isOpen={lineupsModalOpen}
          onClose={() => setLineupsModalOpen(false)}
          battingSquad={battingSquad}
          bowlingAttack={bowlingAttack}
          activeStrikerId={activeStrikerId}
          activeNonStrikerId={activeNonStrikerId}
          activeBowlerId={activeBowlerId}
          onSelectStriker={id => {
            setActiveStrikerId(id);
            const b = battingSquad.find(p => p.id === id);
            if (b && (b.battingHand || b.hand)) setActiveBatHand(b.battingHand || b.hand);
          }}
          onSelectNonStriker={setActiveNonStrikerId}
          onSelectBowler={setActiveBowlerId}
          onUpdateBattingSquad={setBattingSquad}
          onUpdateBowlingAttack={setBowlingAttack}
          onReorderBattingLineup={setBattingSquad}
          onReorderBowlingAttack={setBowlingAttack}
          maxOversPerBowler={matchSettings.maxOversPerBowler}
        />

        {/* ── FIELD PLACEMENT EDITOR MODAL ── */}
        <FieldPlacementEditorModal
          theme={D}
          isOpen={fieldEditorOpen}
          onClose={() => setFieldEditorOpen(false)}
        />
      </div>
    </div>
  );
}
