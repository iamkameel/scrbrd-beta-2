import { getAnalyticsDataAction } from "@/app/actions/analyticsActions";
import { TopPerformersList } from "@/components/analytics/TopPerformersList";
import { Card, CardContent } from "@/components/ui/Card";
import { Target, Activity, Shield, BarChart3, Trophy } from "lucide-react";

export default async function AnalyticsPage() {
  const result = await getAnalyticsDataAction();

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data } = result;

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive performance statistics and insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-3xl font-bold text-primary">{data.totalMatches}</p>
              </div>
              <Trophy className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="text-3xl font-bold text-primary">{data.totalRuns.toLocaleString()}</p>
              </div>
              <Target className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Wickets</p>
                <p className="text-3xl font-bold text-primary">{data.totalWickets}</p>
              </div>
              <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TopPerformersList
            title="Top Run Scorers"
            performers={data.topRunScorers}
            icon={<Target className="h-4 w-4 text-blue-500" />}
          />
          
          <TopPerformersList
            title="Top Wicket Takers"
            performers={data.topWicketTakers}
            icon={<Activity className="h-4 w-4 text-red-500" />}
          />
          
          <TopPerformersList
            title="Best Batting Average"
            performers={data.bestBattingAverages}
            icon={<Target className="h-4 w-4 text-green-500" />}
          />
          
          <TopPerformersList
            title="Best Bowling Economy"
            performers={data.bestBowlingEconomy}
            icon={<Activity className="h-4 w-4 text-purple-500" />}
          />
          
          <TopPerformersList
            title="Most Catches"
            performers={data.mostCatches}
            icon={<Shield className="h-4 w-4 text-amber-500" />}
          />
        </div>
      </div>
    </div>
  );
}
