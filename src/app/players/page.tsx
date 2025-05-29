
"use client"; // Required for using hooks like useState

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Filter, Users as TeamIcon, Briefcase } from "lucide-react";
import { playersData, type PlayerProfile, type PlayerSkills } from "@/lib/player-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [teamFilter, setTeamFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");

  const uniqueTeams = React.useMemo(() => {
    const teams = new Set(playersData.map(player => player.team));
    return ["all", ...Array.from(teams).sort()];
  }, []);

  const uniqueRoles = React.useMemo(() => {
    const roles = new Set(playersData.map(player => player.role));
    return ["all", ...Array.from(roles).sort()];
  }, []);

  const filteredPlayers = React.useMemo(() => {
    return playersData.filter(player => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" || // If search term is empty, it's a match for this part
        player.name.toLowerCase().includes(searchLower) ||
        player.team.toLowerCase().includes(searchLower) ||
        player.role.toLowerCase().includes(searchLower);

      const matchesTeam =
        teamFilter === "all" || player.team === teamFilter;

      const matchesRole =
        roleFilter === "all" || player.role === roleFilter;

      return matchesSearch && matchesTeam && matchesRole;
    });
  }, [searchTerm, teamFilter, roleFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-[hsl(var(--primary))]" />
            Player Profiles
          </CardTitle>
          <CardDescription>Discover player statistics and career highlights. Filter by team and role.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <TeamIcon className="mr-2 h-4 w-4" />
                    Team: {teamFilter === "all" ? "All" : teamFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Team</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={teamFilter} onValueChange={setTeamFilter}>
                    {uniqueTeams.map(team => (
                      <DropdownMenuRadioItem key={team} value={team}>
                        {team === "all" ? "All Teams" : team}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Role: {roleFilter === "all" ? "All" : roleFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
                    {uniqueRoles.map(role => (
                      <DropdownMenuRadioItem key={role} value={role}>
                        {role === "all" ? "All Roles" : role}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => {
                const overallRating = calculateOverallRating(player.skills);
                return (
                  <Card key={player.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader className="flex flex-row items-start gap-4 pb-3">
                      <Avatar className="h-16 w-16 mt-1">
                        <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="player portrait" />
                        <AvatarFallback>{player.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{player.name}</CardTitle>
                          {overallRating !== 'N/A' && (
                            <Badge variant="secondary" className="ml-2">
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
                    <CardContent className="pt-2 pb-4 mt-auto">
                       <Button asChild variant="default" size="sm" className="w-full">
                          <Link href={`/players/${player.id}`}>View Full Profile</Link>
                        </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No players found matching your search or filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
