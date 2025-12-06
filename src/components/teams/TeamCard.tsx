import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Team, School, Division } from "@/types/firestore";

interface TeamCardProps {
  team: Team;
  school?: School;
  division?: Division;
  viewMode?: 'grid' | 'list';
}

export function TeamCard({ team, school, division, viewMode = 'grid' }: TeamCardProps) {
  const schoolName = school?.name || 'Unknown School';
  const divisionName = division?.name || 'Unknown Division';
  const season = division?.season || '-';

  // Generate fallback avatar if no logo is available
  const fallbackSchoolLogo = school?.name 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&background=random&color=fff`
    : '';
    
  const displayLogoUrl = (team.logoUrl && team.logoUrl.trim()) || school?.logoUrl || fallbackSchoolLogo;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow group border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {displayLogoUrl ? (
              <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/50">
                <Image 
                  src={displayLogoUrl} 
                  alt={team.name}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{team.name}</h3>
              <p className="text-sm text-muted-foreground">{schoolName}</p>
            </div>
            <div className="hidden md:flex items-center gap-6 mr-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Division</div>
                <div className="font-medium text-sm">{division?.name || '-'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Season</div>
                <div className="font-medium text-sm">{season}</div>
              </div>
            </div>
            <Link href={`/teams/${team.id}`}>
              <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground">View</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-primary">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          {displayLogoUrl ? (
            <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm">
              <Image 
                src={displayLogoUrl} 
                alt={team.name}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{team.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {schoolName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div>
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Division</div>
            <div className="font-medium text-sm truncate">{divisionName}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Season</div>
            <div className="font-medium text-sm">{season}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary" className="flex-1 justify-center py-1.5 bg-primary/5 text-primary hover:bg-primary/10 border-primary/10">
            {team.coachIds && team.coachIds.length > 0 ? `${team.coachIds.length} Coach(es)` : 'No Coach'}
          </Badge>
        </div>

        <Link href={`/teams/${team.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-md shadow-primary/20">
            View Team
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
