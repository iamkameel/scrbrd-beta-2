import { fetchCollection } from "@/lib/firestore";
import { Match, Team } from "@/types/firestore";
import { MatchesClient } from "./client";
import { serializeFirestoreData } from "@/lib/utils/serializeFirestore";

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  // Fetch matches and teams in parallel
  const [matchesRaw, teamsRaw] = await Promise.all([
    fetchCollection<Match>('matches'),
    fetchCollection<Team>('teams')
  ]);

  // Serialize Firestore Timestamps to strings for Client Component
  const matches = matchesRaw.map(m => serializeFirestoreData(m));
  const teams = teamsRaw.map(t => serializeFirestoreData(t));

  return <MatchesClient matches={matches} teams={teams} />;
}
