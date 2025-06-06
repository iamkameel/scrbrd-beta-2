import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Radar } from "lucide-react";
export default function SpiderChartPage() {
    return (<div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Radar className="h-6 w-6 text-[hsl(var(--primary))]"/> Spider Chart Analysis
          </CardTitle>
          <CardDescription>Visualize batting power, precision, and directionality. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image src="https://placehold.co/600x400.png" alt="Spider Chart Placeholder" width={600} height={400} className="mx-auto my-6 rounded-lg shadow-md" data-ai-hint="chart graph"/>
          <p className="text-muted-foreground">
            This chart will represent batting metrics based on the distance and direction the ball travels,
            offering insights into a player's shot-making capabilities.
          </p>
        </CardContent>
      </Card>
    </div>);
}
