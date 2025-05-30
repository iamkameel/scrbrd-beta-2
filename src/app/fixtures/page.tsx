import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fixtures, type Fixture } from "@/lib/fixtures-data";
import { format, isFuture, subDays, isWithinInterval } from 'date-fns';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FixturesPage() {

  const getStatusBadgeVariant = (status: Fixture["status"], date: string): "default" | "secondary" | "destructive" | "outline" => {
    const fixtureDate = new Date(date);
    const today = new Date();
    const fiveDaysFromNow = subDays(today, -5); // Calculate 5 days from now

    if (status === "Scheduled" && isFuture(fixtureDate) && isWithinInterval(fixtureDate, { start: today, end: fiveDaysFromNow })) {
      return "default"; // Use default for Upcoming within 5 days
    }

    switch (status) {
      case "Upcoming": // This case will now only catch Upcoming that are not within 5 days and are not Scheduled
      case "Rain-Delay":
      case "Play Suspended":
      case "Completed":
        return "default";
      case "Live":
        return "destructive";
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Match Fixtures</CardTitle>
              <CardDescription>Upcoming and past match schedules.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/fixtures/create">Create New Fixture</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fixtures.map((fixture) => (
              <Card key={fixture.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{fixture.teamA} vs {fixture.teamB}</CardTitle>
                    <Badge
                      variant={getStatusBadgeVariant(fixture.status, fixture.date)}
                      className={cn(
                        "whitespace-nowrap",
                        fixture.status === "Upcoming" && "bg-[hsl(var(--accent))] text-accent-foreground border-transparent",
                        fixture.status === "Completed" && "bg-[hsl(120,60%,30%)] text-accent-foreground border-transparent",
                        fixture.status === "Live" && "bg-destructive text-destructive-foreground border-transparent animate-pulse",
                        fixture.status === "Rain-Delay" && "bg-[hsl(var(--primary))] text-primary-foreground border-transparent opacity-80",
                        fixture.status === "Play Suspended" && "bg-[hsl(var(--chart-3))] text-card-foreground border-transparent",
                        fixture.status === "Match Abandoned" && "bg-[hsl(var(--secondary))] text-muted-foreground opacity-80 border-transparent",
                        // Add class for Scheduled status when it's within 5 days (now appearing as default variant)
                         getStatusBadgeVariant(fixture.status, fixture.date) === "default" && fixture.status === "Scheduled" && isFuture(new Date(fixture.date)) && isWithinInterval(new Date(fixture.date), { start: new Date(), end: subDays(new Date(), -5) }) && "bg-[hsl(var(--accent))] text-accent-foreground border-transparent"
                      )}
                    >
                       {fixture.status === "Scheduled" && isFuture(new Date(fixture.date)) && isWithinInterval(new Date(fixture.date), { start: new Date(), end: subDays(new Date(), -5) }) ? "Upcoming" : fixture.status}
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