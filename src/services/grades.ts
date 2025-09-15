
'use client';

import type { Grade } from '@/lib/types';
import { GRADES } from '@/lib/data';
import { format } from 'date-fns';

const GRADES_STORAGE_KEY = 'grades';

const getGradesFromStorage = (): Grade[] => {
    if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem(GRADES_STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(GRADES));
            return GRADES;
        }
    }
    return GRADES;
}

const saveGradesToStorage = (grades: Grade[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades));
    }
}

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

    if (existingIndex !== -1) {
        allGrades[existingIndex].grade = grade as Grade['grade'];
    } else {
        const newGrade: Grade = {
            id: gradeId,
            studentId,
            subject,
            grade: grade as Grade['grade'],
            category: 'daily',
            date: format(new Date(), 'yyyy-MM-dd'),
        };
        allGrades.push(newGrade);
    }
    
    saveGradesToStorage(allGrades);
};


export const deleteGradesByStudentId = async (studentId: string) => {
    let allGrades = getGradesFromStorage();
    allGrades = allGrades.filter(g => g.studentId !== studentId);
    saveGradesToStorage(allGrades);
};
