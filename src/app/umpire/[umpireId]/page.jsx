"use client";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { umpiresData } from '@/lib/umpire-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, CalendarClock, CheckCircle, Star, ListChecks, Info, Building, Briefcase, FileText, ShieldHalf } from "lucide-react"; // Added ShieldHalf
import { format } from 'date-fns';
const DetailItem = ({ label, value, icon: Icon, className }) => (<div className={`flex items-start py-2 ${className}`}>
    {Icon && <Icon className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5"/>}
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {value !== undefined && value !== null ? (typeof value === 'string' || typeof value === 'number' ? (<p className="text-md text-foreground">{value}</p>) : (<div className="text-md text-foreground">{value}</div>)) : (<p className="text-md text-muted-foreground">N/A</p>)}
    </div>
  </div>);
export default function UmpireDetailPage() {
    const params = useParams();
    const router = useRouter();
    const umpireId = params.umpireId;
    const umpire = umpiresData.find(s => s.id === umpireId);
    if (!umpire) {
        return (<div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Umpire Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn't find details for this umpire.</p>
            <Button onClick={() => router.push('/umpire-profiles')}>
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Umpire Profiles
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/umpire-profiles">
          <ArrowLeft className="mr-2 h-4 w-4"/>
          Back to Umpire Profiles
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader className="bg-muted/50 p-6 flex flex-col items-center text-center space-y-3 md:flex-row md:text-left md:space-y-0 md:space-x-6">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-md">
            <AvatarImage src={umpire.avatar} alt={umpire.name} data-ai-hint="person official"/>
            <AvatarFallback className="text-3xl">{umpire.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold">{umpire.name}</CardTitle>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="default" className="text-sm px-3 py-1">{umpire.umpiringLevel}</Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">{umpire.availability}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {umpire.bio && (<Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-[hsl(var(--primary))]"/> About {umpire.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{umpire.bio}</p>
              </CardContent>
            </Card>)}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-[hsl(var(--primary))]"/> Recent Match Assignments
              </CardTitle>
              <CardDescription>Matches recently officiated by {umpire.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {umpire.recentMatchesOfficiated.length > 0 ? (<div className="space-y-4">
                  {umpire.recentMatchesOfficiated.map((match) => (<Card key={match.fixtureId} className="bg-muted/30 p-4 shadow-sm">
                      <p className="font-semibold text-md">{match.matchDescription}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {format(new Date(match.date), "EEE, MMM d, yyyy")}
                        {match.role && <span className="ml-2 text-xs font-medium text-primary">({match.role})</span>}
                      </p>
                      {match.result && match.result !== "Pending" && match.result !== "Live" && (<p className="text-sm text-muted-foreground">Result: {match.result}</p>)}
                      {(match.result === "Pending" || match.result === "Live") && (<Badge variant={match.result === "Live" ? "destructive" : "outline"} className="mt-1">
                            {match.result}
                         </Badge>)}
                      <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">
                        <Link href={`/scorecard/${match.fixtureId}`}>View Scorecard</Link>
                      </Button>
                    </Card>))}
                </div>) : (<p className="text-muted-foreground">No recent match assignments found.</p>)}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[hsl(var(--primary))]"/> Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailItem label="Umpiring Level" value={umpire.umpiringLevel} icon={ShieldHalf}/>
              <DetailItem label="Availability" value={umpire.availability} icon={CalendarClock}/>
              <DetailItem label="Years of Experience" value={`${umpire.experienceYears} years`} icon={CheckCircle}/>
              <DetailItem label="Total Matches Officiated" value={umpire.matchesOfficiatedCount} icon={FileText}/>
              {umpire.reliabilityScore !== undefined && (<DetailItem label="Reliability Score" value={<div className="flex items-center gap-2">
                      <span>{umpire.reliabilityScore}/100</span>
                      <Star className="h-4 w-4 text-yellow-500"/>
                    </div>} icon={Star}/>)}
              {umpire.associatedClubOrUnion && (<DetailItem label="Primary Affiliation" value={umpire.associatedClubOrUnion} icon={Building}/>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-[hsl(var(--primary))]"/> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailItem label="Email Address" value={umpire.email} icon={Mail}/>
              <DetailItem label="Phone Number" value={umpire.phone} icon={Phone}/>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
