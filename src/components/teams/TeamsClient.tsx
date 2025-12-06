"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Shield, LayoutGrid, List, Table, Calendar, Search } from "lucide-react";
import { Team, School, Division } from "@/types/firestore";
import { TeamCard } from "./TeamCard";

interface TeamsClientProps {
  teams: Team[];
  schools: School[];
  divisions: Division[];
}

export function TeamsClient({ teams, schools, divisions }: TeamsClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'teams-view-mode',
    defaultMode: 'grid'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    const school = schools.find((s: School) => s.id === team.schoolId);
    const division = divisions.find((d: Division) => d.id === team.divisionId);
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      team.name.toLowerCase().includes(searchLower) ||
      school?.name.toLowerCase().includes(searchLower) ||
      division?.name.toLowerCase().includes(searchLower)
    );

    const matchesSchool = selectedSchool === 'all' || team.schoolId === selectedSchool;
    const matchesDivision = selectedDivision === 'all' || team.divisionId === selectedDivision;

    return matchesSearch && matchesSchool && matchesDivision;
  });

  return (
    <div className="space-y-6">
      {/* Search and View Mode Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams, schools, divisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/20 self-end sm:self-auto">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
              title="Table View"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8 px-3"
              title="Calendar View"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-muted/10 p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">School:</span>
            <select 
              className="h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
            >
              <option value="all">All Schools</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Division:</span>
            <select 
              className="h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="all">All Divisions</option>
              {divisions.map(division => (
                <option key={division.id} value={division.id}>{division.name}</option>
              ))}
            </select>
          </div>

          {(selectedSchool !== 'all' || selectedDivision !== 'all' || searchTerm) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedSchool('all');
                setSelectedDivision('all');
                setSearchTerm('');
              }}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}
        {(selectedSchool !== 'all' || selectedDivision !== 'all') && ' matching filters'}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team: Team) => {
            const school = schools.find((s: School) => s.id === team.schoolId);
            const division = divisions.find((d: Division) => d.id === team.divisionId);
            
            return (
              <TeamCard 
                key={team.id} 
                team={team} 
                school={school} 
                division={division} 
                viewMode="grid" 
              />
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredTeams.map((team: Team) => {
            const school = schools.find((s: School) => s.id === team.schoolId);
            const division = divisions.find((d: Division) => d.id === team.divisionId);

            return (
              <TeamCard 
                key={team.id} 
                team={team} 
                school={school} 
                division={division} 
                viewMode="list" 
              />
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden border-t-4 border-t-primary">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Team</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">School</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Division</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Season</th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Coach</th>
                    <th className="text-right p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team: Team) => {
                    const school = schools.find((s: School) => s.id === team.schoolId);
                    const division = divisions.find((d: Division) => d.id === team.divisionId);

                    return (
                      <tr key={team.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {(team.logoUrl && team.logoUrl.trim()) || school?.logoUrl ? (
                              <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden bg-muted border border-border/50">
                                <Image 
                                  src={(team.logoUrl && team.logoUrl.trim()) || school?.logoUrl || ''} 
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
                              <div className="w-8 h-8 shrink-0 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Shield className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <span className="font-medium">{team.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{school?.name || '-'}</td>
                        <td className="p-4 text-muted-foreground">{division?.name || '-'}</td>
                        <td className="p-4 text-muted-foreground">{division?.season || '-'}</td>
                        <td className="p-4 text-muted-foreground">
                          {team.coachIds && team.coachIds.length > 0 ? team.coachIds.length : '0'}
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/teams/${team.id}`}>
                            <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">View</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                View team schedules, upcoming matches, and training sessions in a calendar format.
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No teams found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedSchool !== 'all' || selectedDivision !== 'all' 
                ? 'Try adjusting your filters or search terms' 
                : 'Get started by adding your first team'}
            </p>
            {(!searchTerm && selectedSchool === 'all' && selectedDivision === 'all') && (
              <Link href="/teams/add">
                <Button>
                  Add Team
                </Button>
              </Link>
            )}
            {(searchTerm || selectedSchool !== 'all' || selectedDivision !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSchool('all');
                  setSelectedDivision('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
