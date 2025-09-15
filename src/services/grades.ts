
'use server';

import type { Grade } from '@/lib/types';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

const COLLECTION_NAME = 'grades';

export const getGrades = async (): Promise<Grade[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
};

export const upsertGrade = async (studentId: string, subject: string, grade: string) => {
    const gradeId = `${studentId}_${subject}`;
    
    const gradeData: Omit<Grade, 'id'> = {
        studentId,
        subject,
        grade: grade as Grade['grade'],
        category: 'daily',
        date: format(new Date(), 'yyyy-MM-dd'),
    };
    
    await db.collection(COLLECTION_NAME).doc(gradeId).set(gradeData, { merge: true });
};

export const deleteGradesByStudentId = async (studentId: string) => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    if (snapshot.empty) {
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

export const initializeGradesData = async (initialData: Grade[]) => {
    const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
    if (snapshot.empty && initialData.length > 0) {
        console.log('Initializing grades collection...');
        const batch = db.batch();
        initialData.forEach(grade => {
            const { id, ...gradeData } = grade;
            batch.set(db.collection(COLLECTION_NAME).doc(id), gradeData);
        });
        await batch.commit();
    }
};
