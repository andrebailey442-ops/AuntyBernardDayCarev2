
import type { Subject } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set } from 'firebase/database';
import { SUBJECTS_PATH } from '@/lib/firebase-db';

export const getSubjects = async (): Promise<Subject[]> => {
    const snapshot = await get(ref(db, SUBJECTS_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    return [];
};
