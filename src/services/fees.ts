import { collection, getDocs, doc, setDoc, addDoc, updateDoc, query, where, getDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Fee } from '@/lib/types';
import { FEES } from '@/lib/data';

const COLLECTION_NAME = 'fees';

export const initializeFeeData = async () => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        FEES.forEach(item => {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
    }
}

export const getFees = async (): Promise<Fee[]> => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const q = query(collection(db, COLLECTION_NAME), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Fee;
}

export const addFee = async (fee: Omit<Fee, 'id'>) => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), fee);
    return docRef.id;
}

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, feeUpdate);
};

export const deleteFeeByStudentId = async (studentId: string) => {
    const q = query(collection(db, COLLECTION_NAME), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};
