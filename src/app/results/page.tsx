import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ResultsPage() {
  // Placeholder data
  const results = [
    { id: 1, teamA: "Warriors Club", teamAScore: "185/7 (20 Ov)", teamB: "Sharks United", teamBScore: "170/9 (20 Ov)", winner: "Warriors Club", margin: "15 runs", playerOfTheMatch: "Alex Ray (55 runs, 2 wkts)" },
    { id: 2, teamA: "Titans CC", teamAScore: "220/5 (20 Ov)", teamB: "Giants XI", teamBScore: "221/4 (19.2 Ov)", winner: "Giants XI", margin: "6 wickets", playerOfTheMatch: "Ben Stokes (78* runs)" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Match Results</CardTitle>
          <CardDescription>Scores, key statistics, and player performances from past matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{result.teamA} vs {result.teamB}</CardTitle>
                  <CardDescription>
                    <span className="font-semibold text-foreground">{result.winner}</span> won by {result.margin}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-medium">{result.teamA}</p>
                      <p className="text-muted-foreground">{result.teamAScore}</p>
                    </div>
                    <div>
                      <p className="font-medium">{result.teamB}</p>
                      <p className="text-muted-foreground">{result.teamBScore}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    <Star className="mr-2 h-5 w-5 text-yellow-500" />
                    <strong>Player of the Match:</strong> <span className="ml-1">{result.playerOfTheMatch}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
