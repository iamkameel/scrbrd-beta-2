
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Loader2, PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Fixture } from "@/lib/fixtures-data"; // Import Fixture type

const fixtureStatuses = ["Scheduled", "Upcoming", "Live", "Completed", "Match Abandoned", "Rain-Delay", "Play Suspended"] as const;

const fixtureFormSchema = z.object({
  teamA: z.string().min(1, "Team A is required"),
  teamB: z.string().min(1, "Team B is required"),
  date: z.date({ required_error: "Date is required." }),
  time: z.string().min(1, "Time is required").regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  location: z.string().min(1, "Location is required"),
  status: z.enum(fixtureStatuses, { required_error: "Status is required." }),
  umpires: z.string().optional(),
  scorers: z.string().optional(),
});

type FixtureFormValues = z.infer<typeof fixtureFormSchema>;

export default function CreateFixturePage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<FixtureFormValues>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      teamA: "",
      teamB: "",
      time: "",
      location: "",
      umpires: "",
      scorers: "",
      // date and status will be handled by their respective components' onValueChange
    },
  });

  async function onSubmit(data: FixtureFormValues) {
    setIsLoading(true);
    console.log("Fixture data submitted:", data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you would send this data to your backend
    // For now, we just log it and show a success toast.
    toast({
      title: "Fixture Created (Simulated)",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    form.reset(); 
    // Reset date field specifically if it's not covered by form.reset() for controlled components
    form.setValue('date', undefined as any); // or null, depending on how your date picker clears
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-[hsl(var(--primary))]" />
            Create New Fixture
          </CardTitle>
          <CardDescription>
            Fill in the details below to add a new match fixture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="teamA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team A</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Northwood School 1st XI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team B</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Panthers Academy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setDate(new Date().getDate() -1)) // Disable past dates
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="HH:MM" {...field} />
                      </FormControl>
                       <FormDescription>Use HH:MM format (e.g., 09:30 or 14:00).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location / Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Northwood Main Oval" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select match status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fixtureStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="umpires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Umpires (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter umpire names, separated by commas (e.g., Mr. A Smith, Ms. B Jones)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scorers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scorers (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter scorer names, separated by commas (e.g., Mr. C Davis (Team A), Ms. D Wilson (Team B))"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Create Fixture
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
