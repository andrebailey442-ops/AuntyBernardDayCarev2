
'use server';

import type { Student } from '@/lib/types';
import { getDb } from '@/lib/firebase';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';
import { deleteAttendanceByStudentId } from './attendance';

export const getStudents = async (): Promise<Student[]> => {
    const db = getDb();
    if (!db) return [];
    const snapshot = await db.collection('students').where('status', '!=', 'graduated').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const getArchivedStudents = async (): Promise<Student[]> => {
    const db = getDb();
    if (!db) return [];
    const snapshot = await db.collection('students').where('status', '==', 'graduated').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}

export const getStudent = async (id: string): Promise<Student | null> => {
    const db = getDb();
    if (!db) return null;
    const doc = await db.collection('students').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() } as Student;
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const db = getDb();
    if (!db) return;
    const status = student.afterCare ? 'enrolled' : 'pending';
    const newStudent = { ...student, status };
    await db.collection('students').doc(id).set(newStudent);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const db = getDb();
    if (!db) return;
    const studentRef = db.collection('students').doc(id);
    await studentRef.update(studentUpdate);
};

export const deleteStudent = async (id: string) => {
    const db = getDb();
    if (!db) return;
    await db.collection('students').doc(id).delete();
    
    // Also delete related data
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
    await deleteAttendanceByStudentId(id);
};
