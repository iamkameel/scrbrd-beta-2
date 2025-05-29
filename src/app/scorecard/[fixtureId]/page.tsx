
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fixtures as allFixtures, type Fixture } from '@/lib/fixtures-data';
import { resultsData, type Result, type InningsData, type BatsmanScore, type BowlerScore } from '@/lib/results-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

// Assuming Accordion and Tabs components are in these paths
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to get top batsmen for a team
function getTopBatsmen(teamName: string, inningsData: InningsData[] | undefined, count: number): BatsmanScore[] {
  if (!inningsData) return [];
  const allTeamBattingScores: BatsmanScore[] = [];
  inningsData.forEach(inning => {
    if (inning.battingTeam === teamName) {
      allTeamBattingScores.push(...inning.battingScores.filter(bs => typeof bs.runs === 'number'));
    }
  });

  return allTeamBattingScores
    .sort((a, b) => b.runs - a.runs)
    .slice(0, count);
}

// Helper function to get top bowlers for a team
function getTopBowlers(teamName: string, inningsData: InningsData[] | undefined, count: number): BowlerScore[] {
  if (!inningsData) return [];
  const allTeamBowlingScores: BowlerScore[] = [];
  inningsData.forEach(inning => {
    // Check if the current team was the bowling team for this innings.
    // This was previously checking inning.battingTeam which is incorrect for bowlers.
    if (inning.bowlingTeam === teamName) {
      allTeamBowlingScores.push(...inning.bowlingScores.filter(bs => typeof bs.wickets === 'number' && typeof bs.runsConceded === 'number'));
    }
  });

  return allTeamBowlingScores
    .sort((a, b) => {
      if (b.wickets !== a.wickets) {
        return b.wickets - a.wickets;
      }
      return a.runsConceded - b.runsConceded;
    })
    .slice(0, count);
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface PartnershipData {
  wicketOrdinal: string;
  batsman1Name: string;
  batsman2Name: string;
  batsman1TotalRunsAtWicket: number;
  partnershipRuns: number;
  batsman2TotalRunsAtWicket: number;
}

function formatBatsmanScore(batsman: BatsmanScore | undefined): string {
  if (!batsman) return "N/A";
  return `${batsman.runs} (${batsman.balls})`;
}

function generatePartnershipUIData(innings: InningsData): PartnershipData[] {
  const partnerships: PartnershipData[] = [];
  const battingScoresMap = new Map<string, BatsmanScore>();
  innings.battingScores.forEach(bs => battingScoresMap.set(bs.name, bs));

  let currentScore = 0;
  // Initialize active batsmen with the first two from the batting order.
  let activeBatsmen: [BatsmanScore | undefined, BatsmanScore | undefined] = [
    innings.battingScores.length > 0 ? battingScoresMap.get(innings.battingScores[0].name) : undefined,
    innings.battingScores.length > 1 ? battingScoresMap.get(innings.battingScores[1].name) : undefined,
  ];
  
  const fallOfWickets = innings.fallOfWickets || [];

  for (let i = 0; i < fallOfWickets.length; i++) {
    const fow = fallOfWickets[i];
    const partnershipRuns = fow.score - currentScore;
    currentScore = fow.score;

    const dismissedBatsmanObj = battingScoresMap.get(fow.batsmanOut);
    let partnerBatsmanObj: BatsmanScore | undefined;

    if (activeBatsmen[0]?.name === fow.batsmanOut) {
      partnerBatsmanObj = activeBatsmen[1];
    } else if (activeBatsmen[1]?.name === fow.batsmanOut) {
      partnerBatsmanObj = activeBatsmen[0];
    } else {
        // Fallback if dismissed batsman is not one of the currently tracked active ones.
        // This can happen with complex data or if activeBatsmen tracking gets out of sync.
        // For the tooltip, the partner might show as "Partner" or N/A.
    }

    partnerships.push({
      wicketOrdinal: `${getOrdinal(fow.wicket)} Wicket`,
      batsman1Name: dismissedBatsmanObj?.name || fow.batsmanOut,
      batsman2Name: partnerBatsmanObj?.name || "Partner",
      partnershipRuns: partnershipRuns,
      batsman1TotalRunsAtWicket: dismissedBatsmanObj?.runs || 0,
      batsman2TotalRunsAtWicket: partnerBatsmanObj?.runs || 0,
    });

    // Update active batsmen:
    // The batsman who was dismissed is replaced by the next batsman in order.
    // The new batsman is at index (fow.wicket + 1) in battingScores (0-indexed, fow.wicket is 1-indexed).
    // e.g. after 1st wicket (fow.wicket=1), batsman at index 2 (0-indexed) comes in.
    let newBatsmanToCrease: BatsmanScore | undefined;
    // fow.wicket is 1-indexed ordinal. Batsmen in order are 0, 1, 2, ...
    // New batsman index in battingScores array is fow.wicket + 1 (e.g. 1st wkt -> new bat is index 2)
    const newBatsmanIndex = fow.wicket + 1; 
    if (newBatsmanIndex < innings.battingScores.length) {
        const newBatsmanData = innings.battingScores[newBatsmanIndex];
        if (newBatsmanData) {
            newBatsmanToCrease = battingScoresMap.get(newBatsmanData.name);
        }
    }
    
    if (activeBatsmen[0]?.name === fow.batsmanOut) {
      activeBatsmen = [partnerBatsmanObj, newBatsmanToCrease];
    } else if (activeBatsmen[1]?.name === fow.batsmanOut) {
      activeBatsmen = [activeBatsmen[0], newBatsmanToCrease];
    } else {
      // If dismissed batsman was not in activeBatsmen, our tracking might be broken.
      // Attempt to reconstruct based on new batsman and presumed partner
      if (partnerBatsmanObj && newBatsmanToCrease) {
        activeBatsmen = [partnerBatsmanObj, newBatsmanToCrease];
      } else if (newBatsmanToCrease) { // Only new one is known
        activeBatsmen = [partnerBatsmanObj || undefined, newBatsmanToCrease]; // partner might be undefined
      }
      // If newBatsmanToCrease is also undefined (end of list), active pair might become [partner, undefined] or even [undefined, undefined]
    }
  }

  // Final partnership (if not all out)
  const totalRuns = parseInt(innings.totalScoreString.split('/')[0]);
  const wicketsFallen = fallOfWickets.length;

  if (wicketsFallen < 10 && totalRuns > currentScore) {
    const partnershipRuns = totalRuns - currentScore;
    let b1Name = activeBatsmen[0]?.name || "N/A";
    let b2Name = activeBatsmen[1]?.name || (activeBatsmen[0] ? "Partner" : "N/A");

    // Refine with "not out" batsmen if available and consistent
    const notOutBatsmen = innings.battingScores.filter(bs => bs.dismissal.toLowerCase().includes('not out'));
    if (notOutBatsmen.length === 1) {
        b1Name = notOutBatsmen[0].name;
        // If activeBatsmen[0] is already this notOutBatsman, then activeBatsmen[1] is the other current partner (if any)
        // If activeBatsmen[0] is NOT this notOutBatsman, but activeBatsmen[1] is, then activeBatsmen[0] is the other.
        // This part ensures we don't just list the same not out batsman twice if activeBatsmen was already correct.
        if (activeBatsmen[0]?.name === notOutBatsmen[0].name) {
            b2Name = activeBatsmen[1]?.name || "Partner";
        } else if (activeBatsmen[1]?.name === notOutBatsmen[0].name) {
            b2Name = activeBatsmen[0]?.name || "Partner";
        } else {
            b2Name = "Partner";
        }

    } else if (notOutBatsmen.length >= 2) {
        // Prefer explicit not out batsmen if two are listed
        b1Name = notOutBatsmen[0].name;
        b2Name = notOutBatsmen[1].name;
    }
    // If b1Name and b2Name are the same (e.g. only one not out batsman and active partner couldn't be determined), set b2Name to "Partner"
    if (b1Name !== "N/A" && b1Name === b2Name) {
        b2Name = "Partner";
    }


     if ((b1Name !== "N/A" || b2Name !== "N/A") && partnershipRuns >= 0) {
        partnerships.push({
          batsman1Name: b1Name,
          batsman2Name: b2Name,
          partnershipRuns,
          wicketOrdinal: `${getOrdinal(wicketsFallen + 1)} Wicket`,
          batsman1TotalRunsAtWicket: battingScoresMap.get(b1Name)?.runs || 0,
          batsman2TotalRunsAtWicket: battingScoresMap.get(b2Name)?.runs || 0,
        });
    }
  }
  return partnerships.filter(p => (p.batsman1Name !== 'N/A' && p.batsman1Name !== 'Partner') || (p.batsman2Name !== 'N/A' && p.batsman2Name !== 'Partner'));
}

// Custom Tooltip component for Batting Partnerships
const PartnershipTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const partnershipData = payload[0].payload as PartnershipData; 
    return (
      <div className="bg-card text-card-foreground p-3 rounded-md shadow-md border">
        <p className="font-semibold mb-1">{label}</p> {/* label is wicketOrdinal */}
        <p>
          {partnershipData.batsman1Name} 
          {partnershipData.batsman2Name && partnershipData.batsman2Name !== "N/A" && partnershipData.batsman2Name !== "Partner" ? ` & ${partnershipData.batsman2Name}` : ""}
        </p>
        <p>Partnership Total: {partnershipData.partnershipRuns} runs</p>
      </div>
    );
  }
  return null;
}


export default function ScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = params.fixtureId ? parseInt(params.fixtureId as string, 10) : null;

  const fixture: Fixture | undefined = fixtureId ? allFixtures.find(f => f.id === fixtureId) : undefined;
  const result: Result | undefined = fixtureId ? resultsData.find(r => r.fixtureId === fixtureId) : undefined;

  const defaultTabValue = result?.innings && result.innings.length > 0 ? `innings-${result.innings[0].inningsNumber}` : "";
  
  const topTeamABatsmen = React.useMemo(() => getTopBatsmen(result?.teamA || '', result?.innings, 2), [result]);
  const topTeamABowlers = React.useMemo(() => getTopBowlers(result?.teamA || '', result?.innings, 2), [result]);
  const topTeamBBatsmen = React.useMemo(() => getTopBatsmen(result?.teamB || '', result?.innings, 2), [result]);
  const topTeamBBowlers = React.useMemo(() => getTopBowlers(result?.teamB || '', result?.innings, 2), [result]);

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
          <CardTitle className="text-2xl">
            Match Scorecard: {fixture.teamA} vs {fixture.teamB}
          </CardTitle>
          <CardDescription>
            Played on {format(new Date(fixture.date), 'EEEE, MMMM d, yyyy')} at {fixture.location}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6"> {/* Main content area */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="text-center md:text-left flex-1">
                <p className="font-semibold text-lg">{result.teamA}</p>
                <p className="text-2xl font-bold text-primary">{result.teamAScore}</p>
              </div>
              <p className="text-xl font-medium text-muted-foreground">vs</p>
              <div className="text-center md:text-right flex-1">
                <p className="font-semibold text-lg">{result.teamB}</p>
                <p className="text-2xl font-bold text-primary">{result.teamBScore}</p>
              </div>
            </div>
            
            <div className="text-center p-3 bg-card rounded-md shadow border"> {/* Changed background to card and added border */}
                <p className="text-lg font-semibold text-[hsl(var(--accent))] flex items-center justify-center"> {/* Changed text to accent */}
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  {result.winner} won by {result.margin}
                </p>
            </div>

            <Separator className="my-6" />

            <CardContent className="p-0"> {/* Removed default padding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">{result.teamA} - Top Performers</h3>
                  {(topTeamABatsmen.length > 0 || topTeamABowlers.length > 0) ? (
                    <div className="space-y-3">
                      {topTeamABatsmen.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Top Batsmen</p>
                          <ul className="space-y-1">
                            {topTeamABatsmen.map((batsman, index) => (
                              <li key={`tA-batsman-${index}`} className="text-sm flex justify-between items-center border-b last:border-b-0 py-1">
                                <span className="font-medium">{batsman.name}</span>
                                <span className="font-bold text-foreground">{batsman.runs} ({batsman.balls})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {topTeamABowlers.length > 0 && (
                        <div className="space-y-1 pt-2">
                          <p className="text-sm font-medium text-muted-foreground">Top Bowlers</p>
                          <ul className="space-y-1">
                            {topTeamABowlers.map((bowler, index) => (
                              <li key={`tA-bowler-${index}`} className="text-sm flex justify-between items-center border-b last:border-b-0 py-1">
                                <span className="font-medium">{bowler.name}</span>
                                <span className="font-bold text-foreground">{bowler.runsConceded}/{bowler.wickets} ({bowler.overs} ov)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No top performer data available for {result.teamA}.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">{result.teamB} - Top Performers</h3>
                  {(topTeamBBatsmen.length > 0 || topTeamBBowlers.length > 0) ? (
                    <div className="space-y-3">
                      {topTeamBBatsmen.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Top Batsmen</p>
                          <ul className="space-y-1">
                            {topTeamBBatsmen.map((batsman, index) => (
                              <li key={`tB-batsman-${index}`} className="text-sm flex justify-between items-center border-b last:border-b-0 py-1">
                                <span className="font-medium">{batsman.name}</span>
                                <span className="font-bold text-foreground">{batsman.runs} ({batsman.balls})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {topTeamBBowlers.length > 0 && (
                        <div className="space-y-1 pt-2">
                          <p className="text-sm font-medium text-muted-foreground">Top Bowlers</p>
                          <ul className="space-y-1">
                            {topTeamBBowlers.map((bowler, index) => (
                              <li key={`tB-bowler-${index}`} className="text-sm flex justify-between items-center border-b last:border-b-0 py-1">
                                <span className="font-medium">{bowler.name}</span>
                                <span className="font-bold text-foreground">{bowler.runsConceded}/{bowler.wickets} ({bowler.overs} ov)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No top performer data available for {result.teamB}.</p>
                  )}
                </div>
              </div>
            </CardContent>

            <Card className="bg-muted/30 mt-6">
              <CardHeader className="pb-2">
              <CardTitle className="text-xl">Player of the Match</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center text-md bg-muted/0 p-6 pt-2"> {/* Changed background to transparent for content */}
                  <Star className="mr-3 h-6 w-6 text-yellow-500" />
                  <p><strong className="font-semibold">{result?.playerOfTheMatch}</strong></p>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl">Innings Details</CardTitle>
                <CardDescription>
                  Full batting, bowling, and partnership details.
                </CardDescription>
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
                    {result.innings.map((inningData, index) => {
                      const partnershipVisualData = generatePartnershipUIData(inningData);
                      const chartConfig = {
                        partnershipRuns: { label: "Partnership Runs", color: "hsl(var(--primary))" },
                      };
                      return (
                        <TabsContent key={`content-innings-${inningData.inningsNumber}`} value={`innings-${inningData.inningsNumber}`} className="mt-4">
                          <Accordion type="multiple" defaultValue={['batting', 'bowling', 'fow', 'partnerships']} className="w-full space-y-4">
                            <AccordionItem value="batting">
                              <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                                Batting
                              </AccordionTrigger>
                              <AccordionContent className="border border-t-0 rounded-b-md p-0">
                                <div className="p-4">
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
                                      <TableRow className="bg-muted/50">
                                        <TableCell colSpan={2} className="font-bold text-lg">Total</TableCell>
                                        <TableCell className="text-right font-bold text-lg" colSpan={5}>{inningData.totalScoreString} ({inningData.oversPlayed})</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="bowling">
                              <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                                 Bowling
                              </AccordionTrigger>
                              <AccordionContent className="border border-t-0 rounded-b-md p-0">
                                <div className="p-4">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[200px]">Bowler</TableHead>
                                        <TableHead className="text-right">Overs</TableHead>
                                        <TableHead className="text-right">Maidens</TableHead>
                                        <TableHead className="text-right">Runs</TableHead>
                                        <TableHead className="text-right">Wickets</TableHead>
                                        <TableHead className="text-right">Economy</TableHead>
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
                               </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="fow">
                               <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                                Fall of Wickets
                              </AccordionTrigger>
                              <AccordionContent className="border border-t-0 rounded-b-md p-0">
                                {inningData.fallOfWickets && inningData.fallOfWickets.length > 0 ? (
                                  <div className="p-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                      {inningData.fallOfWickets.map((fow, idx) => (
                                        <Card key={`fow-${idx}`} className="bg-card text-card-foreground shadow-sm text-sm p-3">
                                          <p className="font-semibold">{getOrdinal(fow.wicket)} Wkt</p>
                                          <p className="text-lg font-bold text-primary">{fow.score}</p>
                                          <p className="text-xs text-muted-foreground truncate" title={fow.batsmanOut}>{fow.batsmanOut}</p>
                                          <p className="text-xs text-muted-foreground">Over: {fow.over}</p>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="p-4 text-sm text-muted-foreground">Fall of wickets data not available for this innings.</p>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="partnerships">
                               <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                                Batting Partnerships
                              </AccordionTrigger>
                              <AccordionContent className="border border-t-0 rounded-b-md p-0">
                                {partnershipVisualData.length > 0 ? (
                                  <div className="p-4">
                                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full aspect-auto">
                                      <BarChart
                                        layout="vertical"
                                        data={partnershipVisualData}
                                        margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
                                        barCategoryGap="20%"
                                      >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                                        <YAxis dataKey="wicketOrdinal" type="category" width={100} interval={0} tick={{ fontSize: 12 }} />
                                        <XAxis type="number" tick={{ fontSize: 12 }} />
                                        <Tooltip content={<PartnershipTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                                        <Legend content={<ChartLegendContent />} verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }}/>
                                        <Bar dataKey="partnershipRuns" fill="var(--color-partnershipRuns)" radius={[0, 4, 4, 0]} />
                                      </BarChart>
                                    </ChartContainer>
                                  </div>
                                ) : (
                                  <p className="p-4 text-sm text-muted-foreground">Partnership data not available for visualization.</p>
                                )}
                              </AccordionContent>
                            </AccordionItem>

                             <AccordionItem value="extras">
                                <AccordionTrigger className="text-lg font-medium p-4 bg-muted/50 rounded-t-md hover:no-underline">
                                  Extras
                                </AccordionTrigger>
                                <AccordionContent className="border border-t-0 rounded-b-md p-0">
                                <div className="p-4">
                                  <Card className="bg-background shadow-none border-0">
                                    <CardContent className="p-0">
                                      <p className="text-lg font-semibold">Total Extras: {inningData.extras.total}</p>
                                      {inningData.extras.details && <p className="text-muted-foreground text-sm mt-1">Details: {inningData.extras.details}</p>}
                                    </CardContent>
                                  </Card>
                                </div>
                                </AccordionContent>
                              </AccordionItem>

                          </Accordion> {/* Closing Accordion */}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                ) : (
                  <p className="text-muted-foreground">
                    Detailed innings-by-innings scorecards are not yet available for this match.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

