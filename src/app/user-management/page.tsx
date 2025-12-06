"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ROLE_GROUPS } from "@/lib/roles";
import { Users, Search, MoreVertical, Plus, Pencil, Trash2, UserCog, ShieldAlert, Grid3x3, Mail, List, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PermissionsMatrix } from "@/components/user-management/PermissionsMatrix";
import { InviteUserDialog } from "@/components/user-management/InviteUserDialog";
import { UserService, UserData } from "@/lib/userService";
import { toast } from "sonner";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await UserService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Player",
    status: "active" as "active" | "inactive" | "injured"
  });

  const filteredUsers = users.filter(person => {
    const matchesSearch = (person.displayName || person.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (person.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || person.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const allRoles = Array.from(new Set(users.map(p => p.role).filter(Boolean)));

  const handleOpenDialog = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "Player",
        status: user.status || "active"
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "Player",
        status: "active"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Update existing user
        await UserService.updateUser(editingUser.uid, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`,
          role: formData.role,
          status: formData.status
        });
        toast.success("User updated successfully");
      } else {
        // Create new user (Invite)
        // For manual creation, we might want to use inviteUser or a direct create if supported
        // For now, let's assume manual creation is just an invite
        await UserService.inviteUser(formData.email, formData.role);
        toast.success("User invited successfully");
      }
      
      await fetchUsers(); // Refresh list
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    }
  };

  const handleDelete = async (uid: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await UserService.deleteUser(uid);
        toast.success("User deleted successfully");
        await fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const toggleUserSelection = (personId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.uid)));
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedUsers.size === 0) return;
    
    const action = status === 'active' ? 'activate' : 'deactivate';
    if (confirm(`Are you sure you want to ${action} ${selectedUsers.size} user(s)?`)) {
      try {
        await Promise.all(Array.from(selectedUsers).map(uid => 
          UserService.updateUser(uid, { status })
        ));
        toast.success(`Updated ${selectedUsers.size} users`);
        await fetchUsers();
        setSelectedUsers(new Set());
      } catch (error) {
        console.error("Error updating users:", error);
        toast.error("Failed to update some users");
      }
    }
  };


  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCog className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage system access, roles, and user accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3 text-sm">{users.length} Total Users</Badge>
          <Badge variant="secondary" className="h-8 px-3 text-sm">{users.filter(p => p.status === 'active').length} Active</Badge>
          <div className="flex gap-1 border border-border rounded-lg p-1 ml-2">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-2" />
              Users
            </Button>
            <Button
              variant={viewMode === 'matrix' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('matrix')}
              className="h-8 px-3"
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Permissions
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <PermissionsMatrix />
      ) : (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  {allRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsInviteDialogOpen(true)}
              >
                Invite User
              </Button>
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center justify-between bg-muted p-4 rounded-lg border mt-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-8 px-3">
                  {selectedUsers.size} selected
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedUsers(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleBulkStatusChange('active')}
                >
                  Activate Selected
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkStatusChange('inactive')}
                >
                  Deactivate Selected
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.uid)}
                        onChange={() => toggleUserSelection(user.uid)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                          {user.profileImageUrl ? (
                            <Image src={user.profileImageUrl} alt={user.firstName} width={40} height={40} className="object-cover h-full w-full" />
                          ) : (
                            <Users className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.displayName || `${user.firstName} ${user.lastName}`}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.uid)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      )}

      <InviteUserDialog 
        open={isInviteDialogOpen} 
        onOpenChange={(open) => {
          setIsInviteDialogOpen(open);
          if (!open) fetchUsers(); // Refresh on close in case invited
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Make changes to the user profile here.' : 'Enter the details for the new user account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                      <SelectGroup key={group}>
                        <SelectLabel>{group}</SelectLabel>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="injured">Injured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
