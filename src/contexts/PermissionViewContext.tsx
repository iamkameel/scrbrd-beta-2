
'use client';

import * as React from 'react';

export const SIMULATED_ROLES = [
  "Super Admin", 
  "School Admin", 
  "Coach", 
  "Player", 
  "Parent", 
  "Spectator",
  "Umpire",
  "Scorer",
  "Groundskeeper"
] as const;

export type SimulatedRole = typeof SIMULATED_ROLES[number];

interface PermissionViewContextType {
  currentRole: SimulatedRole;
  setCurrentRole: (role: SimulatedRole) => void;
}

export const PermissionViewContext = React.createContext<PermissionViewContextType | undefined>(undefined);

export const PermissionViewProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentRole, setCurrentRole] = React.useState<SimulatedRole>("Super Admin"); // Default role

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
