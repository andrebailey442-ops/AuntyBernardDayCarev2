
'use server';

import { db } from '@/lib/firebase';
import type { Subject } from '@/lib/types';
import { SUBJECTS } from '@/lib/data';

const COLLECTION_NAME = 'subjects';

export const getSubjects = async (): Promise<Subject[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.empty) {
        const batch = db.batch();
        SUBJECTS.forEach(item => {
            const docRef = db.collection(COLLECTION_NAME).doc(item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
        return SUBJECTS;
    }
    return snapshot.docs.map(doc => doc.data() as Subject);
};
