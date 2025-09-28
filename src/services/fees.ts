

import type { Fee } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set, update } from 'firebase/database';
import { FEES_PATH } from '@/lib/firebase-db';

export const getFees = async (): Promise<Fee[]> => {
    const snapshot = await get(ref(db, FEES_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    return [];
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | undefined> => {
    const allFees = await getFees();
    return allFees.find(f => f.studentId === studentId);
}

export const addFee = async (fee: Omit<Fee, 'id'>) => {
    const newId = `fee-${fee.studentId}`;
    const newFee = { ...fee, id: newId };
    await set(ref(db, `${FEES_PATH}/${newId}`), newFee);
}

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    await update(ref(db, `${FEES_PATH}/${id}`), feeUpdate);
};

export const deleteFeeByStudentId = async (studentId: string) => {
    const feeToDeleteRef = ref(db, `${FEES_PATH}/fee-${studentId}`);
    await set(feeToDeleteRef, null);
}
