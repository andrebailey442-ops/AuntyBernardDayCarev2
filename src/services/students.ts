
'use server';

import type { Student } from '@/lib/types';
import { getFromLocalStorage, saveToLocalStorage, initializeLocalStorage } from '@/lib/local-storage';
import { STUDENTS } from '@/lib/data';
import { deleteFeeByStudentId } from './fees';

const STORAGE_KEY = 'students';

// Initialize with seed data if it doesn't exist
initializeLocalStorage(STORAGE_KEY, STUDENTS);


export const getStudents = async (): Promise<Student[]> => {
    return getFromLocalStorage<Student>(STORAGE_KEY);
};

export const getStudent = async (id: string): Promise<Student | null> => {
    const allStudents = await getStudents();
    return allStudents.find(s => s.id === id) || null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const allStudents = await getStudents();
    const newStudent: Student = { id, ...student };
    allStudents.push(newStudent);
    saveToLocalStorage(STORAGE_KEY, allStudents);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    let allStudents = await getStudents();
    const studentIndex = allStudents.findIndex(s => s.id === id);
    if (studentIndex > -1) {
        allStudents[studentIndex] = { ...allStudents[studentIndex], ...studentUpdate };
        saveToLocalStorage(STORAGE_KEY, allStudents);
    } else {
        throw new Error(`Student with id ${id} not found.`);
    }
};

export const deleteStudent = async (id: string) => {
    let allStudents = await getStudents();
    const updatedStudents = allStudents.filter(s => s.id !== id);
    saveToLocalStorage(STORAGE_KEY, updatedStudents);

    // Also remove related data
    // This part needs other services to expose deletion functions
    // For now, we'll imagine they exist and call them
    // e.g. await deleteGradesByStudentId(id);
    // e.g. await deleteAttendanceByStudentId(id);
    // e.g. await deleteFeeByStudentId(id);
};
