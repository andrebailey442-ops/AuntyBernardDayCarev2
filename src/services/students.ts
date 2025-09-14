
'use server';

import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';

export const getStudents = async (): Promise<Student[]> => {
    const studentsCol = collection(db, 'students');
    const studentSnapshot = await getDocs(studentsCol);
    const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    return studentList;
};

export const getStudent = async (id: string): Promise<Student | null> => {
    try {
        const studentDocRef = doc(db, 'students', id);
        const studentSnap = await getDoc(studentDocRef);
        if (studentSnap.exists()) {
            return { id: studentSnap.id, ...studentSnap.data() } as Student;
        }
        return null;
    } catch (error) {
        console.error("Error fetching student:", error);
        return null;
    }
}

export const addStudent = async (id: string, student: Omit<Student, 'id'>) => {
    const studentsCol = collection(db, 'students');
    await setDoc(doc(studentsCol, id), student);
};

export const updateStudent = async (id: string, student: Partial<Student>) => {
    const studentDoc = doc(db, 'students', id);
    await updateDoc(studentDoc, student);
};

export const deleteStudent = async (id: string) => {
    const studentDoc = doc(db, 'students', id);
    // Before deleting student, you might want to delete related data (fees, grades, attendance)
    // This is not implemented here for brevity
    await deleteDoc(studentDoc);
};
