
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fixtures as allFixtures, type Fixture } from '@/lib/fixtures-data';
import { resultsData, type Result, type InningsData, type BatsmanScore, type BowlerScore } from '@/lib/results-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { format } from 'date-fns';

export default function ScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = params.fixtureId ? parseInt(params.fixtureId as string, 10) : null;

  const fixture: Fixture | undefined = fixtureId ? allFixtures.find(f => f.id === fixtureId) : undefined;
  const result: Result | undefined = fixtureId ? resultsData.find(r => r.fixtureId === fixtureId) : undefined;

  if (!fixture || !result) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Scorecard Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Sorry, we couldn't find a scorecard for this fixture. It might be an upcoming match or data is not yet available.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Match Scorecard: {fixture.teamA} vs {fixture.teamB}</CardTitle>
          <CardDescription>
            Played on {format(new Date(fixture.date), 'EEEE, MMMM d, yyyy')} at {fixture.location}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Summary */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">Match Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg ">
                <div className="text-center md:text-left">
                  <p className="font-semibold text-lg">{result.teamA}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">{result.teamAScore}</p>
                </div>
                <p className="text-xl font-medium text-muted-foreground">vs</p>
                <div className="text-center md:text-right">
                  <p className="font-semibold text-lg">{result.teamB}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">{result.teamBScore}</p>
                </div>
              </div>
              <div className="text-center mt-4 p-3 bg-background rounded-md shadow">
                <p className="text-lg font-semibold text-[hsl(var(--accent))] flex items-center justify-center">
                  <Trophy className="mr-2 h-5 w-5" /> {/* Removed text-yellow-500 for theme consistency */}
                  {result.winner} won by {result.margin}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Player of the Match */}
          <Card>
            <CardHeader>
                <CardTitle className="text-xl">Player of the Match</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-md bg-muted p-4 rounded-md">
                <Star className="mr-3 h-6 w-6 text-yellow-500" /> {/* Keep yellow for star distinction */}
                <p><strong className="font-semibold">{result.playerOfTheMatch}</strong></p>
            </CardContent>
          </Card>

          {/* Detailed Innings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Detailed Innings</CardTitle>
              <CardDescription>Full batting and bowling details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.innings && result.innings.length > 0 ? (
                result.innings.map((inningData, index) => (
                  <React.Fragment key={`innings-${index}`}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Innings {inningData.inningsNumber}: {inningData.battingTeam} Batting ({inningData.totalScoreString} in {inningData.oversPlayed})
                      </h3>
                      
                      {/* Batting Table */}
                      <div>
                        <h4 className="text-md font-medium mb-2">Batting</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Batsman</TableHead>
                              <TableHead>Dismissal</TableHead>
                              <TableHead className="text-right">R</TableHead>
                              <TableHead className="text-right">B</TableHead>
                              <TableHead className="text-right">4s</TableHead>
                              <TableHead className="text-right">6s</TableHead>
                              <TableHead className="text-right">SR</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inningData.battingScores.map((batter) => (
                              <TableRow key={batter.name}>
                                <TableCell className="font-medium">{batter.name}</TableCell>
                                <TableCell>{batter.dismissal}</TableCell>
                                <TableCell className="text-right">{batter.runs}</TableCell>
                                <TableCell className="text-right">{batter.balls}</TableCell>
                                <TableCell className="text-right">{batter.fours}</TableCell>
                                <TableCell className="text-right">{batter.sixes}</TableCell>
                                <TableCell className="text-right">{batter.strikeRate}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={2} className="font-medium">Extras</TableCell>
                                <TableCell className="text-right" colSpan={5}>{inningData.extras.total} {inningData.extras.details}</TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                                <TableCell colSpan={2} className="font-bold text-lg">Total</TableCell>
                                <TableCell className="text-right font-bold text-lg" colSpan={5}>{inningData.totalScoreString} ({inningData.oversPlayed})</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Bowling Table */}
                      <div>
                        <h4 className="text-md font-medium mt-4 mb-2">Bowling ({inningData.bowlingTeam})</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Bowler</TableHead>
                              <TableHead className="text-right">O</TableHead>
                              <TableHead className="text-right">M</TableHead>
                              <TableHead className="text-right">R</TableHead>
                              <TableHead className="text-right">W</TableHead>
                              <TableHead className="text-right">Econ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inningData.bowlingScores.map((bowler) => (
                              <TableRow key={bowler.name}>
                                <TableCell className="font-medium">{bowler.name}</TableCell>
                                <TableCell className="text-right">{bowler.overs}</TableCell>
                                <TableCell className="text-right">{bowler.maidens}</TableCell>
                                <TableCell className="text-right">{bowler.runsConceded}</TableCell>
                                <TableCell className="text-right">{bowler.wickets}</TableCell>
                                <TableCell className="text-right">{bowler.economyRate}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Fall of Wickets (Optional - if data exists) */}
                      {inningData.fallOfWickets && inningData.fallOfWickets.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-md font-medium mb-1">Fall of Wickets</h4>
                            <p className="text-sm text-muted-foreground">
                                {inningData.fallOfWickets.map((fow, idx) => (
                                    <span key={`fow-${idx}`}>
                                        {fow.wicket}-{fow.score} ({fow.batsmanOut}, {fow.over} ov){idx < inningData.fallOfWickets!.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </p>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Detailed innings-by-innings scorecards are not yet available for this match or this feature is under development.
                </p>
              )}
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
