"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { 
  createTeamAction, 
  getCoachesBySchoolAction, 
  checkDuplicateTeamAction,
  TeamActionState 
} from "@/app/actions/teamActions";
import { getTeamCreationContextAction, TeamCreationContext } from "@/app/actions/analyticsActions";
import { School, Division, Season, Person, AgeGroup } from "@/types/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/Badge";
import { 
  Loader2, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  School as SchoolIcon, 
  Calendar, 
  Users, 
  Trophy,
  Wand2,
  AlertCircle,
  History,
  BarChart3,
  Lightbulb,
  ShieldAlert,
  Palette
} from "lucide-react";
import { CoachMultiSelect } from "./CoachMultiSelect";
import { TeamPreviewCard } from "./TeamPreviewCard";
import { usePermissionView } from "@/contexts/PermissionViewContext";
import { 
  generateTeamNames, 
  getSmartSuffixSuggestions, 
  detectNamingPattern, 
  GeneratedName 
} from "@/lib/utils/TeamNameGenerator";

interface SmartTeamCreatorProps {
  schools: School[];
  divisions: Division[];
  activeSeason: Season | null;
}

const COLOR_PRESETS = [
  { name: "School Default", primary: "inherit", secondary: "inherit" },
  { name: "Navy & Gold", primary: "#1e3a5f", secondary: "#d4af37" },
  { name: "Maroon & White", primary: "#800000", secondary: "#ffffff" },
  { name: "Green & Gold", primary: "#006400", secondary: "#ffd700" },
  { name: "Black & Red", primary: "#1a1a1a", secondary: "#dc2626" },
  { name: "Royal Blue & Silver", primary: "#4169e1", secondary: "#c0c0c0" },
  { name: "Purple & Gold", primary: "#6b21a8", secondary: "#d4af37" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Team...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Create Team
        </>
      )}
    </Button>
  );
}

export function SmartTeamCreator({ schools, divisions, activeSeason }: SmartTeamCreatorProps) {
  const { currentRole } = usePermissionView();
  const ALLOWED_ROLES = [
    "System Architect",
    "Admin",
    "Sportsmaster",
    "School Admin",
    "Coach",
    "Assistant Coach",
    "Team Manager"
  ];

  const isAllowed = ALLOWED_ROLES.includes(currentRole);



  // Form State
  const initialState: TeamActionState = {};
  const [state, action] = useFormState(createTeamAction, initialState);
  
  // Wizard State
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [abbreviatedName, setAbbreviatedName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  
  // Team Colors State
  const [useSchoolColors, setUseSchoolColors] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#1e3a5f");
  const [secondaryColor, setSecondaryColor] = useState("#d4af37");
  
  // Data State
  const [schoolCoaches, setSchoolCoaches] = useState<Person[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [suggestedSuffix, setSuggestedSuffix] = useState<string | null>(null);
  
  // Context Data State
  const [contextData, setContextData] = useState<TeamCreationContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  // Derived State
  const selectedSchool = useMemo(() => 
    schools.find(s => s.id === selectedSchoolId), 
    [schools, selectedSchoolId]
  );

  const selectedDivision = useMemo(() => 
    divisions.find(d => d.id === selectedDivisionId), 
    [divisions, selectedDivisionId]
  );

  const selectedCoaches = useMemo(() => 
    schoolCoaches.filter(c => selectedCoachIds.includes(c.id)),
    [schoolCoaches, selectedCoachIds]
  );

  // Filter divisions by school (if school has divisionId) or show all relevant
  const filteredDivisions = divisions; 

  // 1. Load coaches when school changes
  useEffect(() => {
    if (selectedSchoolId) {
      setLoadingCoaches(true);
      getCoachesBySchoolAction(selectedSchoolId)
        .then(setSchoolCoaches)
        .catch(console.error)
        .finally(() => setLoadingCoaches(false));
    } else {
      setSchoolCoaches([]);
    }
  }, [selectedSchoolId]);

  // 2. Load Context Data (History, Player Depth) when School & Division selected
  useEffect(() => {
    if (selectedSchoolId && selectedDivisionId) {
      setLoadingContext(true);
      getTeamCreationContextAction(selectedSchoolId, selectedDivisionId)
        .then(setContextData)
        .catch(console.error)
        .finally(() => setLoadingContext(false));
    }
  }, [selectedSchoolId, selectedDivisionId]);

  // 3. Auto-generate names when key fields change
  useEffect(() => {
    if (selectedSchool && selectedDivision && selectedDivision.ageGroup && suffix) {
      const suggestions = generateTeamNames({
        schoolName: selectedSchool.name,
        schoolAbbreviation: selectedSchool.abbreviation,
        ageGroup: selectedDivision.ageGroup,
        suffix: suffix,
        nickname: nickname
      });
      setGeneratedNames(suggestions);
      
      // Auto-select abbreviated name if current name is empty
      if (!teamName) {
        const best = suggestions.find(n => n.format === 'abbreviated') || suggestions[0];
        if (best) setTeamName(best.name);
      }

      // Auto-set abbreviation if empty
      if (!abbreviatedName && selectedSchool.abbreviation) {
        setAbbreviatedName(`${selectedSchool.abbreviation} ${selectedDivision.ageGroup}${suffix}`);
      }
    }
  }, [selectedSchool, selectedDivision, suffix, nickname, teamName, abbreviatedName]);

  // 4. Check for duplicates
  useEffect(() => {
    if (selectedSchoolId && selectedDivision && selectedDivision.ageGroup && suffix) {
      const checkDuplicate = async () => {
        const result = await checkDuplicateTeamAction(
          selectedSchoolId,
          selectedDivision.ageGroup,
          suffix
        );

        if (result.exists) {
          setDuplicateWarning(`A team with suffix "${suffix}" already exists.`);
          setSuggestedSuffix(result.suggestedSuffix || null);
        } else {
          setDuplicateWarning(null);
          setSuggestedSuffix(null);
        }
      };
      
      const timer = setTimeout(checkDuplicate, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedSchoolId, selectedDivision, suffix]);

  // Smart Suffix Suggestions Logic
  const suffixSuggestions = useMemo(() => {
    if (!selectedDivision || !contextData) return [];
    
    const existingSuffixes = contextData.historicalTeams
      .map(t => t.suffix)
      .filter(Boolean) as string[];
      
    const pattern = detectNamingPattern(contextData.historicalTeams);
    
    return getSmartSuffixSuggestions(
      selectedDivision.ageGroup, 
      existingSuffixes, 
      pattern
    );
  }, [selectedDivision, contextData]);

  // Coach Workload Warnings
  const coachWarnings = useMemo(() => {
    if (!contextData) return [];
    return selectedCoachIds.map(id => {
      const workload = contextData.coachWorkload[id];
      if (workload && workload.teamCount > 0) {
        const coachName = schoolCoaches.find(c => c.id === id)?.lastName || 'Coach';
        return `${coachName} is already assigned to ${workload.teamCount} team(s): ${workload.teams.join(', ')}`;
      }
      return null;
    }).filter(Boolean) as string[];
  }, [selectedCoachIds, contextData, schoolCoaches]);

  if (!isAllowed) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
        <CardContent className="pt-6 text-center">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-bold mb-2 text-red-700 dark:text-red-400">Access Denied</h3>
          <p className="text-red-600 dark:text-red-300">You do not have permission to create teams.</p>
          <Badge variant="outline" className="mt-4 border-red-200 text-red-700">
            Current Role: {currentRole}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN - WIZARD FORM */}
      <div className="lg:col-span-2 space-y-6">
        <form action={action} className="space-y-8">
          {/* Hidden Inputs for Server Action */}
          <input type="hidden" name="coachIds" value={selectedCoachIds.join(',')} />
          
          {/* Step 1: School & Season */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <SchoolIcon className="h-5 w-5 text-primary" />
                1. School & Context
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School *</Label>
                  <Select 
                    name="schoolId" 
                    required 
                    value={selectedSchoolId} 
                    onValueChange={setSelectedSchoolId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select School" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map(school => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Active Season</Label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {activeSeason ? activeSeason.name : "No active season"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Division & Identity */}
          <Card className={!selectedSchoolId ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-primary" />
                2. Division & Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Division / Age Group *</Label>
                  <Select 
                    name="divisionId" 
                    required
                    value={selectedDivisionId}
                    onValueChange={setSelectedDivisionId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDivisions.map(div => (
                        <SelectItem key={div.id} value={div.id}>
                          {div.name} ({div.ageGroup})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Suffix *</Label>
                  <div className="flex gap-2">
                    <Input 
                      name="suffix"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      placeholder="e.g. A, B, 1st XI"
                      className={duplicateWarning ? "border-destructive" : ""}
                      required
                    />
                  </div>
                  
                  {/* Smart Suffix Suggestions */}
                  {selectedDivision && (
                    <div className="space-y-2 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {suffixSuggestions.slice(0, 5).map(({ suffix: s, status }) => (
                          <Badge 
                            key={s} 
                            variant={status === 'recommended' ? 'default' : status === 'taken' ? 'secondary' : 'outline'}
                            className={`cursor-pointer ${status === 'taken' ? 'opacity-50 line-through' : 'hover:bg-primary/90'}`}
                            onClick={() => status !== 'taken' && setSuffix(s)}
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended based on school patterns.
                      </p>
                    </div>
                  )}

                  {duplicateWarning && (
                    <div className="text-sm text-destructive flex items-center gap-2 mt-1">
                      <AlertTriangle className="h-4 w-4" />
                      {duplicateWarning}
                      {suggestedSuffix && (
                        <span 
                          className="underline cursor-pointer font-medium"
                          onClick={() => setSuffix(suggestedSuffix)}
                        >
                          Use &quot;{suggestedSuffix}&quot; instead?
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Name Generator */}
              {generatedNames.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Team Name Suggestions
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {generatedNames.map((gn) => (
                      <div 
                        key={gn.name}
                        className={`p-3 rounded-md border cursor-pointer transition-colors flex justify-between items-center ${
                          teamName === gn.name 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setTeamName(gn.name)}
                      >
                        <span className="font-medium">{gn.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {gn.format}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Final Team Name *</Label>
                <Input 
                  name="name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Westville U13A"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Staffing */}
          <Card className={!selectedSchoolId ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                3. Coaching Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Assign Coaches</Label>
                  <CoachMultiSelect 
                    coaches={schoolCoaches}
                    selectedIds={selectedCoachIds}
                    onSelectionChange={setSelectedCoachIds}
                    loading={loadingCoaches}
                    placeholder={schoolCoaches.length === 0 ? "No coaches found for this school" : "Select coaches..."}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only showing coaches assigned to {selectedSchool?.name || 'selected school'}.
                  </p>
                </div>
                
                {/* Coach Workload Warnings */}
                {coachWarnings.length > 0 && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {coachWarnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Metadata (Optional) */}
          <Card className={!selectedSchoolId ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                4. Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Abbreviation</Label>
                <Input 
                  name="abbreviatedName"
                  value={abbreviatedName}
                  onChange={(e) => setAbbreviatedName(e.target.value)}
                  placeholder="e.g. WBHS U13A"
                />
              </div>
              <div className="space-y-2">
                <Label>Nickname</Label>
                <Input 
                  name="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. The Griffins"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Team Branding */}
          <Card className={!selectedSchoolId ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                5. Team Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Presets */}
              <div className="space-y-2">
                <Label>Quick Color Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        if (preset.name === "School Default") {
                          setUseSchoolColors(true);
                        } else {
                          setUseSchoolColors(false);
                          setPrimaryColor(preset.primary);
                          setSecondaryColor(preset.secondary);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                        (preset.name === "School Default" && useSchoolColors) ||
                        (!useSchoolColors && preset.primary === primaryColor && preset.secondary === secondaryColor)
                          ? "border-primary bg-primary/10 font-medium"
                          : "hover:border-muted-foreground/50"
                      }`}
                    >
                      {preset.name !== "School Default" && (
                        <div className="flex">
                          <div className="w-4 h-4 rounded-l border" style={{ backgroundColor: preset.primary }} />
                          <div className="w-4 h-4 rounded-r border-t border-b border-r" style={{ backgroundColor: preset.secondary }} />
                        </div>
                      )}
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              {!useSchoolColors && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/10 rounded-lg border">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      />
                      <Input
                        name="primaryColor"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#1e3a5f"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      />
                      <Input
                        name="secondaryColor"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        placeholder="#d4af37"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {useSchoolColors && selectedSchool?.brandColors && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Using {selectedSchool.name}&apos;s brand colors.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Errors & Submit */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN - LIVE PREVIEW & INSIGHTS */}
      <div className="lg:col-span-1 space-y-6">
        {/* Live Preview */}
        <div className="space-y-4">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-sm">
            Live Preview
          </h3>
          <TeamPreviewCard 
            teamName={teamName}
            schoolName={selectedSchool?.name}
            divisionName={selectedDivision?.name}
            ageGroup={selectedDivision?.ageGroup}
            suffix={suffix}
            seasonName={activeSeason?.name}
            coaches={selectedCoaches.map(c => ({
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              role: c.role
            }))}
            nickname={nickname}
            abbreviation={abbreviatedName}
            schoolColors={useSchoolColors ? selectedSchool?.brandColors : undefined}
            teamColors={!useSchoolColors ? { primary: primaryColor, secondary: secondaryColor } : undefined}
          />
        </div>

        {/* Player Depth Insight */}
        {contextData && (
          <div className="space-y-4">
            <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Player Depth
            </h3>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Eligible</span>
                  <Badge variant="secondary">{contextData.playerDepth.totalEligible}</Badge>
                </div>
                <div className="space-y-1">
                  {Object.entries(contextData.playerDepth.byRole).map(([role, count]) => (
                    <div key={role} className="flex justify-between text-sm text-muted-foreground">
                      <span>{role}s</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
                {contextData.playerDepth.totalEligible < 11 && (
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      Low player count. Consider merging squads.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Historical Context */}
        {contextData && contextData.historicalTeams.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-sm flex items-center gap-2">
              <History className="h-4 w-4" />
              Existing Teams
            </h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {contextData.historicalTeams.map(team => (
                    <div key={team.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{team.name}</span>
                      <Badge variant="outline" className="text-xs">{team.suffix}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
