/**
 * Team Name Generator
 * 
 * Generates intelligent team name suggestions based on school patterns,
 * age group, suffix, and optional nickname.
 */

import { AgeGroup } from '@/types/firestore';

export interface TeamNameInput {
    schoolName: string;
    schoolAbbreviation?: string;
    ageGroup: AgeGroup | string | undefined | null;
    suffix: string;
    sport?: string;
    nickname?: string;
}

export interface GeneratedName {
    format: 'full' | 'abbreviated' | 'compact' | 'nickname';
    name: string;
    description: string;
}

/**
 * Generate abbreviation from school name
 * "Westville Boys' High School" → "WBHS"
 * "Durban High School" → "DHS"
 */
export function generateAbbreviation(schoolName: string): string {
    // Remove common words and punctuation
    const cleaned = schoolName
        .replace(/['"`]/g, '')
        .replace(/\b(the|of|and|for)\b/gi, '')
        .trim();

    // Split into words
    const words = cleaned.split(/\s+/);

    // Take first letter of each significant word
    const abbrev = words
        .filter(word => word.length > 2 || /^[A-Z]/.test(word))
        .map(word => word.charAt(0).toUpperCase())
        .join('');

    return abbrev || schoolName.substring(0, 4).toUpperCase();
}

/**
 * Format age group for display
 * "U13" → "U13"
 * "Open" → "Open"
 */
function formatAgeGroup(ageGroup: string | undefined | null): string {
    if (!ageGroup || typeof ageGroup !== 'string') return '';
    if (ageGroup === 'Open') return '';
    // Normalize u14 -> U14, etc.
    if (ageGroup.toLowerCase().startsWith('u')) {
        return ageGroup.toUpperCase();
    }
    return ageGroup;
}

/**
 * Format suffix for display
 * "A" → "A"
 * "1st XI" → "1st XI"
 */
function formatSuffix(suffix: string): string {
    return suffix.trim();
}

/**
 * Generate multiple team name suggestions based on input
 */
export function generateTeamNames(input: TeamNameInput): GeneratedName[] {
    const {
        schoolName,
        schoolAbbreviation,
        ageGroup,
        suffix,
        sport = 'Cricket',
        nickname
    } = input;

    const abbrev = schoolAbbreviation || generateAbbreviation(schoolName);
    const ageStr = formatAgeGroup(ageGroup);
    const suffixStr = formatSuffix(suffix);

    // Check raw ageGroup for 'Open' status before formatting
    const isOpen = ageGroup === 'Open';

    const names: GeneratedName[] = [];

    // 1. Full format
    // Open: "Westville Boys' High School 1st XI"
    // Age Group: "Westville Boys' High School U16A"
    let fullName = '';
    if (isOpen) {
        fullName = `${schoolName} ${suffixStr}`;
    } else {
        // Concatenate Age + Suffix (e.g., U16A)
        fullName = `${schoolName} ${ageStr}${suffixStr}`;
    }

    names.push({
        format: 'full',
        name: fullName.trim(),
        description: 'Standard school format'
    });

    // 2. Abbreviated format
    // Open: "WBHS 1st XI"
    // Age Group: "WBHS U16A"
    let abbrevName = '';
    if (isOpen) {
        abbrevName = `${abbrev} ${suffixStr}`;
    } else {
        abbrevName = `${abbrev} ${ageStr}${suffixStr}`;
    }

    names.push({
        format: 'abbreviated',
        name: abbrevName.trim(),
        description: 'Abbreviated school name'
    });

    // 3. Compact format
    // "Westville 1st XI" or "Westville U16A"
    const shortSchoolName = schoolName.split(/\s+/)[0].replace(/['"`]/g, '');
    let compactName = '';
    if (isOpen) {
        compactName = `${shortSchoolName} ${suffixStr}`;
    } else {
        compactName = `${shortSchoolName} ${ageStr}${suffixStr}`;
    }

    names.push({
        format: 'compact',
        name: compactName.trim(),
        description: 'Short school name'
    });

    // 4. Nickname format
    if (nickname) {
        // "1st XI Griffins" or "U16A Griffins"
        const prefix = isOpen ? suffixStr : `${ageStr}${suffixStr}`;
        names.push({
            format: 'nickname',
            name: `${prefix} ${nickname}`.trim(),
            description: 'Using team nickname'
        });
    }

    return names;
}

/**
 * Get recommended team name (abbreviated format is usually best)
 */
export function getRecommendedName(input: TeamNameInput): string {
    const names = generateTeamNames(input);
    const abbreviated = names.find(n => n.format === 'abbreviated');
    return abbreviated?.name || names[0]?.name || '';
}

/**
 * Naming Convention Patterns
 */
export type NamingPattern = 'alphabetical' | 'ordinal' | 'mixed' | 'unknown';

/**
 * Detect the naming pattern used by a school for a specific age group
 */
export function detectNamingPattern(existingTeams: { suffix?: string }[]): NamingPattern {
    const suffixes = existingTeams.map(t => t.suffix).filter(Boolean) as string[];

    if (suffixes.length === 0) return 'unknown';

    const hasOrdinal = suffixes.some(s => /^\d+(st|nd|rd|th)\s+XI$/i.test(s));
    const hasAlpha = suffixes.some(s => /^[A-E]$/.test(s));

    if (hasOrdinal && hasAlpha) return 'mixed';
    if (hasOrdinal) return 'ordinal';
    if (hasAlpha) return 'alphabetical';

    return 'unknown';
}

/**
 * Get smart suffix suggestions based on detected pattern and availability
 */
export function getSmartSuffixSuggestions(
    ageGroup: AgeGroup | string,
    existingSuffixes: string[],
    pattern: NamingPattern = 'unknown'
): { suffix: string; status: 'recommended' | 'available' | 'taken' }[] {
    let candidates: string[] = [];

    // 1. Determine candidate list based on Age Group rules first (User Preference)
    if (ageGroup === 'Open') {
        // Open teams default to Ordinal (1st XI) unless pattern strongly suggests otherwise
        if (pattern === 'alphabetical') {
            candidates = [...STANDARD_SUFFIXES.youth];
        } else {
            candidates = [...STANDARD_SUFFIXES.open];
        }
    } else {
        // Age Group teams default to Alphabetical (A, B) unless pattern strongly suggests otherwise
        if (pattern === 'ordinal') {
            candidates = [...STANDARD_SUFFIXES.open];
        } else {
            candidates = [...STANDARD_SUFFIXES.youth];
        }
    }

    // 2. Map to status
    return candidates.map(suffix => {
        const isTaken = existingSuffixes.includes(suffix);

        // Simple recommendation logic: First available candidate
        // This will be refined by the caller (finding the first 'available')
        return {
            suffix,
            status: isTaken ? 'taken' : 'available'
        };
    });
}

/**
 * Standard suffix options
 */
export const STANDARD_SUFFIXES = {
    youth: ['A', 'B', 'C', 'D', 'E'],
    open: ['1st XI', '2nd XI', '3rd XI', '4th XI', '5th XI'],
    special: ['Development', 'Academy', 'Colts', 'Invitational']
} as const;

/**
 * Suggest next available suffix given existing suffixes
 * If "A" exists, suggest "B", etc.
 */
export function suggestNextSuffix(
    existingSuffixes: string[],
    ageGroup: AgeGroup | string
): string | null {
    // Detect pattern from existing suffixes
    const pattern = detectNamingPattern(existingSuffixes.map(s => ({ suffix: s })));
    const suggestions = getSmartSuffixSuggestions(ageGroup, existingSuffixes, pattern);

    const nextAvailable = suggestions.find(s => s.status === 'available');
    return nextAvailable ? nextAvailable.suffix : null;
}
