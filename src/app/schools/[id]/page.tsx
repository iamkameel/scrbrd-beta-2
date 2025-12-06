import { 
  fetchSchoolById, 
  getTeamsBySchool, 
  fetchSchoolStaff, 
  fetchSchoolNews, 
  fetchSchoolStats,
  fetchMatches 
} from "@/lib/firestore";
import { notFound } from "next/navigation";
import { SchoolHero } from "@/components/schools/profile/SchoolHero";
import { SchoolStatsCards } from "@/components/schools/profile/SchoolStatsCards";
import { SchoolTabs } from "@/components/schools/profile/SchoolTabs";
import { SchoolSidebar } from "@/components/schools/profile/SchoolSidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings } from "lucide-react";
import Link from "next/link";

export default async function SchoolProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const schoolId = params.id;

  // Parallel data fetching
  const [school, teams, staff, news, stats, allMatches] = await Promise.all([
    fetchSchoolById(schoolId),
    getTeamsBySchool(schoolId),
    fetchSchoolStaff(schoolId),
    fetchSchoolNews(schoolId),
    fetchSchoolStats(schoolId),
    fetchMatches(50) // Fetch recent matches to filter
  ]);

  if (!school) {
    notFound();
  }

  // Filter matches for this school (home or away team belongs to school)
  // Note: Ideally we'd have a more direct query, but this works for now given the schema
  const teamIds = new Set(teams.map(t => t.id));
  const schoolFixtures = allMatches.filter(m => 
    teamIds.has(m.homeTeamId) || teamIds.has(m.awayTeamId)
  ).filter(m => m.status === 'scheduled').slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Fixed Header Menu (simulated with sticky) */}
      <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <Link href="/schools">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Schools
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage School
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <SchoolHero school={school} />

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <SchoolStatsCards stats={stats || {
              schoolId: school.id,
              totalTeams: teams.length,
              activePlayers: 0, // Placeholder
              coachingStaff: staff.length,
              upcomingFixtures: schoolFixtures.length,
              lastUpdated: new Date().toISOString(),
              id: 'temp-stats-id' // Add dummy ID to satisfy type if needed
            }} />

            {/* About Section */}
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">About {school.name}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {school.name} is a prestigious institution with a rich history of academic and sporting excellence. 
                Founded in {school.establishmentYear}, the school has produced numerous provincial and national athletes.
                We are committed to holistic education, fostering values of integrity, respect, and perseverance in our students.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 not-prose">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                  <h3 className="font-semibold mb-2 text-primary">Academic Excellence</h3>
                  <p className="text-sm text-muted-foreground">Consistently ranked among top performing schools with 100% matric pass rate.</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                  <h3 className="font-semibold mb-2 text-primary">Sporting Heritage</h3>
                  <p className="text-sm text-muted-foreground">Home to state-of-the-art facilities including 5 cricket ovals and a high-performance centre.</p>
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <SchoolTabs teams={teams} staff={staff} fixtures={schoolFixtures} school={school} />
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-1">
            <SchoolSidebar school={school} news={news} />
          </div>
        </div>
      </div>
    </div>
  );
}
