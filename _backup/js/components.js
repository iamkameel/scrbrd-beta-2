/**
 * SCRBRD Components
 * Functional components that return HTML strings
 */

const Components = {
    // Navigation Component
    Navigation: (activeTab = 'dashboard') => {
        const items = [
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'players', label: 'Players', icon: '👥' },
            { id: 'matches', label: 'Matches', icon: '🏏' },
            { id: 'teams', label: 'Teams', icon: '🛡️' },
            { id: 'training', label: 'Training', icon: '💪' },
        ];

        return `
            <div class="nav-brand">
                <span>🏏</span> SCRBRD
            </div>
            <ul class="nav-list">
                ${items.map(item => `
                    <li class="nav-item ${activeTab === item.id ? 'active' : ''}" onclick="App.navigate('${item.id}')">
                        <span>${item.icon}</span>
                        ${item.label}
                    </li>
                `).join('')}
            </ul>
        `;
    },

    // Dashboard View
    Dashboard: () => {
        const liveMatches = Store.getLiveMatches();
        const upcomingMatches = Store.getUpcomingMatches();

        return `
            <header class="flex-between mb-4">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back, ${Store.state.currentUser.name}</p>
                </div>
                <button class="btn btn-primary">+ New Match</button>
            </header>

            <div class="grid-dashboard">
                <!-- Live Matches Section -->
                <div class="card">
                    <div class="flex-between mb-4">
                        <h2>Live Matches</h2>
                        <span class="badge badge-active">Live</span>
                    </div>
                    ${liveMatches.length > 0 ? liveMatches.map(m => `
                        <div style="border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; margin-bottom: 1rem;">
                            <div class="flex-between mb-2">
                                <span class="text-muted">${m.venue}</span>
                                <span class="text-primary">In Progress</span>
                            </div>
                            <div class="flex-between">
                                <h3>${m.teamAName}</h3>
                                <span>vs</span>
                                <h3>${m.teamBName}</h3>
                            </div>
                            <div style="margin-top: 0.5rem; font-size: 1.2rem; font-weight: bold;">
                                ${m.liveScore.battingTeam}: ${m.liveScore.runs}/${m.liveScore.wickets} (${m.liveScore.overs} ov)
                            </div>
                        </div>
                    `).join('') : '<p>No live matches currently.</p>'}
                </div>

                <!-- Upcoming Matches Section -->
                <div class="card">
                    <h2>Upcoming</h2>
                    ${upcomingMatches.map(m => `
                        <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--color-border);">
                            <div class="flex-between">
                                <strong>${m.teamAName} vs ${m.teamBName}</strong>
                                <span class="text-muted">${new Date(m.dateTime).toLocaleDateString()}</span>
                            </div>
                            <div class="text-muted" style="font-size: 0.9rem; margin-top: 0.25rem;">
                                ${m.venue}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Players View
    Players: () => {
        const players = Store.getPlayers();

        return `
            <header class="flex-between mb-4">
                <h1>Players</h1>
                <button class="btn btn-primary">+ Add Player</button>
            </header>

            <div class="grid-players">
                ${players.map(p => `
                    <div class="card" style="text-align: center;">
                        <img src="${p.profileImageUrl}" alt="${p.firstName}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 1rem; border: 2px solid var(--color-primary);">
                        <h3>${p.firstName} ${p.lastName}</h3>
                        <p class="text-secondary" style="margin-bottom: 1rem;">${p.role}</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; text-align: left; background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: var(--radius-md);">
                            <div>
                                <div class="text-muted" style="font-size: 0.8rem;">Matches</div>
                                <div>${p.stats.matchesPlayed}</div>
                            </div>
                            <div>
                                <div class="text-muted" style="font-size: 0.8rem;">${p.role === 'Bowler' ? 'Wickets' : 'Runs'}</div>
                                <div>${p.role === 'Bowler' ? p.stats.wicketsTaken : p.stats.totalRuns}</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 1rem;">
                            <span class="badge ${p.status === 'active' ? 'badge-active' : 'badge-inactive'}">${p.status}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Matches View
    Matches: () => {
        const matches = Store.getMatches();

        return `
            <header class="flex-between mb-4">
                <h1>Matches</h1>
                <button class="btn btn-primary">+ Schedule Match</button>
            </header>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${matches.map(m => `
                    <div class="card flex-between">
                        <div>
                            <div class="text-muted mb-2">${new Date(m.dateTime).toLocaleDateString()} • ${m.venue}</div>
                            <div style="font-size: 1.2rem; font-weight: 600;">
                                ${m.teamAName} <span class="text-muted" style="margin: 0 0.5rem;">vs</span> ${m.teamBName}
                            </div>
                            ${m.result ? `<div class="text-primary" style="margin-top: 0.5rem;">${m.result}</div>` : ''}
                        </div>
                        <div>
                            <span class="badge ${m.status === 'live' ? 'badge-active' : 'badge-inactive'}">${m.status}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};
