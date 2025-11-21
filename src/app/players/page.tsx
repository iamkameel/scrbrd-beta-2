import { store } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";

export default function PlayersPage() {
  const players = store.players;

  return (
    <div>
      <header className="flex-between mb-4">
        <h1>Players</h1>
        <button className="btn btn-primary" style={{
          backgroundColor: 'var(--color-primary)',
          color: '#000',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-glow)'
        }}>+ Add Player</button>
      </header>

      <div className="grid-players">
        {players.map(p => (
          <Card key={p.personId} className="text-center" style={{ textAlign: 'center' } as any}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1rem auto' }}>
              <Image 
                src={p.profileImageUrl} 
                alt={`${p.firstName} ${p.lastName}`}
                fill
                style={{ borderRadius: '50%', border: '2px solid var(--color-primary)', objectFit: 'cover' }}
              />
            </div>
            <h3>{p.firstName} {p.lastName}</h3>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>{p.role}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Matches</div>
                <div>{p.stats.matchesPlayed}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{p.role === 'Bowler' ? 'Wickets' : 'Runs'}</div>
                <div>{p.role === 'Bowler' ? p.stats.wicketsTaken : p.stats.totalRuns}</div>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <Badge variant={p.status === 'active' ? 'active' : 'inactive'}>{p.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
