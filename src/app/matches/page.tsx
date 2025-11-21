import { store } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function MatchesPage() {
  const matches = store.matches;

  return (
    <div>
      <header className="flex-between mb-4">
        <h1>Matches</h1>
        <button className="btn btn-primary" style={{
          backgroundColor: 'var(--color-primary)',
          color: '#000',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-glow)'
        }}>+ Schedule Match</button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {matches.map(m => (
          <Card key={m.matchId}>
            <div className="flex-between">
              <div>
                <div className="text-muted mb-2">{new Date(m.dateTime).toLocaleDateString()} • {m.venue}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {m.teamAName} <span className="text-muted" style={{ margin: '0 0.5rem' }}>vs</span> {m.teamBName}
                </div>
                {m.result && <div className="text-primary" style={{ marginTop: '0.5rem' }}>{m.result}</div>}
              </div>
              <div>
                <Badge variant={m.status === 'live' ? 'active' : 'inactive'}>{m.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
