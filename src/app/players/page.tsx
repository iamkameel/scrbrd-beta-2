
"use client"; // Required for using hooks like useState

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { playersData, type PlayerProfile } from "@/lib/player-data"; // Import new data structure

const CompactStatDisplay: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="text-center px-1">
    <p className="text-xs uppercase text-muted-foreground tracking-tight truncate">{label}</p>
    <p className="text-md font-semibold text-foreground">{value !== undefined ? String(value) : '-'}</p>
  </div>
);

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
              {filteredPlayers.map((player) => (
                <Card key={player.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="player portrait" />
                      <AvatarFallback>{player.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      <CardDescription>{player.team} - {player.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow py-3">
                    <div className="grid grid-cols-3 gap-2">
                      <CompactStatDisplay label="Runs" value={player.stats.runs} />
                      <CompactStatDisplay label="Wkts" value={player.stats.wickets} />
                      <CompactStatDisplay label="Catches" value={player.stats.catches} />
                    </div>
                  </CardContent>
                  <CardContent className="pt-0 mt-auto">
                     <Button asChild variant="link" className="p-0 h-auto text-primary">
                        <Link href={`/players/${player.id}`}>View Full Profile</Link>
                      </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No players found matching your search.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
