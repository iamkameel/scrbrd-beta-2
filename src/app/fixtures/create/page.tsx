
// Example: src/app/fixtures/create/page.tsx
"use client";

import * as React from 'react';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { schoolsData as allSchools, type SchoolProfile as School } from '@/lib/schools-data';
import { detailedTeamsData as allTeams, type Team as TeamData } from '@/lib/team-data';
import { useToast } from "@/hooks/use-toast";

// --- Type Definitions ---
interface FixtureFormData {
  matchType: 'T20' | ''; // Default to T20
  overs: number | undefined;
  homeTeamSchoolId: string; // School ID
  homeTeamId: string; // Team ID
  ageGroup: string; // Auto-filled
  awayTeamId: string;
  date: Date | null;
  time: string;
  selectedField: string; // Selected field from home school's fields
  division?: string;
  umpires: string;
}

interface FormValidationErrors {
  matchType?: string;
  homeTeamSchoolId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  date?: string;
  time?: string;
  selectedField?: string;
  division?: string;
  umpires?: string;
  submit?: string;
}
// --- End Type Definitions ---

const initialFormData: FixtureFormData = {
  matchType: 'T20',
  overs: 20,
  homeTeamSchoolId: '',
  homeTeamId: '',
  ageGroup: '',
  awayTeamId: '',
  date: null,
  time: '',
  selectedField: '',
  division: '',
  umpires: '',
};

export default function CreateFixturePage() {
  const [formData, setFormData] = useState<FixtureFormData>(initialFormData);
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [availableHomeTeams, setAvailableHomeTeams] = useState<TeamData[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [filteredAwayTeams, setFilteredAwayTeams] = useState<TeamData[]>(allTeams);

  // Effect for when Home School changes
  useEffect(() => {
    if (formData.homeTeamSchoolId) {
      const selectedSchool = allSchools.find(s => s.id.toString() === formData.homeTeamSchoolId);
      if (selectedSchool) {
        setAvailableHomeTeams(allTeams.filter(team => team.affiliation === selectedSchool.name));
        setAvailableFields(selectedSchool.fields || []);
      } else {
        setAvailableHomeTeams([]);
        setAvailableFields([]);
      }
      // Reset dependent fields
      setFormData(prev => ({ ...prev, homeTeamId: '', ageGroup: '', selectedField: '' }));
    } else {
      setAvailableHomeTeams([]);
      setAvailableFields([]);
      setFormData(prev => ({ ...prev, homeTeamId: '', ageGroup: '', selectedField: '' }));
    }
  }, [formData.homeTeamSchoolId]);

  // Effect for when Home Team changes
  useEffect(() => {
    if (formData.homeTeamId) {
      const selectedTeam = allTeams.find(team => team.id.toString() === formData.homeTeamId);
      if (selectedTeam) {
        setFormData(prev => ({ ...prev, ageGroup: selectedTeam.ageGroup }));
      }
      setFilteredAwayTeams(allTeams.filter(team => team.id.toString() !== formData.homeTeamId));
    } else {
      setFormData(prev => ({ ...prev, ageGroup: '' }));
      setFilteredAwayTeams(allTeams);
    }
  }, [formData.homeTeamId]);

  // Effect for when Match Type changes (though it's fixed to T20 for now)
  useEffect(() => {
    if (formData.matchType === 'T20') {
      setFormData(prev => ({ ...prev, overs: 20 }));
    } else {
      setFormData(prev => ({ ...prev, overs: undefined })); // Or allow input
    }
  }, [formData.matchType]);


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FixtureFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // If changing home school, reset home team and related fields
    if (name === 'homeTeamSchoolId') {
        setFormData(prev => ({...prev, homeTeamId: '', ageGroup: '', selectedField: ''}));
    }
    // If changing home team, reset age group
    if (name === 'homeTeamId') {
        setFormData(prev => ({...prev, ageGroup: ''}));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const validateForm = (data: FixtureFormData): FormValidationErrors => {
    const currentErrors: FormValidationErrors = {};
    if (!data.matchType) currentErrors.matchType = 'Match type is required';
    if (!data.homeTeamSchoolId) currentErrors.homeTeamSchoolId = 'Home school is required';
    if (!data.homeTeamId) currentErrors.homeTeamId = 'Home team is required';
    if (!data.awayTeamId) currentErrors.awayTeamId = 'Away team is required';
    if (data.homeTeamId && data.homeTeamId === data.awayTeamId) {
      currentErrors.awayTeamId = 'Home and away teams cannot be the same';
    }
    if (!data.date) currentErrors.date = 'Date is required';
    if (!data.time) currentErrors.time = 'Time is required';
    if (!data.selectedField) currentErrors.selectedField = 'Location/Field is required';
    return currentErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const fixtureDate = formData.date ? Timestamp.fromDate(formData.date) : null;
      const homeTeamName = allTeams.find(t => t.id.toString() === formData.homeTeamId)?.teamName;
      const awayTeamName = allTeams.find(t => t.id.toString() === formData.awayTeamId)?.teamName;
      
      const newFixtureData = {
        matchType: formData.matchType,
        overs: formData.overs,
        homeTeamSchoolId: formData.homeTeamSchoolId, // Store ID
        homeTeamId: formData.homeTeamId, // Store ID
        homeTeamName: homeTeamName || 'N/A', // Store Name for display
        ageGroup: formData.ageGroup,
        awayTeamId: formData.awayTeamId, // Store ID
        awayTeamName: awayTeamName || 'N/A', // Store Name for display
        date: fixtureDate,
        time: formData.time,
        location: formData.selectedField, // Use selectedField as location
        division: formData.division || null,
        umpires: formData.umpires.split(',').map(s => s.trim()).filter(s => s), // Store as array
        status: 'Scheduled', // Default status for new fixtures
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'fixtures'), newFixtureData);
      toast({
        title: "Fixture Created!",
        description: `Fixture ID: ${docRef.id} has been scheduled.`,
      });
      setFormData(initialFormData); // Reset form
      setAvailableHomeTeams([]);
      setAvailableFields([]);
      setFilteredAwayTeams(allTeams);

    } catch (error) {
      console.error('Error creating fixture:', error);
      setErrors({ submit: 'Failed to create fixture. Please try again.' });
      toast({
        title: "Error",
        description: "Failed to create fixture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Create New Fixture</CardTitle>
        <CardDescription>Schedule a new cricket match. Fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">

            {/* Match Type Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="matchType" className="text-right">
                Match Type *
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('matchType', value as 'T20' | '')}
                value={formData.matchType}
              >
                <SelectTrigger className="col-span-3" id="matchType">
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="T20">T20 (20 Overs)</SelectItem>
                    {/* Add other types if needed later */}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.matchType && <p className="text-red-500 text-sm col-span-4 text-right">{errors.matchType}</p>}
            </div>

            {/* Overs Input (Read-only for T20) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="overs" className="text-right">
                Overs
              </Label>
              <Input
                id="overs"
                name="overs"
                type="number"
                value={formData.overs === undefined ? '' : formData.overs}
                readOnly={formData.matchType === 'T20'}
                className="col-span-3 bg-muted/50"
              />
            </div>

            {/* Home Team School Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="homeTeamSchoolId" className="text-right">
                Home School *
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('homeTeamSchoolId', value)}
                value={formData.homeTeamSchoolId}
              >
                <SelectTrigger className="col-span-3" id="homeTeamSchoolId">
                  <SelectValue placeholder="Select home school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {allSchools.map((school) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.homeTeamSchoolId && <p className="text-red-500 text-sm col-span-4 text-right">{errors.homeTeamSchoolId}</p>}
            </div>

            {/* Home Team Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="homeTeamId" className="text-right">
                Home Team *
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('homeTeamId', value)}
                value={formData.homeTeamId}
                disabled={!formData.homeTeamSchoolId || availableHomeTeams.length === 0}
              >
                <SelectTrigger className="col-span-3" id="homeTeamId">
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableHomeTeams.map((team) => (
                      <SelectItem key={team.id.toString()} value={team.id.toString()}>
                        {team.teamName} ({team.ageGroup})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.homeTeamId && <p className="text-red-500 text-sm col-span-4 text-right">{errors.homeTeamId}</p>}
            </div>

            {/* Age Group (Read-only, auto-populated) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ageGroup" className="text-right">
                Age Group
              </Label>
              <Input id="ageGroup" name="ageGroup" value={formData.ageGroup} readOnly className="col-span-3 bg-muted/50" />
            </div>
            
            {/* Away Team Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="awayTeamId" className="text-right">
                Away Team *
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('awayTeamId', value)}
                value={formData.awayTeamId}
                disabled={!formData.homeTeamId} // Enable once home team is selected
              >
                <SelectTrigger className="col-span-3" id="awayTeamId">
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {filteredAwayTeams.map((team) => (
                      <SelectItem key={team.id.toString()} value={team.id.toString()}>
                        {team.teamName} ({team.affiliation} - {team.ageGroup})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.awayTeamId && <p className="text-red-500 text-sm col-span-4 text-right">{errors.awayTeamId}</p>}
            </div>

            {/* Date Picker */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date *
              </Label>
              <div className="col-span-3">
                <DatePicker
                  id="date"
                  selected={formData.date}
                  onChange={handleDateChange}
                  dateFormat="yyyy/MM/dd"
                  minDate={new Date()}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholderText="Select fixture date"
                  autoComplete="off"
                />
              </div>
              {errors.date && <p className="text-red-500 text-sm col-span-4 text-right">{errors.date}</p>}
            </div>

            {/* Time Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time *
              </Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} className="col-span-3" />
              {errors.time && <p className="text-red-500 text-sm col-span-4 text-right">{errors.time}</p>}
            </div>

            {/* Location/Field Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="selectedField" className="text-right">
                Location/Field *
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('selectedField', value)}
                value={formData.selectedField}
                disabled={!formData.homeTeamSchoolId || availableFields.length === 0}
              >
                <SelectTrigger className="col-span-3" id="selectedField">
                  <SelectValue placeholder="Select field/venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.selectedField && <p className="text-red-500 text-sm col-span-4 text-right">{errors.selectedField}</p>}
            </div>

            {/* Division Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="division" className="text-right">
                Division (Opt.)
              </Label>
              <Input id="division" name="division" value={formData.division || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., Division 1, Plate" />
              {errors.division && <p className="text-red-500 text-sm col-span-4 text-right">{errors.division}</p>}
            </div>

            {/* Umpires Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="umpires" className="text-right">
                Umpires (Opt.)
              </Label>
              <Input id="umpires" name="umpires" value={formData.umpires} onChange={handleChange} className="col-span-3" placeholder="Enter umpire names (comma-separated)" />
              {errors.umpires && <p className="text-red-500 text-sm col-span-4 text-right">{errors.umpires}</p>}
            </div>

            {/* Submit Error Display */}
            {errors.submit && <p className="text-red-500 text-sm col-span-4 text-center py-2">{errors.submit}</p>}
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Fixture'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

