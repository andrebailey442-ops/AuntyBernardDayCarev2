import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';
import { STUDENTS } from '@/lib/data';
import { deleteFeeByStudentId } from './fees';

const COLLECTION_NAME = 'students';

export const initializeStudentData = async () => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        STUDENTS.forEach(item => {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
    }
}

export const getStudents = async (): Promise<Student[]> => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const getStudent = async (id: string): Promise<Student | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const newStudent: Student = { id, status: 'enrolled', ...student };
    await setDoc(doc(db, COLLECTION_NAME, id), newStudent);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, studentUpdate);
};

export const deleteStudent = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    await deleteFeeByStudentId(id);
};
