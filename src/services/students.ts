
'use server';
import type { Student } from '@/lib/types';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';

const COLLECTION_NAME = 'students';

const getStudentsFromStorage = (): Student[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COLLECTION_NAME);
    return data ? JSON.parse(data) : [];
};

const saveStudentsToStorage = (data: Student[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(data));
};

export const initializeStudentsData = (initialData: Student[]) => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(COLLECTION_NAME)) {
        saveStudentsToStorage(initialData);
    }
};

export const getStudents = async (): Promise<Student[]> => {
    return getStudentsFromStorage();
};

export const getStudent = async (id: string): Promise<Student | null> => {
    const allStudents = getStudentsFromStorage();
    return allStudents.find(s => s.id === id) || null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const allStudents = getStudentsFromStorage();
    const newStudent: Student = { id, status: 'enrolled', ...student };
    allStudents.push(newStudent);
    saveStudentsToStorage(allStudents);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    let allStudents = getStudentsFromStorage();
    const studentIndex = allStudents.findIndex(s => s.id === id);
    if (studentIndex > -1) {
        allStudents[studentIndex] = { ...allStudents[studentIndex], ...studentUpdate };
        saveStudentsToStorage(allStudents);
    }
};

export const deleteStudent = async (id: string) => {
    let allStudents = getStudentsFromStorage();
    const updatedStudents = allStudents.filter(s => s.id !== id);
    saveStudentsToStorage(updatedStudents);
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
};
