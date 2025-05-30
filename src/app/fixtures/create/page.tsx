
// Example: src/app/fixtures/create/page.tsx
"use client";

import * as React from 'react';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { schoolsData as allSchools, SchoolProfile as School } from '@/lib/schools-data';
import { detailedTeamsData as allTeams, Team as TeamData } from '@/lib/team-data';

// --- Type Definitions ---
interface FixtureFormData {
  homeTeamId: string;
  awayTeamId: string;
  date: Date | null;
  time: string;
  location: string;
  matchType: string;
  overs: number | undefined;
  umpires: string;
  homeTeamSchoolId: string;
  awayTeamSchoolId?: string;
  ageGroup?: string;
  division?: string;
}

// All fields are optional strings as they represent error messages
interface FormValidationErrors {
  homeTeamId?: string;
  awayTeamId?: string;
  date?: string;
  time?: string;
  location?: string;
  matchType?: string;
  overs?: string;
  umpires?: string;
  homeTeamSchoolId?: string;
  awayTeamSchoolId?: string;
  ageGroup?: string;
  division?: string;
  submit?: string; // For general submission errors
}
// --- End Type Definitions ---

export default function CreateFixturePage() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredAwayTeams, setFilteredAwayTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FixtureFormData>({
    homeTeamId: '',
    awayTeamId: '',
    date: null,
    time: '',
    location: '',
    matchType: '',
    overs: undefined,
    umpires: '',
    homeTeamSchoolId: '',
    awayTeamSchoolId: '', // Initialize optional fields for controlled components
    ageGroup: '',
    division: '',
  });
  // Initialize errors as an empty object, aligning with FormValidationErrors
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Data is imported, no need to fetch from Firestore initially
    setTeams(allTeams);
    setSchools(allSchools);
    setLoading(false);
  }, []);

  useEffect(() => {
    let potentialAwayTeams: TeamData[] = [];
    if (formData.homeTeamSchoolId) {
      const homeSchoolSelected = formData.homeTeamSchoolId;
      const homeSchoolTeams = teams.filter((team: TeamData) => team.affiliation === homeSchoolSelected);
      const otherSchoolTeams = teams.filter((team: TeamData) => team.affiliation?.toString() !== homeSchoolSelected);
      potentialAwayTeams = [...homeSchoolTeams, ...otherSchoolTeams];
    } else {
      potentialAwayTeams = [...teams]; // Use all teams if no home school selected
    }

    // Always filter out the selected home team, if any
    if (formData.homeTeamId) {
      setFilteredAwayTeams(potentialAwayTeams.filter((team: TeamData) => team.id.toString() !== formData.homeTeamId));
    } else {
      setFilteredAwayTeams(potentialAwayTeams);
    }
  }, [formData.homeTeamSchoolId, formData.homeTeamId, teams]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  };

  const handleSelectChange = (name: keyof FixtureFormData, value: string) => {
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  };

  const handleOversChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prevFormData => ({ ...prevFormData, overs: value === '' ? undefined : Number(value) }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prevFormData => ({ ...prevFormData, date }));
  };

  const validateForm = (data: FixtureFormData): FormValidationErrors => {
    const currentErrors: FormValidationErrors = {};
    if (!data.homeTeamId) currentErrors.homeTeamId = 'Home team is required';
    if (!data.awayTeamId) currentErrors.awayTeamId = 'Away team is required';
    if (data.homeTeamId && data.awayTeamId && data.homeTeamId === data.awayTeamId) {
      currentErrors.awayTeamId = 'Home and away teams cannot be the same';
    }
    if (!data.date) currentErrors.date = 'Date is required';
    if (!data.time) currentErrors.time = 'Time is required';
    if (!data.matchType) currentErrors.matchType = 'Match type is required';
    // Validate overs only if a value is entered
    if (data.overs !== undefined && (isNaN(data.overs) || data.overs <= 0)) {
        currentErrors.overs = 'Overs must be a positive number';
    }
    return currentErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Reset errors to an empty object

    try {
      const fixtureDate = formData.date ? Timestamp.fromDate(new Date(formData.date)) : null;

      const newFixtureData: any = { // Use 'any' temporarily or create a specific type for Firestore
        ...formData,
        date: fixtureDate,
        overs: formData.overs === undefined ? null : formData.overs, // Store undefined overs as null
        createdAt: Timestamp.now(),
      };

      // Optionally remove undefined fields before sending to Firestore
      Object.keys(newFixtureData).forEach(key => {
        if (newFixtureData[key] === undefined) {
          delete newFixtureData[key];
        }
      });

      const docRef = await addDoc(collection(db, 'fixtures'), newFixtureData);
      console.log('Fixture created with ID:', docRef.id);

      setFormData({
        homeTeamId: '',
        awayTeamId: '',
        date: null,
        time: '',
        location: '',
        matchType: '',
        overs: undefined,
        umpires: '',
        homeTeamSchoolId: '',
        awayTeamSchoolId: '',
        ageGroup: '',
        division: '',
      });
      // Optionally, show a success notification
    } catch (error) {
      console.error('Error creating fixture:', error);
      // Ensure this aligns with FormValidationErrors
      setErrors({ submit: 'Failed to create fixture. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Create New Fixture</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4"> {/* Increased gap */}

            {/* Home Team School Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="homeTeamSchoolId" className="text-right">
                Home School
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('homeTeamSchoolId', value)}
                value={formData.homeTeamSchoolId}
              >
                <SelectTrigger className="col-span-3" id="homeTeamSchoolId">
                  <SelectValue placeholder="Select home team school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {schools.map((school) => (
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
                Home Team
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('homeTeamId', value)}
                value={formData.homeTeamId}
                disabled={!formData.homeTeamSchoolId && teams.some(t => !t.affiliation)} // Example: enable if no school needed or school selected
              >
                <SelectTrigger className="col-span-3" id="homeTeamId">
                  <SelectValue placeholder="Select home team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(formData.homeTeamSchoolId
                      ? teams.filter(team => team.affiliation === formData.homeTeamSchoolId)
                      : teams
                    ).map((team) => (
                      <SelectItem key={team.id.toString()} value={team.id.toString()}>
                        {team.teamName} ({schools.find(s => s.id.toString() === team.affiliation)?.name || 'Independent'})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.homeTeamId && <p className="text-red-500 text-sm col-span-4 text-right">{errors.homeTeamId}</p>}
            </div>

            {/* Away Team Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="awayTeamId" className="text-right">
                Away Team
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('awayTeamId', value)}
                value={formData.awayTeamId}
                disabled={!formData.homeTeamId}
              >
                <SelectTrigger className="col-span-3" id="awayTeamId">
                  <SelectValue placeholder="Select away team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Away Teams</SelectLabel>
                    {filteredAwayTeams.map((team) => (
                      <SelectItem key={team.id.toString()} value={team.id.toString()}>{team.teamName} ({schools.find(s => s.name === team.affiliation)?.name || 'Independent'})</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.awayTeamId && <p className="text-red-500 text-sm col-span-4 text-right">{errors.awayTeamId}</p>}
            </div>

            {/* Date Picker */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
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
                Time
              </Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} className="col-span-3" />
              {errors.time && <p className="text-red-500 text-sm col-span-4 text-right">{errors.time}</p>}
            </div>

            {/* Match Type Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="matchType" className="text-right">
                Match Type
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('matchType', value)}
                value={formData.matchType}
              >
                <SelectTrigger className="col-span-3" id="matchType">
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="League">League</SelectItem>
                    <SelectItem value="Tournament">Tournament</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.matchType && <p className="text-red-500 text-sm col-span-4 text-right">{errors.matchType}</p>}
            </div>

            {/* Overs Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="overs" className="text-right">
                Overs (Optional)
              </Label>
              <Input
                id="overs"
                name="overs"
                type="number"
                value={formData.overs === undefined ? '' : formData.overs} // Handle undefined for input value
                onChange={handleOversChange}
                className="col-span-3"
                placeholder="Enter number of overs"
                min="1"
              />
              {errors.overs && <p className="text-red-500 text-sm col-span-4 text-right">{errors.overs}</p>}
            </div>

            {/* Age Group Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ageGroup" className="text-right">
                Age Group (Optional)
              </Label>
              <Input id="ageGroup" name="ageGroup" value={formData.ageGroup || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., U14, U16, Open" />
              {errors.ageGroup && <p className="text-red-500 text-sm col-span-4 text-right">{errors.ageGroup}</p>}
            </div>

             {/* Division Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="division" className="text-right">
                Division (Optional)
              </Label>
              <Input id="division" name="division" value={formData.division || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., Division 1, Plate" />
              {errors.division && <p className="text-red-500 text-sm col-span-4 text-right">{errors.division}</p>}
            </div>


            {/* Away Team School Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="awayTeamSchoolId" className="text-right">
                Away School (Opt.)
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('awayTeamSchoolId', value)}
                value={formData.awayTeamSchoolId}
              >
                <SelectTrigger className="col-span-3" id="awayTeamSchoolId">
                  <SelectValue placeholder="Select away team school (if different)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">N/A or Same School</SelectItem> {/* Option for no specific other school */}
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.awayTeamSchoolId && <p className="text-red-500 text-sm col-span-4 text-right">{errors.awayTeamSchoolId}</p>}
            </div>


            {/* Location Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} className="col-span-3" placeholder="Enter venue or location" />
              {errors.location && <p className="text-red-500 text-sm col-span-4 text-right">{errors.location}</p>}
            </div>

            {/* Umpires Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="umpires" className="text-right">
                Umpires (Optional)
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
