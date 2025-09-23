
import type { Student } from '@/lib/types';
import { STUDENTS, ARCHIVED_STUDENTS } from '@/lib/data';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';
import { deleteAttendanceByStudentId } from './attendance';
import { db } from '@/lib/firebase-client';
import { ref, get, set, update } from 'firebase/database';
import { STUDENTS_PATH, ARCHIVED_STUDENTS_PATH } from '@/lib/firebase-db';


export const getStudents = async (): Promise<Student[]> => {
    const snapshot = await get(ref(db, STUDENTS_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    // If no data, initialize with default and return
    const initialStudents: { [key: string]: Student } = {};
    STUDENTS.forEach(student => {
        initialStudents[student.id] = student;
    });
    await set(ref(db, STUDENTS_PATH), initialStudents);
    return STUDENTS;
};

export const getArchivedStudents = async (): Promise<Student[]> => {
    const snapshot = await get(ref(db, ARCHIVED_STUDENTS_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    const initialArchived: { [key: string]: Student } = {};
    ARCHIVED_STUDENTS.forEach(student => {
        initialArchived[student.id] = student;
    });
    await set(ref(db, ARCHIVED_STUDENTS_PATH), initialArchived);
    return ARCHIVED_STUDENTS;
}

export const getStudent = async (id: string): Promise<Student | null> => {
    let snapshot = await get(ref(db, `${STUDENTS_PATH}/${id}`));
    if (snapshot.exists()) {
        return snapshot.val();
    }
    snapshot = await get(ref(db, `${ARCHIVED_STUDENTS_PATH}/${id}`));
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id' | 'status'>) => {
    const newStudent: Student = {
        ...student,
        id,
        status: 'enrolled',
    };
    await set(ref(db, `${STUDENTS_PATH}/${id}`), newStudent);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const studentRef = ref(db, `${STUDENTS_PATH}/${id}`);
    const archivedStudentRef = ref(db, `${ARCHIVED_STUDENTS_PATH}/${id}`);

    const snapshot = await get(studentRef);
    if (snapshot.exists()) {
        // If student is being graduated
        if (studentUpdate.status === 'graduated') {
            const studentToGraduate = { ...snapshot.val(), ...studentUpdate };
            const updates: { [key: string]: any } = {};
            updates[`${STUDENTS_PATH}/${id}`] = null;
            updates[`${ARCHIVED_STUDENTS_PATH}/${id}`] = studentToGraduate;
            await update(ref(db), updates);
        } else {
            await update(studentRef, studentUpdate);
        }
    } else {
        await update(archivedStudentRef, studentUpdate);
    }
};

export const deleteStudent = async (id: string) => {
    await set(ref(db, `${STUDENTS_PATH}/${id}`), null);
    
    // Also delete related data
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
    await deleteAttendanceByStudentId(id);
};
