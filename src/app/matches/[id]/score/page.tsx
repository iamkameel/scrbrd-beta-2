/**
 * DEPRECATED: This route has been consolidated into /matches/[id]/manage
 * Redirecting to the primary match management dashboard
 */
import { redirect } from "next/navigation";

export default async function MatchScoringPage(props: { 
  params: Promise<{ id: string }> 
}) {
  const params = await props.params;
  const matchId = params.id;
  
  // Redirect to the consolidated match management dashboard
  redirect(`/matches/${matchId}/manage`);
}
