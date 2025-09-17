
'use server';

import type { Fee } from '@/lib/types';
import { getDb } from '@/lib/firebase';

export const getFees = async (): Promise<Fee[]> => {
    const db = getDb();
    if (!db) return [];
    const snapshot = await db.collection('fees').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const db = getDb();
    if (!db) return null;
    const snapshot = await db.collection('fees').where('studentId', '==', studentId).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Fee;
}

export const addFee = async (fee: Omit<Fee, 'id'>): Promise<string> => {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");
    const docRef = await db.collection('fees').add(fee);
    return docRef.id;
}

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    const db = getDb();
    if (!db) return;
    const feeRef = db.collection('fees').doc(id);
    await feeRef.update(feeUpdate);
};

export const deleteFeeByStudentId = async (studentId: string) => {
    const db = getDb();
    if (!db) return;
    const snapshot = await db.collection('fees').where('studentId', '==', studentId).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};
