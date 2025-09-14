
'use server';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Grade } from '@/lib/types';

export const getGrades = async (): Promise<Grade[]> => {
    const gradesCol = collection(db, 'grades');
    const gradeSnapshot = await getDocs(gradesCol);
    const gradeList = gradeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    return gradeList;
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    const gradesCol = collection(db, 'grades');
    const q = query(gradesCol, where("studentId", "==", studentId));
    const gradeSnapshot = await getDocs(q);
    const gradeList = gradeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    return gradeList;
};
