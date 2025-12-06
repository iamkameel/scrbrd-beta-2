"use client";

import { useState, useMemo, useOptimistic, useTransition } from "react";
import { fetchCollection } from "@/lib/firestore";
import { normalizePeople } from "@/lib/normalizePerson";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  User, Mail, Phone, Shield, School, Search, Filter, 
  Grid3x3, List, Plus, Trash2, Edit, MoreVertical,
  Download, Upload, X, BarChart3, Columns, Loader2
} from "lucide-react";
import { Person } from "@/types/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_ROLES, ROLE_GROUPS } from "@/lib/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deletePersonAction } from "@/app/actions/personActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PeopleClientProps {
  initialPeople: Person[];
  userRole?: string;
}

type ViewMode = 'grid' | 'list' | 'stats' | 'board';

type OptimisticAction = 
  | { type: "delete"; id: string }
  | { type: "update"; id: string; updates: Partial<Person> };

export default function PeopleClient({ initialPeople, userRole = 'Player' }: PeopleClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Optimistic state management
  const [optimisticPeople, setOptimisticPeople] = useOptimistic<Person[], OptimisticAction>(
    initialPeople,
    (currentPeople, action) => {
      switch (action.type) {
        case "delete":
          return currentPeople.filter((person) => person.id !== action.id);
        case "update":
          return currentPeople.map((person) =>
            person.id === action.id ? { ...person, ...action.updates } : person
          );
        default:
          return currentPeople;
      }
    }
  );

  // Check permissions based on user role
  const canCreate = ['Admin', 'System Architect', 'Sportsmaster', 'Coach'].includes(userRole);
  const canEdit = ['Admin', 'System Architect', 'Sportsmaster', 'Coach', 'Team Manager'].includes(userRole);
  const canDelete = ['Admin', 'System Architect'].includes(userRole);

  // Get unique schools from people
  const schools = useMemo(() => {
    const schoolSet = new Set<string>();
    optimisticPeople.forEach(person => {
      if (person.schoolId) schoolSet.add(person.schoolId);
    });
    return Array.from(schoolSet);
  }, [optimisticPeople]);

  // Filter and search logic - now uses optimisticPeople
  const filteredPeople = useMemo(() => {
    return optimisticPeople.filter(person => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchLower) ||
        person.email?.toLowerCase().includes(searchLower) ||
        person.phone?.toLowerCase().includes(searchLower);

      // Role filter
      const matchesRole = selectedRole === "all" || person.role === selectedRole;

      // School filter
      const matchesSchool = selectedSchool === "all" || person.schoolId === selectedSchool;

      return matchesSearch && matchesRole && matchesSchool;
    });
  }, [optimisticPeople, searchQuery, selectedRole, selectedSchool]);

  // Group people by role
  const groupedByRole = useMemo(() => {
    return filteredPeople.reduce((acc, person) => {
      const role = person.role || 'Other';
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(person);
      return acc;
    }, {} as Record<string, Person[]>);
  }, [filteredPeople]);

  const handleSelectPerson = (personId: string) => {
    const newSelected = new Set(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedPeople(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPeople.size === filteredPeople.length) {
      setSelectedPeople(new Set());
    } else {
      setSelectedPeople(new Set(filteredPeople.map(p => p.id)));
    }
  };

  const handleDelete = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      return;
    }

    setDeletingId(personId);
    
    // Optimistically remove from UI immediately
    startTransition(async () => {
      setOptimisticPeople({ type: "delete", id: personId });
    });

    const result = await deletePersonAction(personId);
    
    if (result.success) {
      toast.success("Person deleted successfully");
      // Remove from selection if it was selected
      if (selectedPeople.has(personId)) {
        const newSelected = new Set(selectedPeople);
        newSelected.delete(personId);
        setSelectedPeople(newSelected);
      }
    } else {
      // On failure, the optimistic update will be reverted automatically
      // when the component re-renders with the original data
      toast.error(result.error || 'Failed to delete person');
      router.refresh(); // Force refresh to restore original state
    }
    
    setDeletingId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedPeople.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedPeople.size} people? This action cannot be undone.`)) {
      return;
    }

    const idsToDelete = Array.from(selectedPeople);
    
    // Optimistically remove all selected people
    startTransition(async () => {
      idsToDelete.forEach(id => {
        setOptimisticPeople({ type: "delete", id });
      });
    });

    // Process deletions
    let successCount = 0;
    let failCount = 0;
    
    for (const id of idsToDelete) {
      const result = await deletePersonAction(id);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully deleted ${successCount} people`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} people`);
      router.refresh(); // Refresh to restore any failed deletions
    }
    
    setSelectedPeople(new Set());
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Player': return 'default';
      case 'Coach': return 'secondary';
      case 'Admin': return 'destructive';
      case 'Scorer': return 'outline';
      default: return 'outline';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <User className="h-8 w-8 text-primary" />
            People Directory
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all members of the cricket management system
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button asChild>
              <Link href="/people/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(selectedRole !== "all" || selectedSchool !== "all") && (
              <Badge variant="secondary" className="ml-2">
                {[selectedRole !== "all" ? 1 : 0, selectedSchool !== "all" ? 1 : 0].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'stats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('stats')}
              title="Stats View"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              title="Board View"
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                {/* Role Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {group}
                          </div>
                          {roles.map(role => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* School Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">School</label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Schools" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schools</SelectItem>
                      {schools.map(school => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedRole !== "all" || selectedSchool !== "all") && (
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRole("all");
                      setSelectedSchool("all");
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredPeople.length}</span> of{" "}
          <span className="font-semibold text-foreground">{initialPeople.length}</span> people
        </div>
        {selectedPeople.size > 0 && canDelete && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedPeople.size} selected
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* View Modes */}
      {filteredPeople.length > 0 ? (
        <>
          {viewMode === 'grid' && (
            <div className="space-y-8">
              {Object.entries(groupedByRole).map(([role, rolePeople]) => (
                <motion.div
                  key={role}
                  className="space-y-4"
                  initial="hidden"
                  animate="show"
                  variants={container}
                >
                  <div className="flex items-center gap-3 border-b pb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">{role}s</h2>
                    <Badge variant="secondary" className="ml-2">{rolePeople.length}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rolePeople.map((person) => (
                      <motion.div key={person.id} variants={item}>
                        <Card className="p-5 hover:shadow-lg hover:border-primary/50 transition-all duration-300 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <Link href={`/people/${person.id}`} className="flex-1">
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                  {person.firstName} {person.lastName}
                                </h3>
                                {person.title && (
                                  <p className="text-sm text-muted-foreground">{person.title}</p>
                                )}
                              </Link>
                              <div className="flex items-center gap-2">
                                <Badge variant={getRoleBadgeVariant(person.role || 'Other') as any}>
                                  {person.role}
                                </Badge>
                                {canEdit && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem asChild>
                                        <Link href={`/people/${person.id}`}>
                                          <User className="h-4 w-4 mr-2" />
                                          View Profile
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/people/${person.id}/edit`}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </Link>
                                      </DropdownMenuItem>
                                      {canDelete && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDelete(person.id)}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              {person.email && (
                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span className="truncate">{person.email}</span>
                                </div>
                              )}
                              {person.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{person.phone}</span>
                                </div>
                              )}
                              {person.schoolId && (
                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                  <School className="h-3.5 w-3.5" />
                                  <span className="truncate">School ID: {person.schoolId}</span>
                                </div>
                              )}
                            </div>

                            {person.specializations && person.specializations.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex flex-wrap gap-1.5">
                                  {person.specializations.slice(0, 3).map((spec: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                  {person.specializations.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{person.specializations.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      {canDelete && (
                        <th className="p-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedPeople.size === filteredPeople.length}
                            onChange={handleSelectAll}
                            className="rounded"
                          />
                        </th>
                      )}
                      <th className="p-4 text-left font-semibold">Name</th>
                      <th className="p-4 text-left font-semibold">Role</th>
                      <th className="p-4 text-left font-semibold">Email</th>
                      <th className="p-4 text-left font-semibold">Phone</th>
                      <th className="p-4 text-left font-semibold">School</th>
                      {canEdit && <th className="p-4 text-right font-semibold">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPeople.map((person) => (
                      <tr key={person.id} className="border-b hover:bg-muted/30 transition-colors">
                        {canDelete && (
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedPeople.has(person.id)}
                              onChange={() => handleSelectPerson(person.id)}
                              className="rounded"
                            />
                          </td>
                        )}
                        <td className="p-4">
                          <Link href={`/people/${person.id}`} className="font-medium hover:text-primary">
                            {person.firstName} {person.lastName}
                          </Link>
                          {person.title && (
                            <div className="text-sm text-muted-foreground">{person.title}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant={getRoleBadgeVariant(person.role || 'Other') as any}>
                            {person.role}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{person.email || '-'}</td>
                        <td className="p-4 text-sm text-muted-foreground">{person.phone || '-'}</td>
                        <td className="p-4 text-sm text-muted-foreground">{person.schoolId || '-'}</td>
                        {canEdit && (
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/people/${person.id}`}>
                                    <User className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/people/${person.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                {canDelete && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDelete(person.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {viewMode === 'stats' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-4 text-left font-semibold">Player</th>
                      <th className="p-4 text-center font-semibold">Matches</th>
                      <th className="p-4 text-center font-semibold">Runs</th>
                      <th className="p-4 text-center font-semibold">Wickets</th>
                      <th className="p-4 text-center font-semibold">Bat Avg</th>
                      <th className="p-4 text-center font-semibold">Bowl Avg</th>
                      <th className="p-4 text-center font-semibold">SR</th>
                      <th className="p-4 text-center font-semibold">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPeople.map((person) => (
                      <tr key={person.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <Link href={`/people/${person.id}`} className="font-medium hover:text-primary">
                            {person.firstName} {person.lastName}
                          </Link>
                          <div className="text-xs text-muted-foreground">{person.role}</div>
                        </td>
                        <td className="p-4 text-center font-medium">{person.stats?.matchesPlayed || 0}</td>
                        <td className="p-4 text-center">{person.stats?.totalRuns || 0}</td>
                        <td className="p-4 text-center">{person.stats?.wicketsTaken || 0}</td>
                        <td className="p-4 text-center">{person.stats?.battingAverage?.toFixed(2) || '-'}</td>
                        <td className="p-4 text-center">{person.stats?.bowlingAverage?.toFixed(2) || '-'}</td>
                        <td className="p-4 text-center">{person.stats?.strikeRate?.toFixed(1) || '-'}</td>
                        <td className="p-4 text-center">{person.stats?.economy?.toFixed(2) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {viewMode === 'board' && (
            <div className="flex gap-6 overflow-x-auto pb-6">
              {Object.entries(groupedByRole).map(([role, rolePeople]) => (
                <div key={role} className="min-w-[320px] max-w-[320px] flex flex-col gap-4">
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                    <h3 className="font-semibold">{role}s</h3>
                    <Badge variant="secondary">{rolePeople.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {rolePeople.map((person) => (
                      <Card key={person.id} className="p-4 hover:border-primary transition-colors cursor-pointer">
                        <Link href={`/people/${person.id}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{person.firstName} {person.lastName}</div>
                              <div className="text-xs text-muted-foreground mt-1">{person.email}</div>
                            </div>
                            {person.schoolId && (
                              <School className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          {person.specializations && person.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {person.specializations.slice(0, 2).map((spec, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center border-dashed">
            <div className="bg-muted/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No People Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || selectedRole !== "all" || selectedSchool !== "all"
                ? "No people match your current filters. Try adjusting your search criteria."
                : "There are no people in the database yet. Start building your directory by adding members."}
            </p>
            {canCreate && (
              <Button asChild size="lg">
                <Link href="/people/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Person
                </Link>
              </Button>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
