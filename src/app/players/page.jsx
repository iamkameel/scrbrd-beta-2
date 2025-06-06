"use client";
import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Search, TrendingUp, Users as UsersIcon, Shield, MoreHorizontal, Loader2, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
// CompactStatDisplay component for displaying a single stat neatly
const CompactStatDisplay = ({ label, value, icon: Icon }) => (<div className="flex flex-col items-center text-center p-1 bg-muted/50 rounded-md flex-1 min-w-[70px]">
    {Icon && <Icon className="h-4 w-4 mb-0.5 text-muted-foreground"/>}
    <p className="text-xs uppercase text-muted-foreground tracking-tight truncate">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value !== undefined ? String(value) : '-'}</p>
  </div>);
/*
// calculateOverallRating function and PlayerSkills type are still commented out for now
import type { PlayerSkills } from '@/lib/player-data';

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
*/
const fetchPlayers = async () => {
    const playersCollectionRef = collection(db, 'players');
    const q = firestoreQuery(playersCollectionRef, orderBy('name')); // Order by name
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
};
export default function PlayersPage() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [teamFilter, setTeamFilter] = React.useState("all");
    const [roleFilter, setRoleFilter] = React.useState("all"); // Added role filter state
    const { data: players, isLoading, isError, error } = useQuery({
        queryKey: ['players'],
        queryFn: fetchPlayers,
    }); // Fetch players data
    React.useEffect(() => {
        if (isLoading) {
            console.log("PlayersPage: Player data is loading...");
        }
        if (isError) {
            console.error("PlayersPage: Error fetching players:", error);
        }
        if (players) {
            console.log("PlayersPage: Fetched players data:", players);
            if (players.length === 0) {
                console.warn("PlayersPage: Fetched players data is an empty array. Ensure your 'players' collection in Firestore has documents, or run the migration script.");
            }
        }
    }, [players, isLoading, isError, error]);
    const uniqueTeams = React.useMemo(() => {
        if (!players)
            return ["all"];
        // Corrected filter to use a type predicate for string | undefined
        const teams = new Set(players.map(player => player.teamId).filter((teamId) => teamId !== undefined && teamId !== null));
        return ["all", ...Array.from(teams).sort()];
    }, [players]);
    const uniqueRoles = React.useMemo(() => {
        if (!players)
            return ["all"];
        const roles = new Set(players.map(player => player.role).filter((role) => role !== undefined && role !== null));
        return ["all", ...Array.from(roles).sort()];
    }, [players]);
    const filteredPlayers = React.useMemo(() => {
        if (!players)
            return [];
        return players.filter(player => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const nameMatch = player.name && typeof player.name === 'string' && player.name.toLowerCase().includes(lowerSearchTerm);
            const teamNameMatch = player.teamId && typeof player.teamId === 'string' && player.teamId.toLowerCase().includes(lowerSearchTerm);
            const matchesSearch = !searchTerm || nameMatch || teamNameMatch;
            const matchesTeam = teamFilter === "all" || (player.teamId && player.teamId === teamFilter);
            const matchesRole = roleFilter === "all" || (player.role && player.role === roleFilter);
            return matchesSearch && matchesTeam && matchesRole;
        });
    }, [players, searchTerm, teamFilter, roleFilter]);
    if (isLoading) {
        return (<div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        <p className="ml-2 text-muted-foreground">Loading player profiles...</p>
      </div>);
    }
    if (isError) {
        return (<Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6"/> Error Loading Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">There was a problem fetching player data from the database.</p>
          {error && <p className="text-xs text-muted-foreground mt-2">Details: {error.message}</p>}
        </CardContent>
      </Card>);
    }
    return (<div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary"/> Player Profiles
          </CardTitle>
          <CardDescription>
            Browse and search for cricket player profiles. Filter by team or role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
              <Input placeholder="Search by name or team..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <UsersIcon className="mr-2 h-4 w-4"/>
                    Team: {teamFilter === "all" ? "All" : teamFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Team</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={teamFilter} onValueChange={setTeamFilter}>
                    {uniqueTeams.map(team => (<DropdownMenuRadioItem key={team} value={team}>
                        {team === "all" ? "All Teams" : team}
                      </DropdownMenuRadioItem>))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <Shield className="mr-2 h-4 w-4"/>
                    Role: {roleFilter === "all" ? "All" : roleFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
                    {uniqueRoles.map(role => (<DropdownMenuRadioItem key={role} value={role}>
                        {role === "all" ? "All Roles" : role}
                      </DropdownMenuRadioItem>))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredPlayers && filteredPlayers.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => {
                // const overallRating = calculateOverallRating(player.skills); // Still commented out
                return (<Card key={player.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={player.avatar} alt={player.name || 'Player'} data-ai-hint="player portrait"/>
                        <AvatarFallback>{player.name ? player.name.substring(0, 2).toUpperCase() : 'P'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{player.name || 'Unnamed Player'}</CardTitle>
                        <CardDescription className="text-xs">{player.role || 'N/A'}</CardDescription>
                      </div>
                      {/* Overall rating display is still out for now
                    <div className="text-center ml-auto">
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="text-xl font-bold text-primary">{overallRating}</p>
                    </div>
                    */}
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3 pt-2">
                      <Badge variant="outline" className="text-xs w-full justify-center truncate">
                        Team ID: {player.teamId || 'N/A'}
                      </Badge>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <CompactStatDisplay label="Matches" value={player.stats?.matchesPlayed} icon={User}/>
                        <CompactStatDisplay label="Runs" value={player.stats?.runs} icon={TrendingUp}/>
                        <CompactStatDisplay label="Bat Avg" value={player.stats?.average}/>
                        <CompactStatDisplay label="Wickets" value={player.stats?.wickets}/>
                         {/* Add more compact stats if needed, ensuring they exist in CompactPlayerStats and PlayerProfile.stats */}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t mt-auto">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/players/${player.id}`}>
                          <MoreHorizontal className="mr-2 h-4 w-4"/> View Full Profile
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>);
            })}
            </div>) : (<p className="text-center text-muted-foreground py-10">
              No players found matching your search or filters.
            </p>)}
        </CardContent>
      </Card>
    </div>);
}
