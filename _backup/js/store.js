/**
 * SCRBRD Data Store
 * Handles application state and mock data
 */

const Store = {
    state: {
        currentUser: {
            name: "Kameel Kalyan",
            role: "Admin"
        },
        players: [
            {
                personId: "p1",
                firstName: "Virat",
                lastName: "Kohli",
                role: "Batsman",
                status: "active",
                stats: {
                    matchesPlayed: 250,
                    totalRuns: 12000,
                    battingAverage: 58.5,
                    strikeRate: 93.2,
                    hundreds: 43,
                    fifties: 62
                },
                profileImageUrl: "https://ui-avatars.com/api/?name=Virat+Kohli&background=10b981&color=fff"
            },
            {
                personId: "p2",
                firstName: "Jasprit",
                lastName: "Bumrah",
                role: "Bowler",
                status: "active",
                stats: {
                    matchesPlayed: 120,
                    wicketsTaken: 250,
                    bowlingAverage: 21.4,
                    economyRate: 4.5,
                    bestBowling: "6/19"
                },
                profileImageUrl: "https://ui-avatars.com/api/?name=Jasprit+Bumrah&background=f59e0b&color=fff"
            },
            {
                personId: "p3",
                firstName: "Ben",
                lastName: "Stokes",
                role: "All-Rounder",
                status: "injured",
                stats: {
                    matchesPlayed: 150,
                    totalRuns: 4500,
                    wicketsTaken: 180,
                    battingAverage: 38.2,
                    bowlingAverage: 28.5
                },
                profileImageUrl: "https://ui-avatars.com/api/?name=Ben+Stokes&background=ef4444&color=fff"
            }
        ],
        matches: [
            {
                matchId: "m1",
                teamAName: "Royal Challengers",
                teamBName: "Super Kings",
                dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                status: "scheduled",
                venue: "Chinnaswamy Stadium"
            },
            {
                matchId: "m2",
                teamAName: "Mumbai Indians",
                teamBName: "Knight Riders",
                dateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                status: "completed",
                result: "Mumbai Indians won by 5 wickets",
                venue: "Wankhede Stadium"
            },
            {
                matchId: "m3",
                teamAName: "Capitals",
                teamBName: "Sunrisers",
                dateTime: new Date().toISOString(), // Today
                status: "live",
                liveScore: {
                    runs: 145,
                    wickets: 3,
                    overs: 15.4,
                    battingTeam: "Capitals"
                },
                venue: "Feroz Shah Kotla"
            }
        ],
        teams: [
            { teamId: "t1", name: "Royal Challengers", division: "Premier League" },
            { teamId: "t2", name: "Super Kings", division: "Premier League" },
            { teamId: "t3", name: "Mumbai Indians", division: "Premier League" }
        ]
    },

    // Getters
    getPlayers() {
        return this.state.players;
    },

    getMatches() {
        return this.state.matches;
    },

    getLiveMatches() {
        return this.state.matches.filter(m => m.status === 'live');
    },

    getUpcomingMatches() {
        return this.state.matches.filter(m => m.status === 'scheduled');
    }
};

// Expose to window for easy access
window.Store = Store;
