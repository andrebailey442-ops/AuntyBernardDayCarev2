
import type { Grade } from '@/lib/types';
import { format } from 'date-fns';
import { db } from '@/lib/firebase-client';
import { ref, get, set, remove } from 'firebase/database';
import { GRADES_PATH } from '@/lib/firebase-db';

export const getGrades = async (): Promise<Grade[]> => {
    const gradesRef = ref(db, GRADES_PATH);
    const snapshot = await get(gradesRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    return [];
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    const allGrades = await getGrades();
    return allGrades.filter(g => g.studentId === studentId);
};

export const upsertGrade = async (studentId: string, subject: string, gradeValue: string) => {
    const gradeId = `${studentId}_${subject}`;
    const gradeRef = ref(db, `${GRADES_PATH}/${gradeId}`);

    const newGrade: Grade = {
        id: gradeId,
        studentId,
        subject,
        grade: gradeValue as Grade['grade'],
        category: 'daily',
        date: format(new Date(), 'yyyy-MM-dd'),
    };
    
    await set(gradeRef, newGrade);
};

export const deleteGradesByStudentId = async (studentId: string) => {
    const allGrades = await getGrades();
    const gradesToDelete = allGrades.filter(g => g.studentId === studentId);
    
    const promises = gradesToDelete.map(g => {
        const gradeRef = ref(db, `${GRADES_PATH}/${g.id}`);
        return remove(gradeRef);
    });

    await Promise.all(promises);
};
