import { fetchDocument, fetchPlayersForMatch } from "@/lib/firestore";
import { Match, Team } from "@/types/firestore";
import { MatchDetailClient } from "@/components/match/MatchDetailClient";
import { notFound } from "next/navigation";
import { serializeFirestoreData } from "@/lib/utils/serializeFirestore";

export default async function MatchDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const matchRaw = await fetchDocument<Match>('matches', id);

  if (!matchRaw) {
    notFound();
  }

  // Fetch team details
  const homeTeamRaw = await fetchDocument<Team>('teams', matchRaw.homeTeamId);
  const awayTeamRaw = await fetchDocument<Team>('teams', matchRaw.awayTeamId);

  // Fetch players for both teams
  const playersRaw = await fetchPlayersForMatch(matchRaw.homeTeamId, matchRaw.awayTeamId);

  // Serialize data for Client Component
  const match = serializeFirestoreData(matchRaw);
  const homeTeam = homeTeamRaw ? serializeFirestoreData(homeTeamRaw) : undefined;
  const awayTeam = awayTeamRaw ? serializeFirestoreData(awayTeamRaw) : undefined;
  const players = playersRaw.map(p => serializeFirestoreData(p));

  return (
    <MatchDetailClient 
      match={match}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      players={players}
    />
  );
}
