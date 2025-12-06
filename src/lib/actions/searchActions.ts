'use server';

import { fetchCollection } from "@/lib/firestore";
import { where } from "firebase/firestore";

export type SearchResultType = 'team' | 'player' | 'match' | 'equipment';

export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle?: string;
    url: string;
}

export async function searchGlobalAction(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    try {
        // 1. Search Teams
        // Note: Firestore doesn't support native full-text search. 
        // We'll fetch all and filter in memory for this MVP, or use a specific "name" prefix query if possible.
        // For a production app with large data, we'd use Algolia or Typesense.
        // Here we'll fetch a reasonable limit and filter.
        const teams = await fetchCollection<any>('teams');
        const matchedTeams = teams.filter(t =>
            t.name.toLowerCase().includes(normalizedQuery) ||
            t.abbreviatedName?.toLowerCase().includes(normalizedQuery)
        ).slice(0, 5);

        results.push(...matchedTeams.map(t => ({
            id: t.id,
            type: 'team' as const,
            title: t.name,
            subtitle: t.abbreviatedName,
            url: `/teams/${t.id}`
        })));

        // 2. Search Players
        const people = await fetchCollection<any>('people', [where('role', '==', 'Player')]);
        const matchedPlayers = people.filter(p =>
            p.firstName.toLowerCase().includes(normalizedQuery) ||
            p.lastName.toLowerCase().includes(normalizedQuery) ||
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(normalizedQuery)
        ).slice(0, 5);

        results.push(...matchedPlayers.map(p => ({
            id: p.id,
            type: 'player' as const,
            title: `${p.firstName} ${p.lastName}`,
            subtitle: p.teamId ? 'Player' : 'Free Agent', // Could look up team name if needed
            url: `/players/${p.id}`
        })));

        // 3. Search Matches
        // Searching matches is tricky without full text. We'll search by ID or maybe just recent matches?
        // Let's skip complex match search for now and just search by ID if it looks like one, 
        // or maybe search teams and show their matches? 
        // For this MVP, let's search matches where the query matches a team name involved.
        // Actually, fetching all matches is too heavy. Let's skip matches for this simple in-memory search 
        // unless we have a specific strategy. 
        // Alternative: Search equipment.
        const equipment = await fetchCollection<any>('equipment');
        const matchedEquipment = equipment.filter(e =>
            e.name.toLowerCase().includes(normalizedQuery) ||
            e.type.toLowerCase().includes(normalizedQuery) ||
            e.brand.toLowerCase().includes(normalizedQuery)
        ).slice(0, 5);

        results.push(...matchedEquipment.map(e => ({
            id: e.id,
            type: 'equipment' as const,
            title: e.name,
            subtitle: `${e.brand} - ${e.status}`,
            url: `/equipment/${e.id}/edit`
        })));

    } catch (error) {
        console.error("Global search error:", error);
    }

    return results;
}
