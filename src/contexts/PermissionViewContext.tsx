
'use client';

import * as React from 'react';

export const SIMULATED_ROLES = [
  // ADMINISTRATIVE
  "System Architect",
  "Admin",
  "Sportsmaster",
  "School Admin",
  // TEAM STAFF
  "Coach",
  "Assistant Coach",
  "Team Manager",
  "Captain",
  // PLAYERS & SPECTATORS
  "Player",
  "Guardian",
  "Spectator",
  // SUPPORT & MEDICAL
  "Trainer",
  "Physiotherapist",
  "Doctor",
  "First Aid",
  // OFFICIALS & GROUND STAFF
  "Umpire",
  "Scorer",
  "Grounds-Keeper",
  "Driver"
] as const;

export type SimulatedRole = typeof SIMULATED_ROLES[number];

interface PermissionViewContextType {
  currentRole: SimulatedRole;
  setCurrentRole: (role: SimulatedRole) => void;
}

export const PermissionViewContext = React.createContext<PermissionViewContextType | undefined>(undefined);

export const PermissionViewProvider = ({ children }: React.PropsWithChildren) => {
  const [currentRole, setCurrentRole] = React.useState<SimulatedRole>("System Architect"); // Default role

  return (
    <PermissionViewContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </PermissionViewContext.Provider>
  );
};

export const usePermissionView = () => {
  const context = React.useContext(PermissionViewContext);
  if (context === undefined) {
    throw new Error('usePermissionView must be used within a PermissionViewProvider');
  }
  return context;
};
