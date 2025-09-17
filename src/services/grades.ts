
'use server';

import type { Grade } from '@/lib/types';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export const getGrades = async (): Promise<Grade[]> => {
    if (!db) return [];
    const snapshot = await db.collection('grades').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    if (!db) return [];
    const snapshot = await db.collection('grades').where('studentId', '==', studentId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
};

export const upsertGrade = async (studentId: string, subject: string, grade: string) => {
    if (!db) return;
    const gradeId = `${studentId}_${subject}`;
    const gradeRef = db.collection('grades').doc(gradeId);
    
    const newGrade: Partial<Grade> = {
        studentId,
        subject,
        grade: grade as Grade['grade'],
        category: 'daily',
        date: format(new Date(), 'yyyy-MM-dd'),
    };

    await gradeRef.set(newGrade, { merge: true });
};


export const deleteGradesByStudentId = async (studentId: string) => {
    if (!db) return;
    const snapshot = await db.collection('grades').where('studentId', '==', studentId).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};
