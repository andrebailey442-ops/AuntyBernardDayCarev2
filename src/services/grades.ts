
'use server';

import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Grade, GradeCategory } from '@/lib/types';
import { format } from 'date-fns';

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

export const upsertGrade = async (studentId: string, subject: string, grade: string) => {
    const gradeId = `${studentId}_${subject}`;
    const gradeDocRef = doc(db, 'grades', gradeId);

    const gradeData: Omit<Grade, 'id'> = {
        studentId,
        subject,
        grade: grade as Grade['grade'],
        category: 'daily', // Defaulting category, can be expanded later
        date: format(new Date(), 'yyyy-MM-dd'),
    };
    
    await setDoc(gradeDocRef, gradeData, { merge: true });
};
