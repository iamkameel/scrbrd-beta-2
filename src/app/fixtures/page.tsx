
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fixtures } from "@/lib/fixtures-data"; // Import from new location
import { format } from 'date-fns';

export default function FixturesPage() {
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
                    <Badge variant={fixture.status === "Upcoming" ? "default" : fixture.status === "Live" ? "destructive" : "secondary"} className={fixture.status === "Upcoming" ? "bg-[hsl(var(--accent))] text-accent-foreground" : ""}>
                      {fixture.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>{format(new Date(fixture.date), 'EEE, MMM d, yyyy')}</span>
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
