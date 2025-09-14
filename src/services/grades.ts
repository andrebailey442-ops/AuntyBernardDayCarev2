
'use server';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Grade } from '@/lib/types';

export const getGrades = async (): Promise<Grade[]> => {
    const gradesCol = collection(db, 'grades');
    const gradeSnapshot = await getDocs(gradesCol);
    const gradeList = gradeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    return gradeList;
};
