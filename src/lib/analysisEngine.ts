import {
  fetchTopRunScorers,
  fetchTopWicketTakers,
  fetchLeagueStandings,
  fetchTeams,
  fetchSchools,
  fetchDivisions
} from "./firestore";

export type AnalysisResponse = {
  type: 'text' | 'table' | 'chart';
  title: string;
  data: any;
  message?: string;
};

export async function processQuery(query: string): Promise<AnalysisResponse> {
  const q = query.toLowerCase();

  // 1. Top Run Scorers
  if (q.includes("run") && (q.includes("top") || q.includes("most") || q.includes("highest"))) {
    const limit = 5;
    // Use Firestore function - note: requires composite index in production
    // Fallback to client-side sorting if index missing (handled in firestore.ts or here if needed)
    const scorers = await fetchTopRunScorers(limit);
    const teams = await fetchTeams();

    return {
      type: 'table',
      title: `Top ${limit} Run Scorers`,
      data: {
        headers: ['Player', 'Team', 'Runs', 'Matches', 'Average'],
        rows: scorers.map(p => {
          const schoolId = p.assignedSchools?.[0];
          const team = teams.find(t => t.schoolId === schoolId);
          return [
            `${p.firstName} ${p.lastName}`,
            team?.name || 'Unknown',
            p.stats?.totalRuns || 0,
            p.stats?.matchesPlayed || 0,
            p.stats?.battingAverage?.toFixed(2) || 0
          ];
        })
      },
      message: "Here are the leading run scorers for the season."
    };
  }

  // 2. Top Wicket Takers
  if (q.includes("wicket") && (q.includes("top") || q.includes("most") || q.includes("highest"))) {
    const limit = 5;
    const bowlers = await fetchTopWicketTakers(limit);
    const teams = await fetchTeams();

    return {
      type: 'table',
      title: `Top ${limit} Wicket Takers`,
      data: {
        headers: ['Player', 'Team', 'Wickets', 'Matches', 'Average'],
        rows: bowlers.map(p => {
          const schoolId = p.assignedSchools?.[0];
          const team = teams.find(t => t.schoolId === schoolId);
          return [
            `${p.firstName} ${p.lastName}`,
            team?.name || 'Unknown',
            p.stats?.wicketsTaken || 0,
            p.stats?.matchesPlayed || 0,
            p.stats?.bowlingAverage?.toFixed(2) || 0
          ];
        })
      },
      message: "Here are the leading wicket takers for the season."
    };
  }

  // 3. League Standings
  if (q.includes("standing") || q.includes("table") || q.includes("points")) {
    const standings = await fetchLeagueStandings();

    return {
      type: 'table',
      title: "League Standings",
      data: {
        headers: ['Team', 'Played', 'Won', 'Lost', 'Points'],
        rows: standings.map(s => [
          s.team.name,
          s.played,
          s.won,
          s.lost,
          s.points
        ])
      },
      message: "Current league standings based on completed matches."
    };
  }

  // 4. Team List
  if (q.includes("teams") || q.includes("clubs")) {
    const [teams, schools, divisions] = await Promise.all([
      fetchTeams(),
      fetchSchools(),
      fetchDivisions()
    ]);

    return {
      type: 'table',
      title: "Registered Teams",
      data: {
        headers: ['Team Name', 'School', 'Division'],
        rows: teams.map(t => [
          t.name,
          schools.find(s => s.id === t.schoolId)?.name || 'Unknown',
          divisions.find(d => d.id === t.divisionId)?.name || 'Unknown'
        ])
      },
      message: `There are ${teams.length} teams registered in the league.`
    };
  }

  // Default / Help
  return {
    type: 'text',
    title: "I didn't understand that.",
    data: null,
    message: "Try asking about 'top run scorers', 'wicket takers', 'league standings', or 'teams'."
  };
}
