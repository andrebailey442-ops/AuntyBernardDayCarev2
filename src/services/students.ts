
'use client';

import type { Student } from '@/lib/types';
import { STUDENTS } from '@/lib/data';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';
import { deleteAttendanceByStudentId } from './attendance';

const STUDENTS_STORAGE_KEY = 'students';
const ARCHIVED_STUDENTS_STORAGE_KEY = 'archived_students';

const getStudentsFromStorage = (key: string, defaultData: Student[]): Student[] => {
    if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            localStorage.setItem(key, JSON.stringify(defaultData));
            return defaultData;
        }
    }
    return defaultData;
}

const saveStudentsToStorage = (key: string, students: Student[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(students));
    }
}

export const getStudents = async (): Promise<Student[]> => {
    return getStudentsFromStorage(STUDENTS_STORAGE_KEY, STUDENTS);
};

export const getArchivedStudents = async (): Promise<Student[]> => {
    return getStudentsFromStorage(ARCHIVED_STUDENTS_STORAGE_KEY, []);
}

export const getStudent = async (id: string): Promise<Student | null> => {
    const allStudents = await getStudents();
    const archivedStudents = await getArchivedStudents();
    return allStudents.find(s => s.id === id) || archivedStudents.find(s => s.id === id) || null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const allStudents = getStudentsFromStorage(STUDENTS_STORAGE_KEY, STUDENTS);
    const newStudent = { id, ...student, status: 'pending' } as Student;
    allStudents.push(newStudent);
    saveStudentsToStorage(STUDENTS_STORAGE_KEY, allStudents);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    let allStudents = getStudentsFromStorage(STUDENTS_STORAGE_KEY, STUDENTS);
    const studentIndex = allStudents.findIndex(s => s.id === id);

    if (studentIndex !== -1) {
        const studentToUpdate = { ...allStudents[studentIndex], ...studentUpdate };
        
        if (studentToUpdate.status === 'graduated') {
            allStudents.splice(studentIndex, 1);
            saveStudentsToStorage(STUDENTS_STORAGE_KEY, allStudents);

            const archivedStudents = getStudentsFromStorage(ARCHIVED_STUDENTS_STORAGE_KEY, []);
            archivedStudents.push(studentToUpdate as Student);
            saveStudentsToStorage(ARCHIVED_STUDENTS_STORAGE_KEY, archivedStudents);
        } else {
            allStudents[studentIndex] = studentToUpdate as Student;
            saveStudentsToStorage(STUDENTS_STORAGE_KEY, allStudents);
        }
    }
};

export const deleteStudent = async (id: string) => {
    let allStudents = getStudentsFromStorage(STUDENTS_STORAGE_KEY, STUDENTS);
    allStudents = allStudents.filter(s => s.id !== id);
    saveStudentsToStorage(STUDENTS_STORAGE_KEY, allStudents);
    
    // Also delete related data
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
    await deleteAttendanceByStudentId(id);
};
