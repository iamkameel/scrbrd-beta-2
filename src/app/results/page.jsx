"use client"; // Added this line as it uses hooks and should be a client component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";
// Assuming fetchResultsWithTeamNames is now an async function in results-data.ts
import { fetchResultsWithTeamNames } from "@/lib/results-data"; // Updated import
import { useEffect, useState } from 'react';
// Removed: import { Result } from "@/lib/results-data"; // Use ResultWithTeamNames now
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default function ResultsPage() {
    const [results, setResults] = useState([]); // Use ResultWithTeamNames
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadResults = async () => {
            try {
                setLoading(true);
                const data = await fetchResultsWithTeamNames();
                setResults(data);
            }
            catch (err) { // Added type for err
                console.error("Error fetching results:", err);
                setError(err.message || "Failed to load results.");
            }
            finally {
                setLoading(false);
            }
        };
        loadResults();
    }, []);
    if (loading) {
        return <div className="text-center p-8"><p className="text-muted-foreground">Loading results...</p></div>;
    }
    if (error) {
        return <div className="text-center p-8 text-destructive">{error}</div>;
    }
    return (<div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Match Results</CardTitle>
          <CardDescription>Scores, key statistics, and player performances from past matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {results.length > 0 ? (results.map((result) => (<Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 flex-grow">
                    <CardTitle className="text-xl font-bold text-primary">{result.teamAName || result.teamAId} vs {result.teamBName || result.teamBId}</CardTitle>
                    <CardDescription>
                      <span className="font-bold text-[hsl(var(--accent))]">{result.winner}</span> won by {result.margin}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 items-center text-center mb-4">
                      <div>
                        <p className="text-lg font-semibold">{result.teamAName || result.teamAId}</p>
                        <p className="text-2xl font-bold text-primary">{result.teamAScore}</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{result.teamBName || result.teamBId}</p>
                        <p className="text-2xl font-bold text-primary">{result.teamBScore}</p>
                      </div>
                    </div>
                    {result.playerOfTheMatch && (<div className="flex items-center text-sm text-muted-foreground bg-muted p-3 rounded-md mb-4">
                        <Star className="mr-2 h-5 w-5 text-yellow-500 fill-yellow-500"/>
                        <strong className="text-foreground">Player of the Match:</strong> <span className="ml-1 font-medium text-foreground">{result.playerOfTheMatch}</span>
                        </div>)}
                    <div className="text-center mt-4">
                      <Link href={`/scorecard/${result.fixtureId}`} passHref>
                        <Button variant="outline">Full Scorecard</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>))) : (<p className="text-muted-foreground text-center italic py-4">No match results available at the moment.</p>)}
          </div>
        </CardContent>
      </Card>
    </div>);
}
