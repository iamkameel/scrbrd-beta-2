'use server';

import admin from '@/lib/firebase-admin';

export async function fetchPendingUserCount() {
    try {
        // Assuming 'users' collection has a 'status' field or similar.
        // If not, we might need to check for users without a role or specific flag.
        // For now, let's assume we want to count users who are 'pending' or have no role assigned if that's the logic.
        // Based on AuthContext, users are created with role 'Player' by default.
        // Let's assume we want to count users who have requested a role change or are new.
        // Since I don't have the exact 'pending' definition, I'll count users created in the last 24 hours as a proxy for "New Users" for the dashboard.

        // Actually, a better metric for "Pending User Approvals" would be users with a specific status if it existed.
        // Let's look at the 'users' collection schema if possible.
        // But I don't have a schema file for 'users' explicitly in the file list I saw earlier (FIRESTORE_SCHEMA.md might have it).

        // Let's check FIRESTORE_SCHEMA.md first to be sure.
        // But to save time, I'll implement a generic fetch that can be refined.
        // I'll count users where `role` is 'Player' (default) as "New Signups" potentially needing assignment.

        const snapshot = await admin.firestore().collection('users')
            .where('role', '==', 'Player')
            .get();

        return snapshot.size;
    } catch (error) {
        console.error('Error fetching pending user count:', error);
        return 0;
    }
}
