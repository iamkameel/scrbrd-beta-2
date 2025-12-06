// Results data fetching from Firestore
// Replaces legacy mock data with real database queries

import { fetchMatches, fetchMatchById } from './firestore';
import { Match } from '@/types/firestore';

export interface ResultWithTeamNames {
    id: string;
    fixtureId: string; // Alias for id, for backward compatibility
    teamAId: string;
    teamBId: string;
    teamAName: string;
    teamBName: string;
    teamAScore: string;
    teamBScore: string;
    date: string;
    status: string;
    winner?: string;
    margin?: string;
    playerOfTheMatch?: string;
    innings?: InningsData[];
}

export interface BatsmanScore {
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    dismissal: string;
}

export interface BowlerScore {
    name: string;
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    economyRate: number;
}

export interface FallOfWicket {
    wicket: number;
    score: number;
    batsmanOut: string;
    over: number;
}

export interface ExtrasData {
    total: number;
    details: string;
}

export interface InningsData {
    inningsNumber: number;
    battingTeam: string;
    bowlingTeam: string;
    totalScoreString: string;
    oversPlayed: string;
    battingScores: BatsmanScore[];
    bowlingScores: BowlerScore[];
    fallOfWickets: FallOfWicket[];
    extras: ExtrasData;
}

export interface FixtureWithTeamNames {
    id: string;
    teamAId: string;
    teamBId: string;
    teamAName: string;
    teamBName: string;
    venue?: string;
    location?: string;
    date: string;
    matchType: string;
}

export interface ScorecardData {
    fixture: FixtureWithTeamNames | null;
    result: ResultWithTeamNames | null;
    innings: InningsData[];
}

// Utility to convert Match to ResultWithTeamNames
function matchToResult(match: Match): ResultWithTeamNames {
    return {
        id: match.id,
        fixtureId: match.id, // Alias for backward compatibility
        teamAId: match.homeTeamId,
        teamBId: match.awayTeamId,
        teamAName: match.homeTeamName || match.homeTeamId,
        teamBName: match.awayTeamName || match.awayTeamId,
        teamAScore: match.score?.home || (match.homeScore ? String(match.homeScore) : ''),
        teamBScore: match.score?.away || (match.awayScore ? String(match.awayScore) : ''),
        date: match.dateTime || (typeof match.matchDate === 'string' ? match.matchDate : new Date().toISOString()),
        status: match.status,
        winner: match.completion?.winner === 'home'
            ? (match.homeTeamName || match.homeTeamId)
            : match.completion?.winner === 'away'
                ? (match.awayTeamName || match.awayTeamId)
                : match.result?.split(' ')[0] || undefined,
        margin: match.completion?.margin || match.result,
        playerOfTheMatch: match.completion?.playerOfTheMatch,
        innings: convertInningsData(match),
    };
}

// Convert match innings data to the format expected by scorecards
function convertInningsData(match: Match): InningsData[] {
    const innings: InningsData[] = [];

    if (match.inningsData?.firstInnings) {
        const first = match.inningsData.firstInnings;
        innings.push({
            inningsNumber: 1,
            battingTeam: first.teamId || match.homeTeamName || match.homeTeamId,
            bowlingTeam: match.awayTeamName || match.awayTeamId,
            totalScoreString: `${first.runs || 0}/${first.wickets || 0}`,
            oversPlayed: `${first.overs || 0} overs`,
            battingScores: (first.batsmen || first.battingCard || []).map((b: any) => ({
                name: b.playerId || 'Unknown',
                runs: b.runs || 0,
                balls: b.ballsFaced || b.balls || 0,
                fours: b.fours || 0,
                sixes: b.sixes || 0,
                strikeRate: b.strikeRate || (b.ballsFaced ? ((b.runs || 0) / b.ballsFaced * 100) : 0),
                dismissal: b.dismissal || (b.isOut ? 'out' : 'not out'),
            })),
            bowlingScores: (first.bowlers || first.bowlingCard || []).map((b: any) => ({
                name: b.playerId || 'Unknown',
                overs: b.overs || 0,
                maidens: b.maidens || 0,
                runsConceded: b.runsConceded || b.runs || 0,
                wickets: b.wickets || 0,
                economyRate: b.economy || (b.overs ? ((b.runsConceded || b.runs || 0) / b.overs) : 0),
            })),
            fallOfWickets: [],
            extras: {
                total: (first.extras?.wides || 0) + (first.extras?.noballs || 0) + (first.extras?.byes || 0) + (first.extras?.legbyes || 0),
                details: `(b ${first.extras?.byes || 0}, lb ${first.extras?.legbyes || 0}, w ${first.extras?.wides || 0}, nb ${first.extras?.noballs || 0})`,
            },
        });
    }

    if (match.inningsData?.secondInnings) {
        const second = match.inningsData.secondInnings;
        innings.push({
            inningsNumber: 2,
            battingTeam: second.teamId || match.awayTeamName || match.awayTeamId,
            bowlingTeam: match.homeTeamName || match.homeTeamId,
            totalScoreString: `${second.runs || 0}/${second.wickets || 0}`,
            oversPlayed: `${second.overs || 0} overs`,
            battingScores: (second.batsmen || second.battingCard || []).map((b: any) => ({
                name: b.playerId || 'Unknown',
                runs: b.runs || 0,
                balls: b.ballsFaced || b.balls || 0,
                fours: b.fours || 0,
                sixes: b.sixes || 0,
                strikeRate: b.strikeRate || (b.ballsFaced ? ((b.runs || 0) / b.ballsFaced * 100) : 0),
                dismissal: b.dismissal || (b.isOut ? 'out' : 'not out'),
            })),
            bowlingScores: (second.bowlers || second.bowlingCard || []).map((b: any) => ({
                name: b.playerId || 'Unknown',
                overs: b.overs || 0,
                maidens: b.maidens || 0,
                runsConceded: b.runsConceded || b.runs || 0,
                wickets: b.wickets || 0,
                economyRate: b.economy || (b.overs ? ((b.runsConceded || b.runs || 0) / b.overs) : 0),
            })),
            fallOfWickets: [],
            extras: {
                total: (second.extras?.wides || 0) + (second.extras?.noballs || 0) + (second.extras?.byes || 0) + (second.extras?.legbyes || 0),
                details: `(b ${second.extras?.byes || 0}, lb ${second.extras?.legbyes || 0}, w ${second.extras?.wides || 0}, nb ${second.extras?.noballs || 0})`,
            },
        });
    }

    return innings;
}

// Empty array for backward compatibility
export const resultsData: ResultWithTeamNames[] = [];

// Fetch completed match results with team names
export async function fetchResultsWithTeamNames(): Promise<ResultWithTeamNames[]> {
    try {
        const matches = await fetchMatches(50);
        const completedMatches = matches.filter(m => m.status === 'completed');
        return completedMatches.map(matchToResult);
    } catch (error) {
        console.error('Error fetching results:', error);
        return [];
    }
}

// Fetch scorecard data for a specific fixture
export async function fetchScorecardData(fixtureId: string): Promise<ScorecardData | null> {
    try {
        const match = await fetchMatchById(fixtureId);

        if (!match) {
            return null;
        }

        const result = matchToResult(match);

        const fixture: FixtureWithTeamNames = {
            id: match.id,
            teamAId: match.homeTeamId,
            teamBId: match.awayTeamId,
            teamAName: match.homeTeamName || match.homeTeamId,
            teamBName: match.awayTeamName || match.awayTeamId,
            venue: match.venue,
            location: match.location || match.venue,
            date: match.dateTime || (typeof match.matchDate === 'string' ? match.matchDate : new Date().toISOString()),
            matchType: match.matchType || 'T20',
        };

        return {
            fixture,
            result,
            innings: result.innings || [],
        };
    } catch (error) {
        console.error('Error fetching scorecard data:', error);
        return null;
    }
}
