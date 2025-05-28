import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";

export default function PlayersPage() {
  // Placeholder data
  const players = [
    { id: 1, name: "John Doe", team: "Eagles High School", runs: 1250, wickets: 50, catches: 25, avatar: "https://placehold.co/100x100.png" },
    { id: 2, name: "Jane Smith", team: "Panthers Academy", runs: 980, wickets: 15, catches: 40, avatar: "https://placehold.co/100x100.png" },
    { id: 3, name: "Mike Brown", team: "Lions College", runs: 2100, wickets: 5, catches: 12, avatar: "https://placehold.co/100x100.png" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Player Profiles</CardTitle>
          <CardDescription>Discover player statistics and career highlights.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search players..." className="pl-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <Card key={player.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="player portrait" />
                    <AvatarFallback>{player.name.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{player.name}</CardTitle>
                    <CardDescription>{player.team}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>Runs: {player.runs}</li>
                    <li>Wickets: {player.wickets}</li>
                    <li>Catches: {player.catches}</li>
                  </ul>
                   <Button variant="link" className="p-0 h-auto mt-2">View Full Profile</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
