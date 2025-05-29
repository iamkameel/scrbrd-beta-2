
"use client"; // Required for using hooks like useState

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User } from "lucide-react";
import { playersData, type PlayerProfile, type PlayerSkills } from "@/lib/player-data";

const CompactStatDisplay: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="text-center px-1">
    <p className="text-xs uppercase text-muted-foreground tracking-tight truncate">{label}</p>
    <p className="text-md font-semibold text-foreground">{value !== undefined ? String(value) : '-'}</p>
  </div>
);

// Helper function to calculate overall rating from skills
const calculateOverallRating = (skills: PlayerSkills | undefined): string | number => {
  if (!skills) return 'N/A';

  let totalScore = 0;
  let skillCount = 0;

  const processSkillCategory = (category: Record<string, number | undefined> | undefined) => {
    if (category) {
      Object.values(category).forEach(score => {
        if (score !== undefined && typeof score === 'number') {
          totalScore += score;
          skillCount++;
        }
      });
    }
  };

  processSkillCategory(skills.technical);
  processSkillCategory(skills.tactical);
  processSkillCategory(skills.physicalMental);
  processSkillCategory(skills.teamLeadership);

  if (skillCount === 0) return 'N/A';
  return Math.round(totalScore / skillCount);
};


export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredPlayers = React.useMemo(() => {
    return playersData.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-[hsl(var(--primary))]" />
            Player Profiles
            </CardTitle>
          <CardDescription>Discover player statistics and career highlights.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search players by name, team, or role..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => {
                const overallRating = calculateOverallRating(player.skills);
                return (
                  <Card key={player.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader className="flex flex-row items-start gap-4 pb-3"> {/* Adjusted pb */}
                      <Avatar className="h-16 w-16 mt-1"> {/* Added mt-1 for alignment */}
                        <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="player portrait" />
                        <AvatarFallback>{player.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{player.name}</CardTitle>
                          {overallRating !== 'N/A' && (
                            <Badge variant="secondary" className="ml-2"> {/* Added ml-2 for spacing */}
                              {overallRating}
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{player.team} - {player.role}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow py-3">
                      <div className="grid grid-cols-3 gap-2">
                        <CompactStatDisplay label="Mat" value={player.stats.matchesPlayed} />
                        <CompactStatDisplay label="Runs" value={player.stats.runs} />
                        <CompactStatDisplay label="Bat Avg" value={player.stats.average} />
                        <CompactStatDisplay label="Wkts" value={player.stats.wickets} />
                        <CompactStatDisplay label="Bowl Avg" value={player.stats.bowlingAverage} />
                        <CompactStatDisplay label="Catches" value={player.stats.catches} />
                      </div>
                    </CardContent>
                    <CardContent className="pt-0 mt-auto">
                       <Button asChild variant="link" className="p-0 h-auto text-primary">
                          <Link href={`/players/${player.id}`}>View Full Profile</Link>
                        </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No players found matching your search.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
