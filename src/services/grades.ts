import type { Grade } from '@/lib/types';
import { format } from 'date-fns';
import { getFromLocalStorage, saveToLocalStorage, initializeLocalStorage } from '@/lib/local-storage';
import { GRADES } from '@/lib/data';

const STORAGE_KEY = 'grades';

export const initializeGradeData = () => {
    initializeLocalStorage(STORAGE_KEY, GRADES);
}

export const getGrades = async (): Promise<Grade[]> => {
    return getFromLocalStorage<Grade>(STORAGE_KEY);
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    const allGrades = await getGrades();
    return allGrades.filter(g => g.studentId === studentId);
};

export const upsertGrade = async (studentId: string, subject: string, grade: string) => {
    const allGrades = await getGrades();
    const gradeId = `${studentId}_${subject}`;
    const existingIndex = allGrades.findIndex(g => g.id === gradeId);

    const gradeData = {
        studentId,
        subject,
        grade: grade as Grade['grade'],
        category: 'daily', // Defaulting category
        date: format(new Date(), 'yyyy-MM-dd'),
    };
    
    if (existingIndex > -1) {
        allGrades[existingIndex] = { ...allGrades[existingIndex], ...gradeData };
    } else {
        const newGrade: Grade = {
            id: gradeId,
            ...gradeData,
            notes: ''
        }
        allGrades.push(newGrade);
    }
    
    saveToLocalStorage(STORAGE_KEY, allGrades);
};
