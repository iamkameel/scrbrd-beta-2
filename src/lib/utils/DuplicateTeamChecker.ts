/**
 * Duplicate Team Checker
 * 
 * Service to check for existing teams and suggest alternatives
 * based on school, season, age group, and suffix.
 */

import { Team, AgeGroup } from '@/types/firestore';
import { suggestNextSuffix } from './TeamNameGenerator';

export interface DuplicateCheckResult {
    exists: boolean;
    existingTeam?: Team;
    suggestedSuffix?: string;
    existingSuffixes: string[];
}

/**
 * Check if a team with the same school + age group + suffix exists
 * @param teams - Array of existing teams to check against
 * @param schoolId - School ID to match
 * @param ageGroup - Age group to match (from division)
 * @param suffix - Proposed suffix
 * @returns Check result with suggested alternative if duplicate found
 */
export function checkDuplicateTeam(
    teams: Team[],
    schoolId: string,
    ageGroup: AgeGroup | string,
    suffix: string
): DuplicateCheckResult {
    // Filter teams for this school
    const schoolTeams = teams.filter(t => t.schoolId === schoolId);

    // Get all suffixes used by this school for this age group
    // Note: This requires parsing division or name to get age group
    // For now, we check against suffix directly
    const existingSuffixes = schoolTeams
        .filter(t => t.suffix)
        .map(t => t.suffix as string);

    // Check for exact match
    const existingTeam = schoolTeams.find(t =>
        t.suffix?.toLowerCase() === suffix.toLowerCase()
    );

    if (existingTeam) {
        const suggestedSuffix = suggestNextSuffix(existingSuffixes, ageGroup);

        return {
            exists: true,
            existingTeam,
            suggestedSuffix: suggestedSuffix || undefined,
            existingSuffixes
        };
    }

    return {
        exists: false,
        existingSuffixes
    };
}

/**
 * Check if team name is similar to existing teams (fuzzy match)
 * @param teams - Array of existing teams
 * @param proposedName - The name being proposed
 * @returns Array of similar team names
 */
export function findSimilarTeams(
    teams: Team[],
    proposedName: string
): Team[] {
    const normalizedProposed = proposedName.toLowerCase().replace(/[^a-z0-9]/g, '');

    return teams.filter(team => {
        const normalizedExisting = team.name.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Check for high similarity (80%+ match)
        const similarity = calculateSimilarity(normalizedProposed, normalizedExisting);
        return similarity > 0.8;
    });
}

/**
 * Simple string similarity calculation (Dice coefficient)
 */
function calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length < 2 || str2.length < 2) return 0;

    const bigrams1 = new Set<string>();
    const bigrams2 = new Set<string>();

    for (let i = 0; i < str1.length - 1; i++) {
        bigrams1.add(str1.substring(i, i + 2));
    }
    for (let i = 0; i < str2.length - 1; i++) {
        bigrams2.add(str2.substring(i, i + 2));
    }

    let intersection = 0;
    for (const bigram of bigrams1) {
        if (bigrams2.has(bigram)) intersection++;
    }

    return (2 * intersection) / (bigrams1.size + bigrams2.size);
}

/**
 * Get teams for a specific division/age group
 */
export function getTeamsByAgeGroup(
    teams: Team[],
    schoolId: string,
    divisionId?: string
): Team[] {
    return teams.filter(t =>
        t.schoolId === schoolId &&
        (!divisionId || t.divisionId === divisionId)
    );
}

/**
 * Validate team uniqueness within school
 * Returns validation errors if any
 */
export function validateTeamUniqueness(
    teams: Team[],
    schoolId: string,
    name: string,
    suffix: string,
    excludeTeamId?: string // For edit mode
): string[] {
    const errors: string[] = [];

    const schoolTeams = teams.filter(t =>
        t.schoolId === schoolId && t.id !== excludeTeamId
    );

    // Check for duplicate name
    const nameExists = schoolTeams.some(t =>
        t.name.toLowerCase() === name.toLowerCase()
    );
    if (nameExists) {
        errors.push('A team with this name already exists for this school');
    }

    // Check for duplicate suffix
    if (suffix) {
        const suffixExists = schoolTeams.some(t =>
            t.suffix?.toLowerCase() === suffix.toLowerCase()
        );
        if (suffixExists) {
            errors.push(`A team with suffix "${suffix}" already exists for this school`);
        }
    }

    return errors;
}
