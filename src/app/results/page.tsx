
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";
import { resultsData } from "@/lib/results-data"; // Updated import

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Match Results</CardTitle>
          <CardDescription>Scores, key statistics, and player performances from past matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resultsData.length > 0 ? resultsData.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{result.teamAId} vs {result.teamBId}</CardTitle>
                  <CardDescription>
                    <span className="font-semibold text-foreground">{result.winner}</span> won by {result.margin}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-medium">{result.teamAId}</p>
                      <p className="text-muted-foreground">{result.teamAScore}</p>
                    </div>
                    <div>
                      <p className="font-medium">{result.teamBId}</p>
                      <p className="text-muted-foreground">{result.teamBScore}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    <Star className="mr-2 h-5 w-5 text-yellow-500" />
                    <strong>Player of the Match:</strong> <span className="ml-1">{result.playerOfTheMatch}</span>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <p className="text-muted-foreground">No match results available at the moment.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
