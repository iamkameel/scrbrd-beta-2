
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { UserCog, Edit3 } from "lucide-react";

const ALL_ROLES = [
  "Admin", "School", "Coach", "Player", "Parent", "Captain",
  "Spectator", "Scorer", "Umpire", "Groundskeeper", "Sportmaster", "Driver"
] as const;

type UserRole = typeof ALL_ROLES[number];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Suspended';
}

const initialSampleUsers: AdminUser[] = [
  { id: 'user1', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 'user2', name: 'Bob Coach', email: 'bob@example.com', role: 'Coach', status: 'Active' },
  { id: 'user3', name: 'Charlie Player', email: 'charlie@example.com', role: 'Player', status: 'Suspended' },
  { id: 'user4', name: 'Diana Parent', email: 'diana@example.com', role: 'Parent', status: 'Active' },
  { id: 'user5', name: 'Edward Scorer', email: 'edward@example.com', role: 'Scorer', status: 'Active' },
  { id: 'user6', name: 'Fiona Groundskeeper', email: 'fiona@example.com', role: 'Groundskeeper', status: 'Active' },
  { id: 'user7', name: 'George Umpire', email: 'george@example.com', role: 'Umpire', status: 'Suspended' },
];

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<AdminUser[]>(initialSampleUsers);

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
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCog className="h-8 w-8 text-primary" />
          User Management
        </h1>
        {/* Placeholder for Add User button or other global actions */}
        {/* <Button disabled>Add New User</Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">User Accounts</CardTitle>
          <CardDescription>Manage user accounts, roles, and permissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center">No users to display.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <Card key={user.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription className="text-xs">{user.email}</CardDescription>
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
