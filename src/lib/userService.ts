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
    role: string;
    displayName: string;
    photoURL?: string;
    createdAt?: any;
    lastLogin?: any;
}

export interface InvitationData {
    id: string;
    email: string;
    role: string;
    status: 'pending' | 'accepted' | 'expired';
    invitedBy?: string;
    createdAt: any;
}

export const UserService = {
    // Get all users
    async getUsers(): Promise<UserData[]> {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            return snapshot.docs.map(doc => ({
                uid: doc.id,
                personId: doc.id,
                ...doc.data()
            } as unknown as UserData));
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
            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, data);
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
    async inviteUser(email: string, role: string, invitedBy?: string): Promise<string> {
        try {
            const invitationsRef = collection(db, 'invitations');
            const newInvitationRef = doc(invitationsRef);

            const invitationData: Omit<InvitationData, 'id'> = {
                email,
                role,
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
