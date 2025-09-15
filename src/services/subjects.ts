
'use server';

import type { Subject } from '@/lib/types';
import { SUBJECTS } from '@/lib/data';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'subjects';

export const getSubjects = async (): Promise<Subject[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
};

export const initializeSubjectsData = async () => {
    const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
    if (snapshot.empty) {
        console.log('Initializing subjects collection...');
        const batch = db.batch();
        SUBJECTS.forEach(subject => {
            batch.set(db.collection(COLLECTION_NAME).doc(subject.id), { name: subject.name });
        });
        await batch.commit();
    }
};
