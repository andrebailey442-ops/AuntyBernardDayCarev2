
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error: any) {
        if (!/already exists/u.test(error.message)) {
            console.error('Firebase admin initialization error', error.stack)
        }
    }
}


export const db = admin.firestore();
