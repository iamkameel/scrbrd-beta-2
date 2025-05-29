
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { schoolsData, type SchoolProfile } from '@/lib/schools-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info, MapPin, Shield, Trophy, ListChecks, ClipboardList, Building, Users, BarChart } from "lucide-react";
import { cn } from '@/lib/utils';

export default function SchoolProfilePage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.schoolId ? parseInt(params.schoolId as string, 10) : null;

  const school: SchoolProfile | undefined = schoolId ? schoolsData.find(s => s.id === schoolId) : undefined;

  if (!school) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>School Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn't find details for this school.</p>
            <Button onClick={() => router.push('/schools')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Schools List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/schools">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schools List
        </Link>
      </Button>

      {/* Banner Image */}
      {school.bannerImageUrl && (
        <Card className="overflow-hidden shadow-lg rounded-xl">
          <div className="relative h-48 md:h-72">
            <Image
              src={school.bannerImageUrl}
              alt={`${school.name} Banner`}
              fill
              style={{ objectFit: "cover" }}
              priority
              data-ai-hint="school building campus"
            />
          </div>
        </Card>
      )}

      {/* Header Section */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="flex flex-col items-center text-center p-6 space-y-4">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={school.crestUrl} alt={`${school.name} Crest`} data-ai-hint="school logo crest" />
            <AvatarFallback className="text-3xl">{school.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold">{school.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground flex items-center justify-center gap-1.5">
              <MapPin className="h-5 w-5" /> {school.location}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          {school.about && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-[hsl(var(--primary))]" /> About {school.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{school.about}</p>
              </CardContent>
            </Card>
          )}

          {/* Playing Fields Section */}
          {school.fields && school.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building className="h-5 w-5 text-[hsl(var(--primary))]" /> Playing Fields
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {school.fields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
           {/* Affiliated Teams Section */}
          {school.teams && school.teams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-[hsl(var(--primary))]" /> Affiliated Cricket Teams
                </CardTitle>
                 <CardDescription>Total Teams: {school.teams.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {school.teams.slice(0, 5).map((team) => ( // Display first 5 teams
                    <div key={team.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md text-sm">
                      <span>{team.name} ({team.ageGroup})</span>
                      <Badge variant="outline">{team.division} Div</Badge>
                    </div>
                  ))}
                  {school.teams.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      ...and {school.teams.length - 5} more teams.
                    </p>
                  )}
                </div>
                {/* Potential button to view all teams for this school */}
              </CardContent>
            </Card>
          )}


          {/* Awards & Accolades Section */}
          {school.awardsAndAccolades && school.awardsAndAccolades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[hsl(var(--primary))]" /> Awards & Accolades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {school.awardsAndAccolades.map((award, index) => (
                    <li key={index}>{award}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* School Records Section */}
          {school.records && school.records.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-[hsl(var(--primary))]" /> School Cricket Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {school.records.map((record, index) => (
                    <li key={index}>{record}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
