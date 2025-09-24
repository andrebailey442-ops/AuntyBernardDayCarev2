

import type { Subject } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set, update } from 'firebase/database';
import { SUBJECTS_PATH } from '@/lib/firebase-db';
import { SUBJECTS } from '@/lib/data';

export const getSubjects = async (): Promise<Subject[]> => {
    const snapshot = await get(ref(db, SUBJECTS_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    // If no subjects exist, populate with sample data
    const updates: { [key: string]: Subject } = {};
    SUBJECTS.forEach(subject => {
        updates[`${SUBJECTS_PATH}/${subject.id}`] = subject;
    });
    await update(ref(db), updates);
    return SUBJECTS;
};
