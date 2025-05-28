
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fixtures as allFixtures, type Fixture } from '@/lib/fixtures-data';
import { resultsData, type Result, type InningsData } from '@/lib/results-data'; // Removed unused BatsmanScore, BowlerScore
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

  const defaultTabValue = result.innings && result.innings.length > 0 ? `innings-${result.innings[0].inningsNumber}` : "";

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
                  <Trophy className="mr-2 h-5 w-5" />
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
                <Star className="mr-3 h-6 w-6 text-yellow-500" />
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
                <Tabs defaultValue={defaultTabValue} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-none md:flex md:flex-wrap justify-start">
                    {result.innings.map((inningData) => (
                      <TabsTrigger key={`trigger-innings-${inningData.inningsNumber}`} value={`innings-${inningData.inningsNumber}`}>
                        Innings {inningData.inningsNumber}: {inningData.battingTeam}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {result.innings.map((inningData, index) => (
                    <TabsContent key={`content-innings-${inningData.inningsNumber}`} value={`innings-${inningData.inningsNumber}`} className="mt-4">
                      <Accordion type="multiple" defaultValue={['batting', 'bowling']} className="w-full space-y-4">
                        {/* Batting Accordion Item */}
                        <AccordionItem value="batting">
                          <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                            Batting - {inningData.battingTeam} ({inningData.totalScoreString} in {inningData.oversPlayed})
                          </AccordionTrigger>
                          <AccordionContent className="p-0 border border-t-0 rounded-b-md">
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
                          </AccordionContent>
                        </AccordionItem>

                        {/* Bowling Accordion Item */}
                        <AccordionItem value="bowling">
                          <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                            Bowling - {inningData.bowlingTeam}
                          </AccordionTrigger>
                          <AccordionContent className="p-0 border border-t-0 rounded-b-md">
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
                          </AccordionContent>
                        </AccordionItem>

                        {/* Fall of Wickets Accordion Item (Optional) */}
                        {inningData.fallOfWickets && inningData.fallOfWickets.length > 0 && (
                           <AccordionItem value="fow">
                            <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                              Fall of Wickets
                            </AccordionTrigger>
                            <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                                <p className="text-sm text-muted-foreground">
                                    {inningData.fallOfWickets.map((fow, idx) => (
                                        <span key={`fow-${idx}`}>
                                            {fow.wicket}-{fow.score} ({fow.batsmanOut}, {fow.over} ov){idx < inningData.fallOfWickets!.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </p>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>
                    </TabsContent>
                  ))}
                </Tabs>
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

    