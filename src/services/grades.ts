
import type { Grade } from '@/lib/types';
import { GRADES } from '@/lib/data';
import { format } from 'date-fns';
import { db } from '@/lib/firebase-client';
import { ref, get, set } from 'firebase/database';
import { GRADES_PATH } from '@/lib/firebase-db';


export const getGrades = async (): Promise<Grade[]> => {
    const snapshot = await get(ref(db, GRADES_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    await set(ref(db, GRADES_PATH), GRADES);
    return GRADES;
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    const allGrades = await getGrades();
    return allGrades.filter(g => g.studentId === studentId);
}

export const upsertGrade = async (studentId: string, subject: string, gradeValue: string) => {
    const gradeId = `${studentId}_${subject}`;
    
    const newGrade: Grade = {
        id: gradeId,
        studentId,
        subject,
        grade: gradeValue as Grade['grade'],
        category: 'daily',
        date: format(new Date(), 'yyyy-MM-dd')
    };

    await set(ref(db, `${GRADES_PATH}/${gradeId}`), newGrade);
};

export const deleteGradesByStudentId = async (studentId: string) => {
    const allGrades = await getGrades();
    const updates: { [key: string]: null } = {};
    allGrades.forEach(g => {
        if (g.studentId === studentId) {
            updates[`${GRADES_PATH}/${g.id}`] = null;
        }
    });
    await set(ref(db), updates);
}
