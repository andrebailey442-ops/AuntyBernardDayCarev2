import { collection, getDocs, doc, setDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Grade } from '@/lib/types';
import { format } from 'date-fns';
import { GRADES } from '@/lib/data';

const COLLECTION_NAME = 'grades';

export const initializeGradeData = async () => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        GRADES.forEach(item => {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
    }
}

export const getGrades = async (): Promise<Grade[]> => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Grade);
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
    const q = query(collection(db, COLLECTION_NAME), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Grade);
};

export const upsertGrade = async (studentId: string, subject: string, grade: string) => {
    const gradeId = `${studentId}_${subject}`;
    const docRef = doc(db, COLLECTION_NAME, gradeId);

    const gradeData = {
        id: gradeId,
        studentId,
        subject,
        grade: grade as Grade['grade'],
        category: 'daily', // Defaulting category
        date: format(new Date(), 'yyyy-MM-dd'),
    };
    
    await setDoc(docRef, gradeData, { merge: true });
};
