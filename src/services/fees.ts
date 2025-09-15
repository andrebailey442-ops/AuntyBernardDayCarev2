
'use server';

import type { Fee } from '@/lib/types';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'fees';

export const getFees = async (): Promise<Fee[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Fee;
}

export const addFee = async (fee: Omit<Fee, 'id'>): Promise<string> => {
    const docRef = await db.collection(COLLECTION_NAME).add(fee);
    return docRef.id;
}

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    await db.collection(COLLECTION_NAME).doc(id).update(feeUpdate);
};

export const deleteFeeByStudentId = async (studentId: string) => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    if (snapshot.empty) {
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

export const initializeFeesData = async (initialData: Fee[]) => {
    const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
    if (snapshot.empty && initialData.length > 0) {
        console.log('Initializing fees collection...');
        const batch = db.batch();
        initialData.forEach(fee => {
            const { id, ...feeData } = fee;
            batch.set(db.collection(COLLECTION_NAME).doc(id), feeData);
        });
        await batch.commit();
    }
};
