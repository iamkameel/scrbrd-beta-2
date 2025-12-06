"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar, MapPin, Users } from "lucide-react";

interface ConflictAlertProps {
  conflicts: string[];
}

export function ConflictAlert({ conflicts }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  const getConflictIcon = (conflict: string) => {
    if (conflict.toLowerCase().includes('venue')) return <MapPin className="h-4 w-4" />;
    if (conflict.toLowerCase().includes('team')) return <Users className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  return (
    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="font-semibold">Scheduling Conflicts Detected</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {conflicts.map((conflict, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              {getConflictIcon(conflict)}
              {conflict}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
