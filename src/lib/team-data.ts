// Team data fetching from Firestore
// Replaces legacy mock data with real database queries

import { fetchTeams, fetchTeamById } from './firestore';
import { Team as FirestoreTeam } from '@/types/firestore';

export interface TeamData {
    id: string;
    teamName: string;
    schoolId?: string;
    schoolName?: string;
    ageGroup?: string;
    division?: string;
    coachIds?: string[];
    playerIds?: string[];
    status?: string;
}

// Export alias for backward compatibility
export type Team = TeamData;

// Convert Firestore Team to TeamData format
function firestoreTeamToTeamData(team: FirestoreTeam): TeamData {
    return {
        id: team.id,
        teamName: team.name,
        schoolId: team.schoolId,
        schoolName: undefined, // Would come from school lookup
        ageGroup: undefined, // Not in Team type, would need lookup
        division: team.divisionId,
        coachIds: team.coachIds,
        playerIds: undefined, // Not in Team type
        status: undefined, // Not in Team type
    };
}

// Empty array for backward compatibility (pages using sync access)
export const detailedTeamsData: TeamData[] = [];

// Fetch all teams
export async function fetchTeamsData(): Promise<TeamData[]> {
    try {
        const teams = await fetchTeams();
        return teams.map(firestoreTeamToTeamData);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
}

// Fetch a single team by ID
export async function fetchTeamDataById(id: string): Promise<TeamData | null> {
    try {
        const team = await fetchTeamById(id);
        return team ? firestoreTeamToTeamData(team) : null;
    } catch (error) {
        console.error('Error fetching team:', error);
        return null;
    }
}

// Helper to get team name by ID (async)
export async function getTeamNameById(id: string): Promise<string> {
    const team = await fetchTeamDataById(id);
    return team?.teamName || id;
}
