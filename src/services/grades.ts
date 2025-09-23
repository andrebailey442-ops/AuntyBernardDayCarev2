
import type { Grade } from '@/lib/types';
import { GRADES } from '@/lib/data';
import { format } from 'date-fns';

const GRADES_STORAGE_KEY = 'grades';

export const getGrades = (): Grade[] => {
    if (typeof window === 'undefined') return [];
    
    const storedGrades = localStorage.getItem(GRADES_STORAGE_KEY);
    if (storedGrades) {
        return JSON.parse(storedGrades);
    }
    localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(GRADES));
    return GRADES;
};

export const getGradesByStudent = (studentId: string): Grade[] => {
    const allGrades = getGrades();
    return allGrades.filter(g => g.studentId === studentId);
}

export const upsertGrade = (studentId: string, subject: string, gradeValue: string) => {
    const allGrades = getGrades();
    const gradeId = `${studentId}_${subject}`;
    
    const existingIndex = allGrades.findIndex(g => g.id === gradeId);

    if (existingIndex > -1) {
        allGrades[existingIndex].grade = gradeValue as Grade['grade'];
    } else {
        allGrades.push({
            id: gradeId,
            studentId,
            subject,
            grade: gradeValue as Grade['grade'],
            category: 'daily',
            date: format(new Date(), 'yyyy-MM-dd')
        });
    }

    localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(allGrades));
};

export const deleteGradesByStudentId = (studentId: string) => {
    let allGrades = getGrades();
    allGrades = allGrades.filter(g => g.studentId !== studentId);
    localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(allGrades));
}
