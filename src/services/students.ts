
'use server';

import type { Student } from '@/lib/types';
import { db } from '@/lib/firebase';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';
import { deleteAttendanceByStudentId } from './attendance';

const COLLECTION_NAME = 'students';
const ARCHIVED_COLLECTION_NAME = 'archived_students';


export const getStudents = async (): Promise<Student[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const getArchivedStudents = async (): Promise<Student[]> => {
    const snapshot = await db.collection(ARCHIVED_COLLECTION_NAME).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}

export const getStudent = async (id: string): Promise<Student | null> => {
    let doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Student;
    }
    
    doc = await db.collection(ARCHIVED_COLLECTION_NAME).doc(id).get();
    if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Student;
    }

    return null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const newStudentData = { ...student, status: 'pending' };
    await db.collection(COLLECTION_NAME).doc(id).set(newStudentData);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const studentRef = db.collection(COLLECTION_NAME).doc(id);
    const studentDoc = await studentRef.get();

    if (studentDoc.exists) {
        if (studentUpdate.status === 'graduated') {
            const studentToArchive = { ...studentDoc.data(), ...studentUpdate } as Student;

            // Add to archived students and delete from active students in a batch
            const batch = db.batch();
            const archiveRef = db.collection(ARCHIVED_COLLECTION_NAME).doc(id);
            batch.set(archiveRef, studentToArchive);
            batch.delete(studentRef);
            await batch.commit();
        } else {
            await studentRef.update(studentUpdate);
        }
    }
};

export const deleteStudent = async (id: string) => {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    // Also delete related data
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
    await deleteAttendanceByStudentId(id);
};

export const initializeStudentsData = async (initialData: Student[]) => {
    const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
    if (snapshot.empty && initialData.length > 0) {
        console.log('Initializing students collection...');
        const batch = db.batch();
        initialData.forEach(student => {
            const { id, ...studentData } = student;
            batch.set(db.collection(COLLECTION_NAME).doc(id), studentData);
        });
        await batch.commit();
    }
};
