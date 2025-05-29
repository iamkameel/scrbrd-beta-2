
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fixtures, type Fixture } from "@/lib/fixtures-data";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

export default function FixturesPage() {

  const getStatusBadgeVariant = (status: Fixture["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Upcoming":
      case "Rain-Delay":
      case "Play Suspended":
      case "Completed": // Base variant can be default for custom styling
        return "default"; 
      case "Live":
        return "destructive"; // Red
      case "Match Abandoned": 
        return "secondary"; 
      case "Scheduled":
      default:
        return "outline"; 
    }
  };

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
                    <Badge
                      variant={getStatusBadgeVariant(fixture.status)}
                      className={cn(
                        "whitespace-nowrap",
                        fixture.status === "Upcoming" && "bg-[hsl(var(--accent))] text-accent-foreground border-transparent",
                        fixture.status === "Completed" && "bg-[hsl(120,60%,30%)] text-accent-foreground border-transparent",
                        fixture.status === "Rain-Delay" && "bg-[hsl(var(--primary))] text-primary-foreground border-transparent opacity-80",
                        fixture.status === "Play Suspended" && "bg-[hsl(var(--chart-3))] text-card-foreground border-transparent",
                        fixture.status === "Match Abandoned" && "bg-[hsl(var(--secondary))] text-muted-foreground opacity-80 border-transparent"
                      )}
                    >
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
