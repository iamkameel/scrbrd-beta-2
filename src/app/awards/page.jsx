import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export default function AwardsPage() {
    // Placeholder data
    const awards = [
        { id: 1, name: "Player of the Season 2023", recipient: "John Doe", type: "Player", team: "Eagles High", details: "Exceptional all-round performance." },
        { id: 2, name: "Championship Trophy 2023", recipient: "Panthers Academy", type: "Team", details: "Winners of Division B." },
        { id: 3, name: "Best Batsman Award", recipient: "Mike Brown", type: "Player", team: "Lions College", details: "Highest run scorer in the league." },
    ];
    return (<div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Awards & Accolades</CardTitle>
          <CardDescription>Recognizing achievements by players and teams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {awards.map((award) => (<Card key={award.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-7 w-7 text-[hsl(var(--accent))]"/>
                      <CardTitle className="text-lg">{award.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {award.type === "Player" ? <User className="mr-1.5 h-3.5 w-3.5"/> : <Shield className="mr-1.5 h-3.5 w-3.5"/>}
                      {award.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-md">{award.recipient} {award.team ? `(${award.team})` : ''}</p>
                  <p className="text-sm text-muted-foreground mt-1">{award.details}</p>
                </CardContent>
              </Card>))}
          </div>
        </CardContent>
      </Card>
    </div>);
}
