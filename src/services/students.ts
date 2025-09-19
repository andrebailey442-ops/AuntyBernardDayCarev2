

import type { Student, Guardian } from '@/lib/types';
import { STUDENTS, ARCHIVED_STUDENTS } from '@/lib/data';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';
import { deleteAttendanceByStudentId } from './attendance';

const STUDENTS_STORAGE_KEY = 'students';
const ARCHIVED_STUDENTS_STORAGE_KEY = 'archivedStudents';

const getStoredStudents = (): Student[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STUDENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : STUDENTS;
};

const setStoredStudents = (students: Student[]) => {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
};

const getStoredArchivedStudents = (): Student[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(ARCHIVED_STUDENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : ARCHIVED_STUDENTS;
};

const setStoredArchivedStudents = (students: Student[]) => {
    localStorage.setItem(ARCHIVED_STUDENTS_STORAGE_KEY, JSON.stringify(students));
};


export const getStudents = (): Student[] => {
    const allStudents = getStoredStudents();
    return allStudents.filter(s => s.status !== 'graduated');
};

export const getArchivedStudents = (): Student[] => {
    return getStoredArchivedStudents();
}

export const getStudent = (id: string): Student | null => {
    const allStudents = getStoredStudents();
    const archivedStudents = getStoredArchivedStudents();
    return allStudents.find(s => s.id === id) || archivedStudents.find(s => s.id === id) || null;
}

export const addStudent = (id: string, student: Omit<Student, 'id' | 'status'>) => {
    const students = getStoredStudents();
    const status = (student.afterCare || student.preschool) ? 'enrolled' : 'pending';
    
    const newStudent: Student = {
        ...student,
        id,
        status,
    };
    students.push(newStudent);
    setStoredStudents(students);
};

export const updateStudent = (id: string, studentUpdate: Partial<Student>) => {
    if (studentUpdate.status === 'graduated') {
        const students = getStoredStudents();
        const studentToGraduate = students.find(s => s.id === id);
        if (studentToGraduate) {
            const updatedStudent = { ...studentToGraduate, ...studentUpdate };
            const remainingStudents = students.filter(s => s.id !== id);
            setStoredStudents(remainingStudents);
            
            const archived = getStoredArchivedStudents();
            archived.push(updatedStudent);
            setStoredArchivedStudents(archived);
        }
    } else {
        const students = getStoredStudents();
        const index = students.findIndex(s => s.id === id);
        if (index > -1) {
            students[index] = { ...students[index], ...studentUpdate };
            setStoredStudents(students);
        }
    }
};

export const deleteStudent = (id: string) => {
    let students = getStoredStudents();
    students = students.filter(s => s.id !== id);
    setStoredStudents(students);
    
    // Also delete related data
    deleteFeeByStudentId(id);
    deleteGradesByStudentId(id);
    deleteAttendanceByStudentId(id);
};
