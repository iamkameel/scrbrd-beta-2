"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { UserCog, Edit3, Search, Building, ListChecks } from "lucide-react"; // Added Building, ListChecks
import { schoolsData, SchoolProfile } from '@/lib/schools-data'; // Import schoolsData

const ALL_ROLES = [
  "Admin", "School", "Coach", "Player", "Parent", "Captain",
  "Spectator", "Scorer", "Umpire", "Groundskeeper", "Sportmaster", "Driver"
] as const;

type UserRole = typeof ALL_ROLES[number];

const ALL_ROLES_FOR_FILTER = ["All", ...ALL_ROLES] as const;
type UserRoleFilter = typeof ALL_ROLES_FOR_FILTER[number];

const ALL_STATUSES = ["All", "Active", "Suspended"] as const;
type UserStatusFilter = typeof ALL_STATUSES[number];


interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Suspended';
  schoolId?: string; // Changed to schoolId string
}

const initialSampleUsers: AdminUser[] = [
  { id: 'user1', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', status: 'Active', schoolId: undefined }, // Admin user not tied to a school
  { id: 'user2', name: 'Bob Coach', email: 'bob@example.com', role: 'Coach', status: 'Active', schoolId: 'school-8' }, // Northwood School
  { id: 'user3', name: 'Charlie Player', email: 'charlie@example.com', role: 'Player', status: 'Suspended', schoolId: 'school-2' }, // Hilton College
  { id: 'user4', name: 'Diana Parent', email: 'diana@example.com', role: 'Parent', status: 'Active', schoolId: 'school-8' }, // Northwood School
  { id: 'user5', name: 'Edward Scorer', email: 'edward@example.com', role: 'Scorer', status: 'Active', schoolId: undefined }, // Not tied to a school
  { id: 'user6', name: 'Fiona Groundskeeper', email: 'fiona@example.com', role: 'Groundskeeper', status: 'Active', schoolId: undefined }, // Not tied to a school
  { id: 'user7', name: 'George Umpire', email: 'george@example.com', role: 'Umpire', status: 'Suspended', schoolId: undefined }, // Not tied to a school
  { id: 'user8', name: 'Hannah SchoolAdmin', email: 'hannah@school.com', role: 'School', status: 'Active', schoolId: 'school-7' }, // Westville Boys' High
  { id: 'user9', name: 'Ian Player', email: 'ian.player@example.com', role: 'Player', status: 'Active', schoolId: 'school-8' }, // Northwood School
  { id: 'user10', name: 'Julia Coach', email: 'julia.coach@example.com', role: 'Coach', status: 'Suspended', schoolId: 'school-2' }, // Hilton College
  { id: 'user11', name: 'Kevin Sportmaster', email: 'kevin.sm@school.com', role: 'Sportmaster', status: 'Active', schoolId: 'school-7' }, // Westville Boys' High
  { id: 'user12', name: 'Laura Driver', email: 'laura.driver@transport.com', role: 'Driver', status: 'Active', schoolId: undefined }, // Not tied to a school
];

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<AdminUser[]>(initialSampleUsers);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [schoolFilter, setSchoolFilter] = React.useState<string>("All"); // Use schoolId for filter
  const [roleFilter, setRoleFilter] = React.useState<UserRoleFilter>("All");
  const [statusFilter, setStatusFilter] = React.useState<UserStatusFilter>("All");

  const schoolOptions = React.useMemo(() => {
    const schoolsMap = new Map<string, string>();
    schoolsData.forEach(school => schoolsMap.set(school.id.toString(), school.name));
    const uniqueSchoolIds = new Set(users.map(user => user.schoolId).filter(Boolean) as string[]);
    const sortedSchoolIds = Array.from(uniqueSchoolIds).sort((a, b) => {
       const nameA = schoolsMap.get(a) || '';
       const nameB = schoolsMap.get(b) || '';
       return nameA.localeCompare(nameB);
    });
    return ["All", ...sortedSchoolIds]; // Store IDs, map to names for display
  }, [users]);

  const getSchoolNameById = React.useCallback((schoolId?: string): string => {
    if (!schoolId) return 'N/A';
    const school = schoolsData.find(s => s.id.toString() === schoolId);
    return school ? school.name : 'Unknown School';
  }, []);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' }
          : user
      )
    );
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        user.name.toLowerCase().includes(lowercasedSearchTerm) ||
        user.email.toLowerCase().includes(lowercasedSearchTerm);

      const matchesSchool = schoolFilter === "All" || user.schoolId === schoolFilter;
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesSchool && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, schoolFilter, roleFilter, statusFilter]);

  // Map school IDs to names for display in the dropdown trigger
  const currentSchoolFilterName = schoolFilter === "All" ? "All Schools" : getSchoolNameById(schoolFilter);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCog className="h-8 w-8 text-primary" />
          User Management
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">User Accounts</CardTitle>
          <CardDescription>Manage user accounts, roles, and permissions. Search by name or email and apply filters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <Building className="mr-2 h-4 w-4" />
                    School: {currentSchoolFilterName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by School</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={schoolFilter} onValueChange={setSchoolFilter}>
                    {schoolOptions.map(schoolId => (
                      <DropdownMenuRadioItem key={schoolId} value={schoolId}>
                        {schoolId === "All" ? "All Schools" : getSchoolNameById(schoolId)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <UserCog className="mr-2 h-4 w-4" />
                    Role: {roleFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRoleFilter)}>
                    {ALL_ROLES_FOR_FILTER.map(role => (
                      <DropdownMenuRadioItem key={role} value={role}>
                        {role}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <ListChecks className="mr-2 h-4 w-4" />
                    Status: {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatusFilter)}>
                    {ALL_STATUSES.map(status => (
                      <DropdownMenuRadioItem key={status} value={status}>
                        {status}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No users match your search or filter criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription className="text-xs">{user.email}</CardDescription>
                     {user.schoolId && <CardDescription className="text-xs pt-1">School: {getSchoolNameById(user.schoolId)}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-2 flex-grow">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Role:</span>
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={cn(user.status === 'Active' && "bg-green-600 hover:bg-green-600/90")}>
                        {user.status}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit3 className="mr-2 h-3.5 w-3.5" /> Change Role
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Assign New Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          value={user.role}
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}
                        >
                          {ALL_ROLES.map((roleName) => (
                            <DropdownMenuRadioItem key={roleName} value={roleName}>
                              {roleName}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.status === 'Active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}