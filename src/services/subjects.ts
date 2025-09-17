
'use server';

import type { Subject } from '@/lib/types';
import { db } from '@/lib/firebase';
import { SUBJECTS } from '@/lib/data';

export const getSubjects = async (): Promise<Subject[]> => {
    if (!db) return SUBJECTS;
    
    const snapshot = await db.collection('subjects').get();
    if (snapshot.empty) {
        // Initialize subjects if they don't exist
        const batch = db.batch();
        SUBJECTS.forEach(subject => {
            const docRef = db.collection('subjects').doc(subject.id);
            batch.set(docRef, { name: subject.name });
        });
        await batch.commit();
        return SUBJECTS;
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
};
