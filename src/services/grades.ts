import type { Grade } from '@/lib/types';
import { format } from 'date-fns';

const COLLECTION_NAME = 'grades';

const getGradesFromStorage = (): Grade[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COLLECTION_NAME);
    return data ? JSON.parse(data) : [];
};

const saveGradesToStorage = (data: Grade[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(data));
};

export const initializeGradesData = (initialData: Grade[]) => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(COLLECTION_NAME)) {
        saveGradesToStorage(initialData);
    }
};

export const getGrades = async (): Promise<Grade[]> => {
    return getGradesFromStorage();
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    const allGrades = getGradesFromStorage();
    return allGrades.filter(g => g.studentId === studentId);
};

export const upsertGrade = async (studentId: string, subject: string, grade: string) => {
    const allGrades = getGradesFromStorage();
    const gradeId = `${studentId}_${subject}`;
    
    const existingIndex = allGrades.findIndex(g => g.id === gradeId);

    const gradeData: Grade = {
        id: gradeId,
        studentId,
        subject,
        grade: grade as Grade['grade'],
        category: 'daily', // Defaulting category
        date: format(new Date(), 'yyyy-MM-dd'),
    };
    
    if (existingIndex > -1) {
        allGrades[existingIndex] = gradeData;
    } else {
        allGrades.push(gradeData);
    }
    saveGradesToStorage(allGrades);
};

export const deleteGradesByStudentId = async (studentId: string) => {
    let allGrades = getGradesFromStorage();
    const updatedGrades = allGrades.filter(g => g.studentId !== studentId);
    saveGradesToStorage(updatedGrades);
};