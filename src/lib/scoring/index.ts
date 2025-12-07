/**
 * SCRBRD Scoring Module
 * =====================
 * 
 * This module provides the event-sourced scoring engine for SCRBRD.
 * 
 * Architecture:
 * - ScoringAction is the SINGLE SOURCE OF TRUTH for all ball-by-ball data
 * - LiveScoreProjection is DERIVED from ScoringAction events
 * - All stats, scorecards, and views are computed from the event log
 * 
 * @see /docs/SCHEMA_V3_PROPOSAL.md for full architecture documentation
 */

// Types
export * from '@/types/scoring';

// Projection computation
export {
    computeProjection,
    recomputeProjection,
    validateProjection,
    formatOvers,
    calculateStrikeRate,
    calculateEconomy,
    calculateRunRate,
    formatBallDisplay,
    formatDismissal,
} from './projectionService';
