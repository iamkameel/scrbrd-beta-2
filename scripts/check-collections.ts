
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();

async function checkCollections() {
    try {
        const usersSnap = await db.collection('users').count().get();
        const peopleSnap = await db.collection('people').count().get();

        console.log(`Users count: ${usersSnap.data().count}`);
        console.log(`People count: ${peopleSnap.data().count}`);

        // Also list a few IDs from each to see if they match
        const users = await db.collection('users').limit(5).get();
        const people = await db.collection('people').limit(5).get();

        console.log('Sample User IDs:', users.docs.map(d => d.id));
        console.log('Sample People IDs:', people.docs.map(d => d.id));

    } catch (error) {
        console.error('Error checking collections:', error);
    }
}

checkCollections();
