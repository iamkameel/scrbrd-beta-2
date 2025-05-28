import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FixturesPage() {
  // Placeholder data
  const fixtures = [
    { id: 1, teamA: "Eagles High", teamB: "Panthers Academy", date: "2024-09-15", time: "10:00 AM", location: "Northwood Main Oval", status: "Upcoming" },
    { id: 2, teamA: "Lions College", teamB: "Knights School", date: "2024-09-22", time: "02:00 PM", location: "Hillcrest College Green", status: "Upcoming" },
    { id: 3, teamA: "Warriors Club", teamB: "Sharks United", date: "2024-08-10", time: "09:30 AM", location: "City Stadium", status: "Past" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Match Fixtures</CardTitle>
          <CardDescription>Upcoming and past match schedules.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fixtures.map((fixture) => (
              <Card key={fixture.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{fixture.teamA} vs {fixture.teamB}</CardTitle>
                    <Badge variant={fixture.status === "Upcoming" ? "default" : "secondary"} className={fixture.status === "Upcoming" ? "bg-[hsl(var(--accent))] text-accent-foreground" : ""}>
                      {fixture.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>{new Date(fixture.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{fixture.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{fixture.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
