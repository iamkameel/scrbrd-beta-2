
"use client";

import * as React from 'react';
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Users, Power, SlidersHorizontal, Trash2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  // Placeholder state for visual toggles
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);

  // Ensure the component is mounted before using the theme state for the switch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render nothing or a skeleton to avoid hydration mismatch
    return null; 
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Admin Settings
        </h1>
        <Button disabled>Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" /> General Settings
          </CardTitle>
          <CardDescription>Configure basic application settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="SCRBRD Beta" readOnly className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">The public name of the application.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultTimezone">Default Timezone</Label>
              <Input id="defaultTimezone" defaultValue="Africa/Johannesburg (GMT+2)" readOnly className="bg-muted/50" />
               <p className="text-xs text-muted-foreground">Default timezone for displaying dates and times.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id="darkModeToggle"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="Dark Mode Toggle"
            />
            <Label htmlFor="darkModeToggle" className="cursor-pointer">
              Dark Mode
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" /> User Management
          </CardTitle>
          <CardDescription>Manage user accounts and permissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <p className="text-sm font-medium">Total Registered Users</p>
            <p className="text-lg font-bold text-primary">1,234</p>
          </div>
          <Button variant="outline" disabled>
            <Users className="mr-2 h-4 w-4" /> Manage Users
          </Button>
          <p className="text-xs text-muted-foreground">Access detailed user list, edit roles, and manage accounts.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Power className="h-5 w-5 text-muted-foreground" /> System Configuration
          </CardTitle>
          <CardDescription>Advanced system settings and maintenance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key (Example)</Label>
            <Input id="apiKey" type="password" defaultValue="**********" readOnly className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Primary API key for integrations (display only).</p>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="maintenanceMode"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
              aria-label="Maintenance Mode Toggle"
            />
            <Label htmlFor="maintenanceMode" className="cursor-pointer">
              Enable Maintenance Mode
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, users (except admins) will see a maintenance page.
          </p>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50" disabled>
            <Trash2 className="mr-2 h-4 w-4" /> Clear System Cache
          </Button>
          <p className="text-xs text-muted-foreground">
            Clears various system caches. Use with caution.
          </p>
        </CardContent>
      </Card>

      <div className="pt-4 text-right">
        <Button disabled>Save All Settings</Button>
        <p className="text-xs text-muted-foreground mt-2">Changes will be applied globally.</p>
      </div>
    </div>
  );
}
