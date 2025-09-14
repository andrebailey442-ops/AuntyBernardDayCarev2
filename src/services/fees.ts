
'use server';

import { db } from '@/lib/firebase';
import type { Fee } from '@/lib/types';

const COLLECTION_NAME = 'fees';

export const getFees = async (): Promise<Fee[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Fee;
}

export const addFee = async (fee: Omit<Fee, 'id'>) => {
    const docRef = await db.collection(COLLECTION_NAME).add(fee);
    return docRef.id;
}

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    await docRef.update(feeUpdate);
};

export const deleteFeeByStudentId = async (studentId: string) => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};
