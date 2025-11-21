import { getLiveMatches, getUpcomingMatches, store } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Dashboard() {
  const liveMatches = getLiveMatches();
  const upcomingMatches = getUpcomingMatches();

  return (
    <div>
      <header className="flex-between mb-4">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {store.currentUser.name}</p>
        </div>
        <button className="btn btn-primary" style={{
          backgroundColor: 'var(--color-primary)',
          color: '#000',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-glow)'
        }}>+ New Match</button>
      </header>

      <div className="grid-dashboard">
        {/* Live Matches Section */}
        <Card>
          <div className="flex-between mb-4">
            <h2>Live Matches</h2>
            <Badge variant="active">Live</Badge>
          </div>
          {liveMatches.length > 0 ? liveMatches.map(m => (
            <div key={m.matchId} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div className="flex-between mb-2">
                <span className="text-muted">{m.venue}</span>
                <span className="text-primary">In Progress</span>
              </div>
              <div className="flex-between">
                <h3>{m.teamAName}</h3>
                <span>vs</span>
                <h3>{m.teamBName}</h3>
              </div>
              {m.liveScore && (
                <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {m.liveScore.battingTeam}: {m.liveScore.runs}/{m.liveScore.wickets} ({m.liveScore.overs} ov)
                </div>
              )}
            </div>
          )) : <p>No live matches currently.</p>}
        </Card>

        {/* Upcoming Matches Section */}
        <Card>
          <h2>Upcoming</h2>
          {upcomingMatches.map(m => (
            <div key={m.matchId} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex-between">
                <strong>{m.teamAName} vs {m.teamBName}</strong>
                <span className="text-muted">{new Date(m.dateTime).toLocaleDateString()}</span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {m.venue}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
