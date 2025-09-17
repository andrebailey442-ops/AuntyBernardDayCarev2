
'use server';

import { getDb } from '@/lib/firebase';
import { USERS, STUDENTS, FEES, SUBJECTS } from '@/lib/data';
import { addUser } from './users';
import { addFee } from './fees';

// This function will check if data exists and initialize it if it doesn't.
// It's a single entry point to avoid multiple checks across different services.
export const initializeData = async () => {
    const db = getDb();
    if (!db) {
        console.log('Database not available for initialization.');
        return;
    }

    const settingsCollection = db.collection('settings');
    const initDoc = await settingsCollection.doc('initialization').get();

    if (initDoc.exists) {
        console.log('Database already initialized.');
        return; // Data is already initialized
    }

    console.log('First time setup: Initializing all collections in Firestore...');

    try {
        // Initialize Users with hashed passwords
        for (const user of USERS) {
           if (user.password) {
             await addUser(user.email!, user.role, user.password, user.avatarUrl, user.username);
           }
        }

        const batch = db.batch();

        // Initialize Students
        STUDENTS.forEach(student => {
            const { id, ...studentData } = student;
            const docRef = db.collection('students').doc(id);
            batch.set(docRef, studentData);
        });

        // Initialize Subjects
        SUBJECTS.forEach(subject => {
            const docRef = db.collection('subjects').doc(subject.id);
            batch.set(docRef, { name: subject.name });
        });

        // Initialize Fees - Use addFee to be consistent, but batching is fine
        FEES.forEach(fee => {
            const { id, ...feeData } = fee;
            const docRef = db.collection('fees').doc(id); // Use specific ID for consistency
            batch.set(docRef, feeData);
        });
        
        // Mark initialization as complete
        const initCompleteRef = settingsCollection.doc('initialization');
        batch.set(initCompleteRef, { completedAt: new Date().toISOString() });
        
        await batch.commit();

        console.log('Firestore data initialization complete.');
    } catch (error) {
        console.error("Error during database initialization:", error);
    }
};
