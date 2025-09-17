
import type { Grade } from '@/lib/types';
import { format } from 'date-fns';

const GRADES_STORAGE_KEY = 'grades';

const getStoredGrades = (): Grade[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(GRADES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const setStoredGrades = (grades: Grade[]) => {
    localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades));
};

export const getGrades = (): Grade[] => {
    return getStoredGrades();
};

export const getGradesByStudent = (studentId: string): Grade[] => {
    const allGrades = getStoredGrades();
    return allGrades.filter(g => g.studentId === studentId);
};

export const upsertGrade = (studentId: string, subject: string, gradeValue: string) => {
    const allGrades = getStoredGrades();
    const gradeId = `${studentId}_${subject}`;
    const existingIndex = allGrades.findIndex(g => g.id === gradeId);

    if (existingIndex > -1) {
        allGrades[existingIndex].grade = gradeValue as Grade['grade'];
    } else {
        const newGrade: Grade = {
            id: gradeId,
            studentId,
            subject,
            grade: gradeValue as Grade['grade'],
            category: 'daily',
            date: format(new Date(), 'yyyy-MM-dd'),
        };
        allGrades.push(newGrade);
    }

    setStoredGrades(allGrades);
};

export const deleteGradesByStudentId = (studentId: string) => {
    let allGrades = getStoredGrades();
    allGrades = allGrades.filter(g => g.studentId !== studentId);
    setStoredGrades(allGrades);
};
