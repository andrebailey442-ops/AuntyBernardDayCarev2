
'use server';

import { db } from '@/lib/firebase';
import type { Grade } from '@/lib/types';
import { format } from 'date-fns';

const COLLECTION_NAME = 'grades';

export const getGrades = async (): Promise<Grade[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => doc.data() as Grade);
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    return snapshot.docs.map(doc => doc.data() as Grade);
};

export const upsertGrade = async (studentId: string, subject: string, grade: string) => {
    const gradeId = `${studentId}_${subject}`;
    const docRef = db.collection(COLLECTION_NAME).doc(gradeId);

    const gradeData: Omit<Grade, 'id'> & { id: string } = {
        id: gradeId,
        studentId,
        subject,
        grade: grade as Grade['grade'],
        category: 'daily', // Defaulting category
        date: format(new Date(), 'yyyy-MM-dd'),
    };
    
    await docRef.set(gradeData, { merge: true });
};

export const deleteGradesByStudentId = async (studentId: string) => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};
