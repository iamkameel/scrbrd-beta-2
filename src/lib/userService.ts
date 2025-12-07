import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Person } from '@/types/firestore';

export interface UserData extends Person {
    uid: string;
    email: string;
    role: string; // Primary role
    roles?: string[]; // Multiple roles
    assignedSchools?: string[]; // Array of school IDs
    teamIds?: string[]; // Array of team IDs
    displayName: string;
    photoURL?: string;
    createdAt?: any;
    lastLogin?: any;
    hasAccount?: boolean;
    personId?: string;
}

export interface InvitationData {
    id: string;
    email: string;
    role: string;
    roles?: string[];
    assignedSchools?: string[];
    teamIds?: string[];
    status: 'pending' | 'accepted' | 'expired';
    invitedBy?: string;
    createdAt: any;
}

export const UserService = {
    // Get all users (merged with people)
    async getUsers(): Promise<UserData[]> {
        try {
            const [usersSnap, peopleSnap] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'people'))
            ]);

            const users = usersSnap.docs.map(doc => ({
                uid: doc.id,
                personId: doc.id,
                ...doc.data(),
                hasAccount: true
            } as unknown as UserData));

            const people = peopleSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Person));

            // Create a map of email -> User for easy lookup
            const userMap = new Map<string, UserData>();
            users.forEach(u => {
                if (u.email) userMap.set(u.email.toLowerCase(), u);
            });

            const combined: UserData[] = [...users];

            people.forEach(p => {
                // Check if this person is already in users (by email)
                const email = p.email || p.contactEmail;
                const isUser = email && userMap.has(email.toLowerCase());

                if (!isUser) {
                    // Not a user, add as "Person without account"
                    combined.push({
                        ...p, // Spread person properties first
                        uid: `person_${p.id}`, // Fake UID for list key
                        personId: p.id,
                        email: email || '',
                        role: p.role || p.playingRole || 'Player',
                        roles: p.role ? [p.role] : ['Player'], // Initialize roles array
                        assignedSchools: p.assignedSchools || [],
                        teamIds: p.teamIds || [],
                        displayName: p.displayName || `${p.firstName} ${p.lastName}`,
                        status: p.status || 'active',
                        hasAccount: false,
                    } as unknown as UserData);
                }
            });

            return combined;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Get single user
    async getUser(uid: string): Promise<UserData | null> {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return {
                    uid: docSnap.id,
                    personId: docSnap.id,
                    ...docSnap.data()
                } as unknown as UserData;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Update user
    async updateUser(uid: string, data: Partial<UserData>): Promise<void> {
        try {
            // If roles are being updated, ensure role (primary) is included in roles array
            if (data.roles && data.role) {
                if (!data.roles.includes(data.role)) {
                    data.roles = [data.role, ...data.roles];
                }
            }

            // 1. Update User Document (if it's a real user account)
            if (!uid.startsWith('person_')) {
                const docRef = doc(db, 'users', uid);
                await updateDoc(docRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
            }

            // 2. Update Person Document (if linked)
            // If uid starts with person_, the uid IS the personId (minus prefix)
            // If it's a real user, we need to find the linked personId
            let personId = data.personId;

            if (!personId && uid.startsWith('person_')) {
                personId = uid.replace('person_', '');
            } else if (!personId) {
                // Try to find personId from the user doc if not provided
                // This is a simplified check; in a real app we might need to fetch the user doc first
                // But usually we pass the full object or personId in 'data'
            }

            if (personId) {
                const personRef = doc(db, 'people', personId);

                // Filter out fields that shouldn't be in person doc if necessary
                // For now, we update the shared fields
                const personUpdates: any = {};
                if (data.firstName) personUpdates.firstName = data.firstName;
                if (data.lastName) personUpdates.lastName = data.lastName;
                if (data.displayName) personUpdates.displayName = data.displayName;
                if (data.email) personUpdates.email = data.email;
                if (data.role) personUpdates.role = data.role;
                if (data.roles) personUpdates.roles = data.roles;
                if (data.status) personUpdates.status = data.status;
                if (data.assignedSchools) personUpdates.assignedSchools = data.assignedSchools;
                if (data.teamIds) personUpdates.teamIds = data.teamIds;

                await updateDoc(personRef, personUpdates);
            }

        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Delete user (Soft delete or hard delete depending on requirements)
    async deleteUser(uid: string): Promise<void> {
        try {
            // For now, we'll do a hard delete
            await deleteDoc(doc(db, 'users', uid));
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // Invite user (Create invitation record)
    async inviteUser(email: string, role: string, roles?: string[], invitedBy?: string): Promise<string> {
        try {
            const invitationsRef = collection(db, 'invitations');
            const newInvitationRef = doc(invitationsRef);

            // Ensure role is included in roles array
            const finalRoles = roles && roles.length > 0 ? roles : [role];
            if (!finalRoles.includes(role)) {
                finalRoles.unshift(role);
            }

            const invitationData: Omit<InvitationData, 'id'> = {
                email,
                role,
                roles: finalRoles,
                status: 'pending',
                invitedBy,
                createdAt: serverTimestamp(),
            };

            await setDoc(newInvitationRef, invitationData);
            return newInvitationRef.id;
        } catch (error) {
            console.error('Error inviting user:', error);
            throw error;
        }
    },

    // Get pending invitations
    async getPendingInvitations(): Promise<InvitationData[]> {
        try {
            const q = query(
                collection(db, 'invitations'),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as InvitationData));
        } catch (error) {
            console.error('Error fetching invitations:', error);
            throw error;
        }
    }
};
