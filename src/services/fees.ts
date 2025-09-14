
'use server';

import { collection, doc, getDocs, updateDoc, query, where, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Fee } from '@/lib/types';

export const getFees = async (): Promise<Fee[]> => {
    const feesCol = collection(db, 'fees');
    const feeSnapshot = await getDocs(feesCol);
    const feeList = feeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
    return feeList;
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const feesCol = collection(db, 'fees');
    const q = query(feesCol, where("studentId", "==", studentId));
    const feeSnapshot = await getDocs(q);
    if (!feeSnapshot.empty) {
        const feeDoc = feeSnapshot.docs[0];
        return { id: feeDoc.id, ...feeDoc.data() } as Fee;
    }
    return null;
}

export const addFee = async (fee: Omit<Fee, 'id'>) => {
    const feesCol = collection(db, 'fees');
    const docRef = await addDoc(feesCol, fee);
    return docRef.id;
}

export const updateFee = async (id: string, fee: Partial<Fee>) => {
    const feeDoc = doc(db, 'fees', id);
    await updateDoc(feeDoc, fee);
};

    