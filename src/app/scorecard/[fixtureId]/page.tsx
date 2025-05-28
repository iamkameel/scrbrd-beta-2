
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fixtures as allFixtures, type Fixture } from '@/lib/fixtures-data';
import { resultsData, type Result, type InningsData, type BatsmanScore, type BowlerScore, FallOfWicket } from '@/lib/results-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Helper function to get top batsmen for a team
function getTopBatsmen(teamName: string, inningsData: InningsData[] | undefined, count: number): BatsmanScore[] {
  if (!inningsData) return [];
  const allTeamBattingScores: BatsmanScore[] = [];
  inningsData.forEach(inning => {
    if (inning.battingTeam === teamName) {
      allTeamBattingScores.push(...inning.battingScores.filter(bs => typeof bs.runs === 'number'));
    }
  });

  return allTeamBattingScores
    .sort((a, b) => b.runs - a.runs)
    .slice(0, count);
}

// Helper function to get top bowlers for a team
function getTopBowlers(teamName: string, inningsData: InningsData[] | undefined, count: number): BowlerScore[] {
  if (!inningsData) return [];
  const allTeamBowlingScores: BowlerScore[] = [];
  inningsData.forEach(inning => {
    if (inning.bowlingTeam === teamName) {
      allTeamBowlingScores.push(...inning.bowlingScores.filter(bs => typeof bs.wickets === 'number' && typeof bs.runsConceded === 'number'));
    }
  });

  return allTeamBowlingScores
    .sort((a, b) => {
      if (b.wickets !== a.wickets) {
        return b.wickets - a.wickets;
      }
      return a.runsConceded - b.runsConceded;
    })
    .slice(0, count);
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface PartnershipUIData {
  wicketOrdinal: string;
  batsman1: { name: string; scoreDisplay: string };
  batsman2: { name: string; scoreDisplay: string };
  partnershipRuns: number;
}

function formatBatsmanScore(batsman: BatsmanScore | undefined): string {
  if (!batsman) return "N/A";
  return `${batsman.runs} (${batsman.balls})`;
}

function generatePartnershipUIData(innings: InningsData): PartnershipUIData[] {
  const partnershipData: PartnershipUIData[] = [];
  if (!innings.battingScores || innings.battingScores.length === 0) return partnershipData;

  let currentScore = 0;
  let activeBatsmenIndices = [0, 1]; // Start with openers

  const getBatsmanDetails = (name: string | undefined): { name: string; scoreDisplay: string } => {
    if (!name) return { name: "N/A", scoreDisplay: "" };
    const batsmanRecord = innings.battingScores.find(bs => bs.name === name);
    return { name, scoreDisplay: formatBatsmanScore(batsmanRecord) };
  };
  
  const getBatsmanByName = (name: string): BatsmanScore | undefined => {
    return innings.battingScores.find(bs => bs.name === name);
  }

  if (innings.fallOfWickets && innings.fallOfWickets.length > 0) {
    innings.fallOfWickets.forEach((fow, index) => {
      const partnershipRuns = fow.score - currentScore;
      const wicketOrdinal = getOrdinal(fow.wicket);

      const dismissedBatsmanName = fow.batsmanOut;
      let partnerName = "";

      // Determine partner:
      // This logic is an approximation based on batting order and who got out.
      // Assumes battingScores is in batting order.
      const dismissedBatsmanIndexInBattingOrder = innings.battingScores.findIndex(b => b.name === dismissedBatsmanName);
      
      // Find who was at the crease with the dismissed batsman.
      // This requires tracking active batsmen. For simplicity, we'll use the players assumed to be at the crease
      // based on batting order up to the point of this wicket.
      // Batsmen involved in Nth wicket partnership are roughly battingScores[N-1] and battingScores[N-2]
      // (or openers for 1st wicket). One of them is dismissed.
      
      let b1Name = "";
      let b2Name = "";

      if (fow.wicket === 1) { // 1st wicket
        b1Name = innings.battingScores[0]?.name || "Batsman 1";
        b2Name = innings.battingScores[1]?.name || "Batsman 2";
      } else {
        // For wicket W, the new batsman is battingScores[W-1] (0-indexed)
        // The existing batsman is one of those from the previous partnership who didn't get out.
        // This simplified logic identifies the batsman who got out and assumes the (W-1)th batsman in batting order was the partner if not the one dismissed.
        // Or, more directly, the players involved are typically around index `fow.wicket -1` and `fow.wicket -2` in battingScores
        const potentialPartner1Idx = fow.wicket - 2 >= 0 ? fow.wicket - 2 : 0; // previous batsman
        const potentialPartner2Idx = fow.wicket - 1 >= 0 ? fow.wicket - 1 : 1; // current new batsman or other opener
        
        const p1 = innings.battingScores[potentialPartner1Idx];
        const p2 = innings.battingScores[potentialPartner2Idx];

        if (p1?.name === dismissedBatsmanName) {
            b1Name = p1.name;
            b2Name = p2?.name || `Batsman ${fow.wicket+1}`;
        } else if (p2?.name === dismissedBatsmanName) {
            b1Name = p2.name;
            b2Name = p1?.name || `Batsman ${fow.wicket-1 > 0 ? fow.wicket-1 : 1}`;
        } else {
            // Fallback if names don't match (e.g. run out of non-facing batsman, complex scenarios)
            b1Name = dismissedBatsmanName;
            // Try to find a sensible partner from those who batted around this wicket
            const otherBatsmen = innings.battingScores.filter(b => b.name !== dismissedBatsmanName);
            if (index > 0 && innings.fallOfWickets) { // Find who was NOT out in previous FOW
                 const prevFow = innings.fallOfWickets[index-1];
                 if (prevFow.batsmanOut !== innings.battingScores[fow.wicket-2]?.name) {
                    b2Name = innings.battingScores[fow.wicket-2]?.name || "Partner";
                 } else {
                    b2Name = innings.battingScores[fow.wicket-1]?.name || "Partner";
                 }
            } else {
                 b2Name = innings.battingScores.find(b => b.name !== dismissedBatsmanName && innings.battingScores.indexOf(b) < 2)?.name || "Partner";
            }

        }
      }


      partnershipData.push({
        wicketOrdinal: `${wicketOrdinal} Wicket`,
        batsman1: getBatsmanDetails(b1Name === dismissedBatsmanName ? dismissedBatsmanName : b2Name),
        batsman2: getBatsmanDetails(b1Name === dismissedBatsmanName ? b2Name : dismissedBatsmanName),
        partnershipRuns,
      });
      currentScore = fow.score;
    });
  }

  // Final partnership (if not all out)
  const totalRuns = parseInt(innings.totalScoreString.split('/')[0]);
  const wicketsFallen = innings.fallOfWickets ? innings.fallOfWickets.length : 0;

  if (wicketsFallen < 10 && totalRuns > currentScore) {
    const partnershipRuns = totalRuns - currentScore;
    const wicketOrdinal = getOrdinal(wicketsFallen + 1);
    
    // Identify the not out batsmen
    // The last dismissed batsman was fallOfWickets[wicketsFallen-1].batsmanOut
    // The batsman who came in at that wicket is battingScores[wicketsFallen].name
    // The other not out batsman was the partner in the last FOW who didn't get out.

    let b1Name = "";
    let b2Name = "";

    if (wicketsFallen > 0 && innings.battingScores[wicketsFallen-1] && innings.battingScores[wicketsFallen]) {
        // One is the last man dismissed (fow.batsmanOut), other is who came in at that wicket. No, this is wrong.
        // Batsmen are those at the crease.
        // Find not out batsmen from battingScores
        const notOutBatsmen = innings.battingScores.filter(bs => bs.dismissal.toLowerCase().includes('not out'));
        if (notOutBatsmen.length >= 2) {
            b1Name = notOutBatsmen[0].name;
            b2Name = notOutBatsmen[1].name;
        } else if (notOutBatsmen.length === 1 && wicketsFallen > 0) {
            b1Name = notOutBatsmen[0].name;
            // The partner was the one who formed the last partnership with this notOutBatsman
            // This would be the batsman at battingScores[wicketsFallen-1] if they are not the notOutBatsman
            if(innings.battingScores[wicketsFallen-1]?.name !== b1Name) {
                b2Name = innings.battingScores[wicketsFallen-1]?.name || "Partner";
            } else {
                 b2Name = innings.battingScores[wicketsFallen]?.name || "Partner"; // Should be next batsman
            }
        } else if (wicketsFallen === 0 && innings.battingScores.length >=2) { // Opening not out partnership
            b1Name = innings.battingScores[0].name;
            b2Name = innings.battingScores[1].name;
        }

    } else if (wicketsFallen === 0 && innings.battingScores.length >= 2) { // Openers still batting
        b1Name = innings.battingScores[0].name;
        b2Name = innings.battingScores[1].name;
    }


    if (b1Name && b2Name) {
        partnershipData.push({
            wicketOrdinal: `${wicketOrdinal} Wicket (not out)`,
            batsman1: getBatsmanDetails(b1Name),
            batsman2: getBatsmanDetails(b2Name),
            partnershipRuns,
        });
    } else if (partnershipRuns > 0) { // If only one batsman identifiable or other complex case
        partnershipData.push({
            wicketOrdinal: `${wicketOrdinal} Wicket (not out)`,
            batsman1: getBatsmanDetails(innings.battingScores[wicketsFallen]?.name || "Batsman"),
            batsman2: { name: "Partner", scoreDisplay: ""},
            partnershipRuns,
        });
    }
  }
  return partnershipData.filter(p => p.partnershipRuns >= 0); // Ensure non-negative partnership runs
}


export default function ScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = params.fixtureId ? parseInt(params.fixtureId as string, 10) : null;

  const fixture: Fixture | undefined = fixtureId ? allFixtures.find(f => f.id === fixtureId) : undefined;
  const result: Result | undefined = fixtureId ? resultsData.find(r => r.fixtureId === fixtureId) : undefined;

  if (!fixture || !result) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Scorecard Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Sorry, we couldn't find a scorecard for this fixture. It might be an upcoming match or data is not yet available.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultTabValue = result.innings && result.innings.length > 0 ? `innings-${result.innings[0].inningsNumber}` : "";

  const topTeamABatsmen = getTopBatsmen(result.teamA, result.innings, 2);
  const topTeamABowlers = getTopBowlers(result.teamA, result.innings, 2);
  const topTeamBBatsmen = getTopBatsmen(result.teamB, result.innings, 2);
  const topTeamBBowlers = getTopBowlers(result.teamB, result.innings, 2);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Match Scorecard: {fixture.teamA} vs {fixture.teamB}</CardTitle>
          <CardDescription>
            Played on {format(new Date(fixture.date), 'EEEE, MMMM d, yyyy')} at {fixture.location}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Summary */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">Match Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg ">
                <div className="text-center md:text-left">
                  <p className="font-semibold text-lg">{result.teamA}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">{result.teamAScore}</p>
                </div>
                <p className="text-xl font-medium text-muted-foreground">vs</p>
                <div className="text-center md:text-right">
                  <p className="font-semibold text-lg">{result.teamB}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">{result.teamBScore}</p>
                </div>
              </div>
              <div className="text-center mt-4 p-3 bg-background rounded-md shadow">
                <p className="text-lg font-semibold text-[hsl(var(--accent))] flex items-center justify-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  {result.winner} won by {result.margin}
                </p>
              </div>

              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">{result.teamA} - Top Performers</h3>
                  { (topTeamABatsmen.length > 0 || topTeamABowlers.length > 0) ? (
                    <div className="space-y-2">
                      {topTeamABatsmen.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Top Batsmen</p>
                          <ul className="space-y-1 mb-3">
                            {topTeamABatsmen.map((batsman, index) => (
                              <li key={`tA-batsman-${index}`} className="text-sm flex justify-between items-center">
                                <span className="font-semibold">{batsman.name}</span>
                                <span className="font-bold text-foreground">{batsman.runs} ({batsman.balls})</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {topTeamABowlers.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Top Bowlers</p>
                          <ul className="space-y-1">
                            {topTeamABowlers.map((bowler, index) => ( 
                              <li key={`tA-bowler-${index}`} className="text-sm flex justify-between items-center">
                                <span className="font-semibold">{bowler.name}</span>
                                <span className="font-bold text-foreground">{bowler.runsConceded}/{bowler.wickets} ({bowler.overs} ov)</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">No top performer data available for this team.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">{result.teamB} - Top Performers</h3>
                   { (topTeamBBatsmen.length > 0 || topTeamBBowlers.length > 0) ? (
                    <div className="space-y-2">
                      {topTeamBBatsmen.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Top Batsmen</p>
                          <ul className="space-y-1 mb-3">
                            {topTeamBBatsmen.map((batsman, index) => (
                              <li key={`tB-batsman-${index}`} className="text-sm flex justify-between items-center">
                                <span className="font-semibold">{batsman.name}</span>
                                <span className="font-bold text-foreground">{batsman.runs} ({batsman.balls})</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {topTeamBBowlers.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Top Bowlers</p>
                          <ul className="space-y-1">
                            {topTeamBBowlers.map((bowler, index) => ( 
                              <li key={`tB-bowler-${index}`} className="text-sm flex justify-between items-center">
                                <span className="font-semibold">{bowler.name}</span>
                                <span className="font-bold text-foreground">{bowler.runsConceded}/{bowler.wickets} ({bowler.overs} ov)</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">No top performer data available for this team.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="text-xl">Player of the Match</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-md bg-muted p-4 rounded-md">
                <Star className="mr-3 h-6 w-6 text-yellow-500" />
                <p><strong className="font-semibold">{result.playerOfTheMatch}</strong></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Innings Details</CardTitle> 
              <CardDescription>Full batting, bowling, and partnership details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.innings && result.innings.length > 0 ? (
                <Tabs defaultValue={defaultTabValue} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-none md:flex md:flex-wrap justify-start">
                    {result.innings.map((inningData) => (
                      <TabsTrigger key={`trigger-innings-${inningData.inningsNumber}`} value={`innings-${inningData.inningsNumber}`}>
                        Innings {inningData.inningsNumber}: {inningData.battingTeam}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {result.innings.map((inningData, index) => {
                    const partnershipVisualData = generatePartnershipUIData(inningData);
                    return (
                    <TabsContent key={`content-innings-${inningData.inningsNumber}`} value={`innings-${inningData.inningsNumber}`} className="mt-4">
                      <Accordion type="multiple" defaultValue={['batting', 'bowling', 'fow', 'partnerships']} className="w-full space-y-4">
                        <AccordionItem value="batting">
                          <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                            Batting - {inningData.battingTeam} ({inningData.totalScoreString} in {inningData.oversPlayed})
                          </AccordionTrigger>
                          <AccordionContent className="p-0 border border-t-0 rounded-b-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Batsman</TableHead>
                                  <TableHead>Dismissal</TableHead>
                                  <TableHead className="text-right">R</TableHead>
                                  <TableHead className="text-right">B</TableHead>
                                  <TableHead className="text-right">4s</TableHead>
                                  <TableHead className="text-right">6s</TableHead>
                                  <TableHead className="text-right">SR</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {inningData.battingScores.map((batter) => (
                                  <TableRow key={batter.name}>
                                    <TableCell className="font-medium">{batter.name}</TableCell>
                                    <TableCell>{batter.dismissal}</TableCell>
                                    <TableCell className="text-right">{batter.runs}</TableCell>
                                    <TableCell className="text-right">{batter.balls}</TableCell>
                                    <TableCell className="text-right">{batter.fours}</TableCell>
                                    <TableCell className="text-right">{batter.sixes}</TableCell>
                                    <TableCell className="text-right">{batter.strikeRate}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={2} className="font-medium">Extras</TableCell>
                                    <TableCell className="text-right" colSpan={5}>{inningData.extras.total} {inningData.extras.details}</TableCell>
                                </TableRow>
                                <TableRow className="bg-muted/50">
                                    <TableCell colSpan={2} className="font-bold text-lg">Total</TableCell>
                                    <TableCell className="text-right font-bold text-lg" colSpan={5}>{inningData.totalScoreString} ({inningData.oversPlayed})</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="bowling">
                          <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                            Bowling - {inningData.bowlingTeam}
                          </AccordionTrigger>
                          <AccordionContent className="p-0 border border-t-0 rounded-b-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Bowler</TableHead>
                                  <TableHead className="text-right">O</TableHead>
                                  <TableHead className="text-right">M</TableHead>
                                  <TableHead className="text-right">R</TableHead>
                                  <TableHead className="text-right">W</TableHead>
                                  <TableHead className="text-right">Econ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {inningData.bowlingScores.map((bowler) => (
                                  <TableRow key={bowler.name}>
                                    <TableCell className="font-medium">{bowler.name}</TableCell>
                                    <TableCell className="text-right">{bowler.overs}</TableCell>
                                    <TableCell className="text-right">{bowler.maidens}</TableCell>
                                    <TableCell className="text-right">{bowler.runsConceded}</TableCell>
                                    <TableCell className="text-right">{bowler.wickets}</TableCell>
                                    <TableCell className="text-right">{bowler.economyRate}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>

                        {inningData.fallOfWickets && inningData.fallOfWickets.length > 0 && (
                           <AccordionItem value="fow">
                            <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                              Fall of Wickets
                            </AccordionTrigger>
                            <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                                <p className="text-sm text-muted-foreground">
                                    {inningData.fallOfWickets.map((fow, idx) => (
                                        <span key={`fow-${idx}`}>
                                            {fow.wicket}-{fow.score} ({fow.batsmanOut}, {fow.over} ov){idx < inningData.fallOfWickets!.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </p>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        <AccordionItem value="partnerships">
                          <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                            Batting Partnerships
                          </AccordionTrigger>
                          <AccordionContent className="p-4 border border-t-0 rounded-b-md space-y-3">
                            {partnershipVisualData.length > 0 ? (
                              partnershipVisualData.map((p, idx) => (
                                <div key={`partnership-${idx}`} className="py-2">
                                  <p className="text-sm font-medium text-center mb-2 text-muted-foreground">{p.wicketOrdinal} Partnership: <span className="font-bold text-foreground">{p.partnershipRuns} runs</span></p>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="text-left w-[calc(50%-2rem)]">
                                      <p className="font-semibold">{p.batsman1.name}</p>
                                      <p className="text-xs text-muted-foreground">{p.batsman1.scoreDisplay}</p>
                                    </div>
                                    <div className="flex-shrink-0 h-px w-6 bg-border"></div> {/* Decorative line */}
                                    <div className="flex-shrink-0 text-lg font-bold p-2 border rounded-md bg-background shadow-sm min-w-[40px] text-center">
                                      {p.partnershipRuns}
                                    </div>
                                    <div className="flex-shrink-0 h-px w-6 bg-border"></div> {/* Decorative line */}
                                    <div className="text-right w-[calc(50%-2rem)]">
                                      <p className="font-semibold">{p.batsman2.name}</p>
                                      <p className="text-xs text-muted-foreground">{p.batsman2.scoreDisplay}</p>
                                    </div>
                                  </div>
                                   {idx < partnershipVisualData.length -1 && <Separator className="mt-3"/>}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Partnership data not available or could not be generated for this innings.
                              </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>

                      </Accordion>
                    </TabsContent>
                  )})}
                </Tabs>
              ) : (
                <p className="text-muted-foreground">
                  Detailed innings-by-innings scorecards are not yet available for this match or this feature is under development.
                </p>
              )}
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
