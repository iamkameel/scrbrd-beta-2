import { fetchDocument, fetchCollection } from '@/lib/firestore';
import { Match, Team, Person } from '@/types/firestore';
import { MatchManagementClient } from './client';
import { notFound } from 'next/navigation';
import { where } from 'firebase/firestore';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function MatchManagePage({ params }: PageProps) {
  const { id: matchId } = await params;

  // Fetch match data
  const match = await fetchDocument<Match>('matches', matchId);
  
  if (!match) {
    notFound();
  }

  // Fetch teams
  const [homeTeam, awayTeam] = await Promise.all([
    fetchDocument<Team>('teams', match.homeTeamId),
    fetchDocument<Team>('teams', match.awayTeamId)
  ]);

  if (!homeTeam || !awayTeam) {
    return <div>Error: Teams not found</div>;
  }

  // Fetch players for both teams
  // Note: In a real app, we might want to optimize this or paginate
  const homePlayers = await fetchCollection<Person>('people', [
    where('teamIds', 'array-contains', match.homeTeamId)
  ]);
  
  const awayPlayers = await fetchCollection<Person>('people', [
    where('teamIds', 'array-contains', match.awayTeamId)
  ]);

  return (
    <MatchManagementClient
      match={match}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      homePlayers={homePlayers}
      awayPlayers={awayPlayers}
    />
  );
}
