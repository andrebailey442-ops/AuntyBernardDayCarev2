
'use server';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';

const COLLECTION_NAME = 'students';

export const getStudents = async (): Promise<Student[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const getStudent = async (id: string): Promise<Student | null> => {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const newStudent: Student = { id, status: 'enrolled', ...student };
    await db.collection(COLLECTION_NAME).doc(id).set(newStudent);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    await docRef.update(studentUpdate);
};

export const deleteStudent = async (id: string) => {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
};
