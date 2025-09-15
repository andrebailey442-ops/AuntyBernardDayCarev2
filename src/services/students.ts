
import type { Student } from '@/lib/types';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';

const COLLECTION_NAME = 'students';
const ARCHIVED_COLLECTION_NAME = 'archived_students';

const getStudentsFromStorage = (): Student[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COLLECTION_NAME);
    return data ? JSON.parse(data) : [];
};

const getArchivedStudentsFromStorage = (): Student[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(ARCHIVED_COLLECTION_NAME);
    return data ? JSON.parse(data) : [];
};

const saveStudentsToStorage = (data: Student[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(data));
};

const saveArchivedStudentsToStorage = (data: Student[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ARCHIVED_COLLECTION_NAME, JSON.stringify(data));
}

export const initializeStudentsData = (initialData: Student[]) => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(COLLECTION_NAME)) {
        saveStudentsToStorage(initialData);
    }
    if (!localStorage.getItem(ARCHIVED_COLLECTION_NAME)) {
        localStorage.setItem(ARCHIVED_COLLECTION_NAME, JSON.stringify([]));
    }
};

export const getStudents = async (): Promise<Student[]> => {
    return getStudentsFromStorage();
};

export const getArchivedStudents = async (): Promise<Student[]> => {
    return getArchivedStudentsFromStorage();
}

export const getStudent = async (id: string): Promise<Student | null> => {
    const allStudents = getStudentsFromStorage();
    const student = allStudents.find(s => s.id === id);
    if (student) return student;

    const archivedStudents = getArchivedStudentsFromStorage();
    return archivedStudents.find(s => s.id === id) || null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const allStudents = getStudentsFromStorage();
    const newStudent: Student = { id, status: 'pending', ...student };
    allStudents.push(newStudent);
    saveStudentsToStorage(allStudents);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    let allStudents = getStudentsFromStorage();
    const studentIndex = allStudents.findIndex(s => s.id === id);

    if (studentIndex > -1) {
        if (studentUpdate.status === 'graduated') {
            const studentToArchive = allStudents[studentIndex];
            studentToArchive.status = 'graduated';
            
            // Remove from active students
            allStudents.splice(studentIndex, 1);
            saveStudentsToStorage(allStudents);
            
            // Add to archived students
            const archivedStudents = getArchivedStudentsFromStorage();
            archivedStudents.push(studentToArchive);
            saveArchivedStudentsToStorage(archivedStudents);

        } else {
            allStudents[studentIndex] = { ...allStudents[studentIndex], ...studentUpdate };
            saveStudentsToStorage(allStudents);
        }
    }
};

export const deleteStudent = async (id: string) => {
    let allStudents = getStudentsFromStorage();
    const updatedStudents = allStudents.filter(s => s.id !== id);
    saveStudentsToStorage(updatedStudents);
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
};
