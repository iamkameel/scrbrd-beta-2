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
];
export const PermissionViewContext = React.createContext(undefined);
export const PermissionViewProvider = ({ children }) => {
    const [currentRole, setCurrentRole] = React.useState("Super Admin"); // Default role
    return (<PermissionViewContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </PermissionViewContext.Provider>);
};
export const usePermissionView = () => {
    const context = React.useContext(PermissionViewContext);
    if (context === undefined) {
        throw new Error('usePermissionView must be used within a PermissionViewProvider');
    }
    return context;
};
