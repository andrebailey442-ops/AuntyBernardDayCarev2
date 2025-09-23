
import type { Student } from '@/lib/types';
import { STUDENTS, ARCHIVED_STUDENTS } from '@/lib/data';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';
import { deleteAttendanceByStudentId } from './attendance';


const STUDENTS_STORAGE_KEY = 'students';
const ARCHIVED_STUDENTS_STORAGE_KEY = 'archived_students';

export const getStudents = (): Student[] => {
    if (typeof window === 'undefined') return [];
    
    const storedStudents = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (storedStudents) {
        return JSON.parse(storedStudents);
    }
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(STUDENTS));
    return STUDENTS;
};

export const getArchivedStudents = (): Student[] => {
    if (typeof window === 'undefined') return [];
    
    const storedArchived = localStorage.getItem(ARCHIVED_STUDENTS_STORAGE_KEY);
    if (storedArchived) {
        return JSON.parse(storedArchived);
    }
    localStorage.setItem(ARCHIVED_STUDENTS_STORAGE_KEY, JSON.stringify(ARCHIVED_STUDENTS));
    return ARCHIVED_STUDENTS;
}

export const getStudent = (id: string): Student | null => {
    const allStudents = [...getStudents(), ...getArchivedStudents()];
    return allStudents.find(s => s.id === id) || null;
}

export const addStudent = (id: string, student: Omit<Student, 'id' | 'status'>) => {
    const allStudents = getStudents();
    const newStudent: Student = {
        ...student,
        id,
        status: 'enrolled',
    };
    allStudents.push(newStudent);
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(allStudents));
};

export const updateStudent = (id: string, studentUpdate: Partial<Student>) => {
    let allStudents = getStudents();
    let allArchived = getArchivedStudents();
    
    let studentIndex = allStudents.findIndex(s => s.id === id);
    if (studentIndex > -1) {
        // If student is being graduated
        if (studentUpdate.status === 'graduated') {
            const studentToGraduate = { ...allStudents[studentIndex], ...studentUpdate };
            allStudents.splice(studentIndex, 1);
            allArchived.push(studentToGraduate);
        } else {
            allStudents[studentIndex] = { ...allStudents[studentIndex], ...studentUpdate };
        }
    } else {
        studentIndex = allArchived.findIndex(s => s.id === id);
        if (studentIndex > -1) {
            allArchived[studentIndex] = { ...allArchived[studentIndex], ...studentUpdate };
        }
    }
    
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(allStudents));
    localStorage.setItem(ARCHIVED_STUDENTS_STORAGE_KEY, JSON.stringify(allArchived));
};

export const deleteStudent = (id: string) => {
    let allStudents = getStudents();
    allStudents = allStudents.filter(s => s.id !== id);
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(allStudents));
    
    // Also delete related data
    deleteFeeByStudentId(id);
    deleteGradesByStudentId(id);
    deleteAttendanceByStudentId(id);
};
