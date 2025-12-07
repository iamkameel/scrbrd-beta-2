'use server';

import { adminDb } from '@/lib/firebase-admin';
import { Trip, Vehicle } from '@/types/firestore';

export async function getDriverTripsAction(driverEmail: string) {
    try {
        const peopleRef = adminDb.collection('people');
        const personSnapshot = await peopleRef.where('email', '==', driverEmail).limit(1).get();

        if (personSnapshot.empty) return [];

        const person = personSnapshot.docs[0].data();
        const driverName = `${person.firstName} ${person.lastName}`;

        // Also try to match by exact name or partial?
        // For now exact match on driverName field.
        const tripsRef = adminDb.collection('trips');
        const snapshot = await tripsRef.where('driverName', '==', driverName).get();

        const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Trip));

        // Sort by date
        return trips.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
        console.error('Error fetching driver trips:', error);
        return [];
    }
}

export async function getAllVehiclesAction() {
    try {
        const vehiclesRef = adminDb.collection('vehicles');
        const snapshot = await vehiclesRef.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Vehicle));
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return [];
    }
}

export async function getVehicleByIdAction(vehicleId: string) {
    try {
        const doc = await adminDb.collection('vehicles').doc(vehicleId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() } as unknown as Vehicle;
        }
        return null;
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        return null;
    }
}
