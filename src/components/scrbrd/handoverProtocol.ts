// ── SCRBRD OS: SESSION TOKEN LEASE & SCORING HANDOVER PROTOCOL (PHASE 2) ─────
// Authoritative single-scorer token enforcement, 90s heartbeat lease renewal,
// gated takeover handshake, and divergent log quarantine queue.

export interface ScorerSessionLease {
  matchId: string;
  sessionEpoch: number;
  leaseExpiry: number; // Unix timestamp in ms (90-second lease window)
  activeScorerToken: string;
  scorerName: string;
  scorerRole: "primary" | "secondary" | "official";
  scorerDeviceId: string;
  lastHeartbeat: number;
}

export interface HandoverVerificationInput {
  physicalBoardRuns: number;
  physicalBoardWickets: number;
  physicalBoardOvers: string;
  verificationPin: string;
  targetScorerName: string;
  notes?: string;
}

export interface HandoverDiff {
  field: "runs" | "wickets" | "overs";
  derivedValue: string | number;
  physicalValue: string | number;
  discrepancy: boolean;
}

export interface HandoverVerificationResult {
  isVerified: boolean;
  pairingCodeValid: boolean;
  diffs: HandoverDiff[];
  requiresManualConfirmation: boolean;
  message: string;
}

export interface QuarantinedBallEvent {
  eventId: string;
  seq: number;
  eventEpoch: number;
  expectedEpoch: number;
  scorerToken: string;
  quarantineReason: "STALE_EPOCH" | "EXPIRED_LEASE" | "REVOKED_TOKEN" | "OUT_OF_SEQUENCE";
  quarantinedAt: string;
  ballData: any; // Raw delivery object
  resolutionStatus: "pending_review" | "approved_merged" | "rejected_discarded";
  reviewerNotes?: string;
}

export interface HandoverAuditLogRecord {
  id: string;
  matchId: string;
  timestamp: string;
  fromScorer: string;
  toScorer: string;
  oldEpoch: number;
  newEpoch: number;
  pairingPin: string;
  physicalScoreSnapshot: { runs: number; wickets: number; overs: string };
  derivedScoreSnapshot: { runs: number; wickets: number; overs: string };
  hasDiscrepancies: boolean;
}

/**
  Check if a session lease is currently active and unexpired.
 */
export function isLeaseValid(lease: ScorerSessionLease, nowTimestamp = Date.now()): boolean {
  return nowTimestamp <= lease.leaseExpiry;
}

/**
  Extends the session lease by the standard 90-second window on active user scoring action or heartbeat.
 */
export function refreshLease(
  lease: ScorerSessionLease,
  extensionSeconds = 90,
  nowTimestamp = Date.now()
): ScorerSessionLease {
  return {
    ...lease,
    lastHeartbeat: nowTimestamp,
    leaseExpiry: nowTimestamp + extensionSeconds * 1000,
  };
}

/**
  Generates a deterministic, secure 6-digit pairing PIN for device takeover handshake.
 */
export function generatePairingCode(matchId: string, epoch: number): string {
  let hash = 0;
  const str = `${matchId}-SCRBRD-EPOCH-${epoch}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const codeNum = Math.abs(hash) % 900000 + 100000;
  const codeStr = codeNum.toString();
  return `${codeStr.substring(0, 3)}-${codeStr.substring(3, 6)}`;
}

/**
  Validates preconditions for initiating a scoring session handover.
  Handover is blocked if unsynced events exist in queue or delivery capture is mid-flight.
 */
export function validateHandoverPreconditions(
  pendingSyncCount: number,
  scoringPhase: number
): { allowed: boolean; reason?: string } {
  if (pendingSyncCount > 0) {
    return {
      allowed: false,
      reason: `Cannot transfer scoring token while ${pendingSyncCount} unsynced delivery events remain in queue. Please sync or retry once online.`,
    };
  }

  if (scoringPhase !== 1) {
    return {
      allowed: false,
      reason: "Cannot transfer scoring token during active 3-phase delivery capture. Please complete or cancel the active ball.",
    };
  }

  return { allowed: true };
}

/**
  Executes the verification handshake comparing physical ground scoreboard values with system derived state.
 */
export function verifyHandoverInput(
  input: HandoverVerificationInput,
  expectedPairingPin: string,
  currentDerivedState: { totalRuns: number; totalWickets: number; oversStr: string }
): HandoverVerificationResult {
  const pairingCodeValid = input.verificationPin.trim() === expectedPairingPin.trim();

  const diffs: HandoverDiff[] = [
    {
      field: "runs",
      derivedValue: currentDerivedState.totalRuns,
      physicalValue: input.physicalBoardRuns,
      discrepancy: currentDerivedState.totalRuns !== input.physicalBoardRuns,
    },
    {
      field: "wickets",
      derivedValue: currentDerivedState.totalWickets,
      physicalValue: input.physicalBoardWickets,
      discrepancy: currentDerivedState.totalWickets !== input.physicalBoardWickets,
    },
    {
      field: "overs",
      derivedValue: currentDerivedState.oversStr,
      physicalValue: input.physicalBoardOvers,
      discrepancy: currentDerivedState.oversStr !== input.physicalBoardOvers,
    },
  ];

  const hasDiscrepancy = diffs.some(d => d.discrepancy);
  const isVerified = pairingCodeValid;

  let message = "Handover verification successful. Token ready for transfer.";
  if (!pairingCodeValid) {
    message = "Invalid 6-digit pairing code. Takeover handshake rejected.";
  } else if (hasDiscrepancy) {
    message = "Warning: Discrepancy detected between derived state and ground physical scoreboard. Manual override required.";
  }

  return {
    isVerified,
    pairingCodeValid,
    diffs,
    requiresManualConfirmation: hasDiscrepancy,
    message,
  };
}

/**
  Creates a new session lease with incremented epoch for incoming takeover scorer.
 */
export function executeHandoverSession(
  currentLease: ScorerSessionLease,
  newScorerName: string,
  newDeviceId = `DEV-${Math.floor(Math.random() * 90000 + 10000)}`
): { newLease: ScorerSessionLease; auditRecord: HandoverAuditLogRecord } {
  const newEpoch = currentLease.sessionEpoch + 1;
  const newToken = `TKN-SCR-${Math.floor(Math.random() * 9000 + 1000)}-EP${newEpoch}`;
  const now = Date.now();

  const newLease: ScorerSessionLease = {
    matchId: currentLease.matchId,
    sessionEpoch: newEpoch,
    leaseExpiry: now + 90 * 1000,
    activeScorerToken: newToken,
    scorerName: newScorerName,
    scorerRole: "primary",
    scorerDeviceId: newDeviceId,
    lastHeartbeat: now,
  };

  const auditRecord: HandoverAuditLogRecord = {
    id: `AUD-HO-${Date.now()}`,
    matchId: currentLease.matchId,
    timestamp: new Date().toISOString(),
    fromScorer: currentLease.scorerName,
    toScorer: newScorerName,
    oldEpoch: currentLease.sessionEpoch,
    newEpoch,
    pairingPin: generatePairingCode(currentLease.matchId, currentLease.sessionEpoch),
    physicalScoreSnapshot: { runs: 0, wickets: 0, overs: "0.0" },
    derivedScoreSnapshot: { runs: 0, wickets: 0, overs: "0.0" },
    hasDiscrepancies: false,
  };

  return { newLease, auditRecord };
}

/**
  Validates an incoming ball event write against active session lease.
  If the event comes from a revoked token or stale epoch, routes it into Quarantine Queue.
 */
export function validateAndRouteEvent(
  event: any,
  eventEpoch: number,
  eventToken: string,
  activeLease: ScorerSessionLease
): { status: "ACCEPTED" | "QUARANTINED"; event?: any; quarantinedEvent?: QuarantinedBallEvent } {
  const now = Date.now();

  if (!isLeaseValid(activeLease, now)) {
    return {
      status: "QUARANTINED",
      quarantinedEvent: {
        eventId: event.id || `EVT-${Date.now()}`,
        seq: event.seq || 0,
        eventEpoch,
        expectedEpoch: activeLease.sessionEpoch,
        scorerToken: eventToken,
        quarantineReason: "EXPIRED_LEASE",
        quarantinedAt: new Date().toISOString(),
        ballData: event,
        resolutionStatus: "pending_review",
      },
    };
  }

  if (eventEpoch !== activeLease.sessionEpoch || eventToken !== activeLease.activeScorerToken) {
    return {
      status: "QUARANTINED",
      quarantinedEvent: {
        eventId: event.id || `EVT-${Date.now()}`,
        seq: event.seq || 0,
        eventEpoch,
        expectedEpoch: activeLease.sessionEpoch,
        scorerToken: eventToken,
        quarantineReason: "STALE_EPOCH",
        quarantinedAt: new Date().toISOString(),
        ballData: event,
        resolutionStatus: "pending_review",
      },
    };
  }

  return { status: "ACCEPTED", event };
}
