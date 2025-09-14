
'use server';

import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';

export const getStudents = async (): Promise<Student[]> => {
    const studentsCol = collection(db, 'students');
    const studentSnapshot = await getDocs(studentsCol);
    const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    return studentList;
};

export const getStudent = async (id: string): Promise<Student | null> => {
    const studentDocRef = doc(db, 'students', id);
    const studentSnap = await getDoc(studentDocRef);
    if (studentSnap.exists()) {
        return { id: studentSnap.id, ...studentSnap.data() } as Student;
    }
    return null;
}

export const addStudent = async (student: Omit<Student, 'id'>) => {
    const studentsCol = collection(db, 'students');
    const docRef = await addDoc(studentsCol, student);
    return docRef.id;
};

export const updateStudent = async (id: string, student: Partial<Student>) => {
    const studentDoc = doc(db, 'students', id);
    await updateDoc(studentDoc, student);
};

export const deleteStudent = async (id: string) => {
    const studentDoc = doc(db, 'students', id);
    await deleteDoc(studentDoc);
};
