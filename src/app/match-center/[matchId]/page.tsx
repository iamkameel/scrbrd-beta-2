import { fetchMatchById } from "@/lib/firestore";
import { MatchCenterClient } from "./MatchCenterClient";

interface MatchCenterPageProps {
  params: Promise<{ matchId: string }>;
}

export default async function MatchCenterPage({ params }: MatchCenterPageProps) {
  const { matchId } = await params;
  const match = await fetchMatchById(matchId);

  if (!match) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Match Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The match you&apos;re looking for doesn&apos;t exist or hasn&apos;t started yet.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Match Center</h1>
      <p className="text-muted-foreground mb-8">
        Live scoring, analysis, and match insights
      </p>
      <MatchCenterClient match={match} />
    </div>
  );
}
