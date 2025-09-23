
import type { Student } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set, remove } from 'firebase/database';
import { STUDENTS_PATH, ARCHIVED_STUDENTS_PATH } from '@/lib/firebase-db';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';
import { deleteAttendanceByStudentId } from './attendance';

const getStudentsFromPath = async (path: string): Promise<Student[]> => {
    const studentsRef = ref(db, path);
    const snapshot = await get(studentsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

export const getStudents = async (): Promise<Student[]> => {
    return getStudentsFromPath(STUDENTS_PATH);
};

export const getArchivedStudents = async (): Promise<Student[]> => {
    return getStudentsFromPath(ARCHIVED_STUDENTS_PATH);
}

export const getStudent = async (id: string): Promise<Student | null> => {
    let studentRef = ref(db, `${STUDENTS_PATH}/${id}`);
    let snapshot = await get(studentRef);

    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }

    studentRef = ref(db, `${ARCHIVED_STUDENTS_PATH}/${id}`);
    snapshot = await get(studentRef);
    if(snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    
    return null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id' | 'status'>) => {
    const studentRef = ref(db, `${STUDENTS_PATH}/${id}`);
    const newStudent: Student = {
        ...student,
        id,
        status: 'enrolled',
    };
    await set(studentRef, newStudent);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const studentRef = ref(db, `${STUDENTS_PATH}/${id}`);
    const snapshot = await get(studentRef);

    if (snapshot.exists()) {
        const currentData = snapshot.val();
        if (studentUpdate.status === 'graduated') {
            const updatedStudent = { ...currentData, ...studentUpdate, id };
            const archivedStudentRef = ref(db, `${ARCHIVED_STUDENTS_PATH}/${id}`);
            await set(archivedStudentRef, updatedStudent);
            await remove(studentRef);
        } else {
            await set(studentRef, { ...currentData, ...studentUpdate });
        }
    } else {
        // Handle case where student might be in archives and is being updated
        const archivedStudentRef = ref(db, `${ARCHIVED_STUDENTS_PATH}/${id}`);
        const archivedSnapshot = await get(archivedStudentRef);
        if (archivedSnapshot.exists()) {
            const currentData = archivedSnapshot.val();
            await set(archivedStudentRef, { ...currentData, ...studentUpdate });
        }
    }
};

export const deleteStudent = async (id: string) => {
    const studentRef = ref(db, `${STUDENTS_PATH}/${id}`);
    await remove(studentRef);
    
    // Also delete related data
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
    await deleteAttendanceByStudentId(id);
};
