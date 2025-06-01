
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Filter, Users as TeamIcon, Briefcase, Loader2, AlertTriangle } from "lucide-react";
// Temporarily remove PlayerSkills import to simplify
import type { PlayerProfile } from "@/lib/player-data"; 
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

// Temporarily comment out calculateOverallRating
/*
const calculateOverallRating = (skills: PlayerSkills | undefined): string | number => {
  if (!skills) {
    return 'N/A';
  }
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

  if (skillCount === 0) {
    return 'N/A';
  }
  return Math.round(totalScore / skillCount);
};
*/

const fetchPlayers = async (): Promise<PlayerProfile[]> => {
  const playersCollectionRef = collection(db, 'players');
  const q = firestoreQuery(playersCollectionRef, orderBy('name'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<PlayerProfile, 'id'>),
  }));
};

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [teamFilter, setTeamFilter] = React.useState<string>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");

  const { data: players, isLoading, isError, error } = useQuery<PlayerProfile[], Error>({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });

  // Temporarily simplify uniqueTeams
  const uniqueTeams = React.useMemo(() => {
    return ["all"];
    /*
    if (!players) {
      return ["all"];
    }
    const teamsSet = new Set(players.map(player => player.team).filter(team => typeof team === 'string' && team.trim() !== ''));
    return ["all", ...Array.from(teamsSet).sort()];
    */
  }, [players]);

  // Temporarily simplify uniqueRoles
  const uniqueRoles = React.useMemo(() => {
    return ["all"];
    /*
    if (!players) {
      return ["all"];
    }
    const rolesSet = new Set(players.map(player => player.role).filter(role => typeof role === 'string' && role.trim() !== ''));
    return ["all", ...Array.from(rolesSet).sort()];
    */
  }, [players]);

  // Temporarily simplify filteredPlayers
  const filteredPlayers = React.useMemo(() => {
    return players || [];
    /*
    if (!players) {
      return [];
    }
    return players.filter(player => {
      const searchLower = searchTerm.toLowerCase();
      
      const nameMatch = player.name && typeof player.name === 'string' && player.name.toLowerCase().includes(searchLower);
      const teamMatch = player.team && typeof player.team === 'string' && player.team.toLowerCase().includes(searchLower);
      const roleMatch = player.role && typeof player.role === 'string' && player.role.toLowerCase().includes(searchLower);
      
      const matchesSearch = searchTerm === "" || nameMatch || teamMatch || roleMatch;
      
      const matchesTeam = teamFilter === "all" || (player.team && typeof player.team === 'string' && player.team === teamFilter);
      const matchesRole = roleFilter === "all" || (player.role && typeof player.role === 'string' && player.role === roleFilter);

      return matchesSearch && matchesTeam && matchesRole;
    });
    */
  }, [players, searchTerm, teamFilter, roleFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" /> Error Loading Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">There was a problem fetching players from the database.</p>
          {error && <p className="text-xs text-muted-foreground mt-2">Details: {error.message}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary" /> Player Profiles
          </CardTitle>
          <CardDescription>
            Browse player profiles, view statistics, and manage player data from the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, team, or role..."
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

          {filteredPlayers && filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => {
                // Temporarily remove overallRating calculation and display
                // const overallRating = calculateOverallRating(player.skills); 
                return (
                  <Card key={player.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader className="flex flex-row items-start gap-4 pb-3">
                      <Avatar className="h-14 w-14 mt-1">
                        <AvatarImage src={player.avatar} alt={player.name || 'Player'} data-ai-hint="player portrait"/>
                        <AvatarFallback>{player.name ? player.name.substring(0, 2).toUpperCase() : 'P'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{player.name || 'Unknown Player'}</CardTitle>
                          {/* Temporarily remove overallRating badge
                          {overallRating !== 'N/A' && (
                            <Badge variant="secondary" className="ml-2">
                              {overallRating}
                            </Badge>
                          )}
                          */}
                        </div>
                        <CardDescription>{player.team || 'N/A Team'} - {player.role || 'N/A Role'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow py-3">
                        <div className="grid grid-cols-3 gap-2">
                          <CompactStatDisplay label="Mat" value={player.stats?.matchesPlayed} />
                          <CompactStatDisplay label="Runs" value={player.stats?.runs} />
                          <CompactStatDisplay label="Bat Avg" value={player.stats?.average} />
                          <CompactStatDisplay label="Wkts" value={player.stats?.wickets} />
                          <CompactStatDisplay label="Bowl Avg" value={player.stats?.bowlingAverage} />
                          <CompactStatDisplay label="Catches" value={player.stats?.catches} />
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
             <p className="text-center text-muted-foreground py-4">
              { (!players || players.length === 0) && !isLoading ? "No players found in the database." : "No players match your search or filter criteria."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
