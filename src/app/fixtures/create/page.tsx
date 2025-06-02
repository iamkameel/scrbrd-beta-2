
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { schoolsData as allSchools } from '@/lib/schools-data';
import { detailedTeamsData as allTeams, type Team as TeamData } from '@/lib/team-data';
import { scorersData as allScorersData, type ScorerProfile } from '@/lib/scorer-data';
import { umpiresData as allUmpiresData, type UmpireProfile } from '@/lib/umpire-data';
import { divisionsData as allDivisionsData, type Division } from '@/lib/divisions-data';
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel as DropdownMenuLabelComponent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { Loader2, Users } from 'lucide-react';

const AGE_DIVISIONS = ["Open", "U19", "U18", "U17", "U16", "U15", "U14", "U13", "U12", "U11", "U10", "U9"] as const;
const OPEN_CLASSES = ["1st XI", "2nd XI", "3rd XI", "4th XI", "5th XI", "Club Premier", "Club Reserve"] as const;
const AGE_SPECIFIC_CLASSES = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

const fixtureFormSchema = z.object({
  matchType: z.enum(['T20', 'ODI', 'Test'], { required_error: "Match type is required."}),
  overs: z.number().min(1, "Overs must be at least 1.").optional(),
  ageDivision: z.enum(AGE_DIVISIONS, { required_error: "Age Division is required."}),
  openClass: z.enum(OPEN_CLASSES).optional(),
  ageSpecificClass: z.enum(AGE_SPECIFIC_CLASSES).optional(),
  homeTeamSchoolId: z.string().min(1, "Home school is required."),
  homeTeamId: z.string().min(1, "Home team is required."),
  awayTeamId: z.string().min(1, "Away team is required."),
  scheduledDate: z.date({ required_error: "Date is required."}),
  time: z.string().min(1, "Time is required."),
  venueId: z.string().min(1, "Location/Field is required."),
  umpireIds: z.array(z.string()).optional(),
  scorerId: z.string().optional().default('no-scorer'), // Ensures scorerId always has a value or is 'no-scorer'
  leagueId: z.string().optional(),
  provinceId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.ageDivision === "Open" && !data.openClass) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Open Class is required for Open Age Division.",
      path: ["openClass"],
    });
  }
  if (data.ageDivision !== "Open" && AGE_DIVISIONS.includes(data.ageDivision) && data.ageDivision !== "Open" && !data.ageSpecificClass) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Age-Specific Class is required for U-Age Divisions.",
      path: ["ageSpecificClass"],
    });
  }
});

type FixtureFormData = z.infer<typeof fixtureFormSchema>;

const initialDefaultValues: FixtureFormData = {
  matchType: 'T20',
  overs: 20,
  ageDivision: 'Open',
  openClass: undefined,
  ageSpecificClass: undefined,
  homeTeamSchoolId: '',
  homeTeamId: '',
  awayTeamId: '',
  scheduledDate: new Date(),
  time: '',
  venueId: '',
  umpireIds: [],
  scorerId: 'no-scorer',
  leagueId: '',
  provinceId: '',
};


export default function CreateFixturePage() {
  const [availableHomeTeams, setAvailableHomeTeams] = useState<TeamData[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [filteredAwayTeams, setFilteredAwayTeams] = useState<TeamData[]>(allTeams);
  const [currentScorers] = useState<ScorerProfile[]>(allScorersData);
  const [currentUmpires] = useState<UmpireProfile[]>(allUmpiresData);
  const [currentDivisions] = useState<Division[]>(allDivisionsData); // Using imported divisions data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: initialDefaultValues,
  });

  const watchHomeTeamSchoolId = form.watch('homeTeamSchoolId');
  const watchHomeTeamId = form.watch('homeTeamId');
  const watchMatchType = form.watch('matchType');
  const watchAgeDivision = form.watch('ageDivision');
  // const watchOpenClass = form.watch('openClass'); // Not directly used in useEffects currently
  // const watchAgeSpecificClass = form.watch('ageSpecificClass'); // Not directly used in useEffects currently

  useEffect(() => {
    if (watchAgeDivision === "Open") {
      form.setValue('ageSpecificClass', undefined);
      form.trigger('ageSpecificClass'); // Trigger validation for conditional field
    } else {
      form.setValue('openClass', undefined);
      form.trigger('openClass'); // Trigger validation for conditional field
    }
  }, [watchAgeDivision, form]);

  useEffect(() => {
    if (watchHomeTeamSchoolId) {
      const selectedSchool = allSchools.find(s => String(s.id) === watchHomeTeamSchoolId);
      if (selectedSchool) {
        const schoolTeams = allTeams.filter(team => String(team.schoolId) === String(selectedSchool.id));
        setAvailableHomeTeams(schoolTeams);
        setAvailableFields(selectedSchool.fields?.filter(f => f && f.trim() !== '') || []);
      } else {
        setAvailableHomeTeams([]);
        setAvailableFields([]);
      }
      form.setValue('homeTeamId', '');
      form.setValue('venueId', '');
      form.setValue('awayTeamId', '');
    } else {
      setAvailableHomeTeams([]);
      setAvailableFields([]);
      form.setValue('homeTeamId', '');
      form.setValue('venueId', '');
      form.setValue('awayTeamId', '');
    }
  }, [watchHomeTeamSchoolId, form]);

  useEffect(() => {
    if (watchHomeTeamId) {
      const selectedTeam = allTeams.find(team => team.id === watchHomeTeamId);
      if (selectedTeam && selectedTeam.ageGroup && AGE_DIVISIONS.includes(selectedTeam.ageGroup as typeof AGE_DIVISIONS[number])) {
        form.setValue('ageDivision', selectedTeam.ageGroup as typeof AGE_DIVISIONS[number]);
      } else {
         form.setValue('ageDivision', initialDefaultValues.ageDivision);
      }
    } else {
      form.setValue('ageDivision', initialDefaultValues.ageDivision);
    }
     form.setValue('awayTeamId', '');
  }, [watchHomeTeamId, form, initialDefaultValues.ageDivision]);

   useEffect(() => {
    if (watchAgeDivision) {
      setFilteredAwayTeams(allTeams.filter(team =>
        team.id !== watchHomeTeamId &&
        team.ageGroup === watchAgeDivision
      ));
    } else {
      setFilteredAwayTeams(allTeams.filter(team => team.id !== watchHomeTeamId));
    }
    form.setValue('awayTeamId', '');
  }, [watchAgeDivision, watchHomeTeamId, form]);


  useEffect(() => {
    if (watchMatchType === 'T20') {
      form.setValue('overs', 20);
    } else if (watchMatchType === 'ODI') {
      form.setValue('overs', 50);
    } else { // Test Match
      form.setValue('overs', undefined); // Or a suitable default like 90
    }
  }, [watchMatchType, form]);


  const onSubmit = async (data: FixtureFormData) => {
    setIsSubmitting(true);
    try {
      const scheduledTimestamp = Timestamp.fromDate(data.scheduledDate);
      
      const newFixtureData = {
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        matchType: data.matchType,
        venueId: data.venueId,
        scheduledDate: scheduledTimestamp,
        time: data.time,
        overs: data.overs,
        ageDivision: data.ageDivision,
        openClass: data.ageDivision === "Open" ? data.openClass : null,
        ageSpecificClass: data.ageDivision !== "Open" ? data.ageSpecificClass : null,
        status: 'Scheduled' as 'Scheduled' | 'Team Confirmed' | 'Ground Ready' | 'Live' | 'Completed',
        umpireIds: data.umpireIds || [],
        scorerId: data.scorerId === 'no-scorer' || !data.scorerId ? null : data.scorerId,
        leagueId: data.leagueId || null,
        provinceId: data.provinceId || null,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'fixtures'), newFixtureData);
      toast({
        title: "Fixture Created!",
        description: `Fixture ID: ${docRef.id} has been scheduled.`,
      });
      form.reset(initialDefaultValues);
      setAvailableHomeTeams([]);
      setAvailableFields([]);
      setFilteredAwayTeams(allTeams);

    } catch (error: any) {
      console.error('Error creating fixture:', error);
      if (error.code === 'permission-denied') {
        toast({
          title: "Scheduling Conflict",
          description: "Could not create fixture. This may be due to a team, venue, scorer, or umpire already being booked for this date and time. Please check your selections and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create fixture. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Fixture</CardTitle>
        <CardDescription>Schedule a new cricket match. Fields marked with an asterisk (*) are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Match Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="matchType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Match Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select match type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="T20">T20</SelectItem>
                            <SelectItem value="ODI">ODI</SelectItem>
                            <SelectItem value="Test">Test Match</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="overs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overs {watchMatchType !== 'Test' ? '*' : '(Optional)'}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                          readOnly={watchMatchType === 'T20' || watchMatchType === 'ODI'}
                          className={ (watchMatchType === 'T20' || watchMatchType === 'ODI') ? "bg-muted/50" : ""}
                          placeholder={watchMatchType === 'Test' ? "e.g., 90" : "Enter overs"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ageDivision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Division *</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age division" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {AGE_DIVISIONS.map((ag) => (
                              <SelectItem key={ag} value={ag}>
                                {ag}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchAgeDivision === "Open" ? (
                  <FormField
                    control={form.control}
                    name="openClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Class *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select open class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {OPEN_CLASSES.map((oc) => (
                                <SelectItem key={oc} value={oc}>
                                  {oc}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : AGE_DIVISIONS.includes(watchAgeDivision) && watchAgeDivision !== "Open" ? (
                   <FormField
                    control={form.control}
                    name="ageSpecificClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age-Specific Class *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age-specific class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {AGE_SPECIFIC_CLASSES.map((asc) => (
                                <SelectItem key={asc} value={asc}>
                                  {asc}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                   <div className="text-sm text-muted-foreground h-10 flex items-center pt-7">Select Age Division first</div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Team Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="homeTeamSchoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home School *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select home school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                          {allSchools.map((school) => (
                            <SelectItem key={String(school.id)} value={String(school.id)}>
                              {school.name}
                            </SelectItem>
                          ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeTeamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Team *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchHomeTeamSchoolId || availableHomeTeams.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={!watchHomeTeamSchoolId ? "Select school first" : availableHomeTeams.length === 0 ? "No teams for school" : "Select home team"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                          {availableHomeTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.teamName} ({team.ageGroup} {team.division})
                            </SelectItem>
                          ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormDescription>Teams filtered by school. Update team-data.ts for correct IDs.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="awayTeamId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Away Team *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchAgeDivision || filteredAwayTeams.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={!watchAgeDivision ? "Select classification first" : filteredAwayTeams.length === 0 ? "No eligible away teams" : "Select away team"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                          {filteredAwayTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.teamName} ({team.affiliation} - {team.ageGroup} {team.division})
                            </SelectItem>
                          ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                       <FormDescription>Away teams filtered by Age Division.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Scheduling & Venue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onChange={(date: Date | null) => field.onChange(date)}
                          dateFormat="yyyy/MM/dd"
                          minDate={new Date()}
                          className="w-full border rounded-md px-3 py-2 text-sm h-10"
                          placeholderText="Select fixture date"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venueId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Location/Field *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchHomeTeamSchoolId || availableFields.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={!watchHomeTeamSchoolId ? "Select home school first" : availableFields.length === 0 ? "No fields for school" : "Select field/venue"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                          {availableFields.filter(fld => fld && fld.trim() !== '').map((fld) => (
                            <SelectItem key={fld} value={fld}>
                              {fld}
                            </SelectItem>
                          ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormDescription>Fields populated from selected Home School.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Officials & Other Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="umpireIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Umpires (Optional)</FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full justify-start font-normal">
                              <Users className="mr-2 h-4 w-4" />
                              {field.value && field.value.length > 0 
                                ? `${field.value.length} umpire(s) selected` 
                                : "Select umpires"}
                            </Button>
                          </FormControl>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                          <DropdownMenuLabelComponent>Available Umpires</DropdownMenuLabelComponent>
                          <DropdownMenuSeparator />
                          {currentUmpires.map((umpire) => (
                            <DropdownMenuCheckboxItem
                              key={umpire.id}
                              checked={field.value?.includes(umpire.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), umpire.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (id) => id !== umpire.id
                                      )
                                    );
                              }}
                            >
                              {umpire.name} ({umpire.umpiringLevel})
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <FormDescription>Select one or more umpires.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scorerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scorer (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || 'no-scorer'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scorer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="no-scorer">None</SelectItem>
                            {currentScorers.map((scorer) => (
                              <SelectItem key={scorer.id} value={scorer.id}>
                                {scorer.name} ({scorer.certificationLevel})
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormDescription>Select an assigned scorer.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="leagueId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>League ID (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} placeholder="Enter League ID if applicable" />
                      </FormControl>
                      <FormDescription>For future league management.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provinceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province ID (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} placeholder="Enter Province ID if applicable" />
                      </FormControl>
                      <FormDescription>For future provincial organization.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isSubmitting || !form.formState.isValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Fixture'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
    
