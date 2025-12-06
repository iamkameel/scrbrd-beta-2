import { describe, it, expect } from 'vitest';
import { USER_ROLES, ALL_ROLES, ROLE_GROUPS } from '../roles';

describe('roles.ts', () => {
    describe('USER_ROLES', () => {
        it('should have all required role constants', () => {
            expect(USER_ROLES.SYSTEM_ARCHITECT).toBe('System Architect');
            expect(USER_ROLES.ADMIN).toBe('Admin');
            expect(USER_ROLES.COACH).toBe('Coach');
            expect(USER_ROLES.PLAYER).toBe('Player');
            expect(USER_ROLES.SCORER).toBe('Scorer');
        });

        it('should have distinct role values', () => {
            const roleValues = Object.values(USER_ROLES);
            const uniqueValues = new Set(roleValues);
            expect(roleValues.length).toBe(uniqueValues.size);
        });
    });

    describe('ALL_ROLES', () => {
        it('should include all user roles', () => {
            expect(ALL_ROLES).toContain(USER_ROLES.SYSTEM_ARCHITECT);
            expect(ALL_ROLES).toContain(USER_ROLES.ADMIN);
            expect(ALL_ROLES).toContain(USER_ROLES.PLAYER);
            expect(ALL_ROLES).toContain(USER_ROLES.COACH);
        });

        it('should have correct number of roles', () => {
            // Should have 19 roles total
            expect(ALL_ROLES.length).toBe(19);
        });
    });

    describe('ROLE_GROUPS', () => {
        it('should have administrative, team staff, and other groups', () => {
            expect(ROLE_GROUPS).toHaveProperty('ADMINISTRATIVE');
            expect(ROLE_GROUPS).toHaveProperty('TEAM STAFF');
            expect(ROLE_GROUPS).toHaveProperty('SUPPORT & MEDICAL');
        });

        it('should have roles in each group', () => {
            expect(ROLE_GROUPS.ADMINISTRATIVE.length).toBeGreaterThan(0);
            expect(ROLE_GROUPS['TEAM STAFF'].length).toBeGreaterThan(0);
            expect(ROLE_GROUPS['SUPPORT & MEDICAL'].length).toBeGreaterThan(0);
        });
    });
});
