
import type { Fee } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set, push, query, orderByChild, equalTo } from 'firebase/database';
import { FEES_PATH } from '@/lib/firebase-db';

export const getFees = async (): Promise<Fee[]> => {
    const feesRef = ref(db, FEES_PATH);
    const snapshot = await get(feesRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const feesRef = ref(db, FEES_PATH);
    const q = query(feesRef, orderByChild('studentId'), equalTo(studentId));
    const snapshot = await get(q);
    if (snapshot.exists()) {
        const data = snapshot.val();
        const key = Object.keys(data)[0];
        return { id: key, ...data[key] };
    }
    return null;
};

export const addFee = async (fee: Omit<Fee, 'id'>): Promise<string> => {
    const feesRef = ref(db, FEES_PATH);
    const newFeeRef = push(feesRef);
    await set(newFeeRef, fee);
    return newFeeRef.key!;
};

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    const feeRef = ref(db, `${FEES_PATH}/${id}`);
    const snapshot = await get(feeRef);
    if (snapshot.exists()) {
        const currentFee = snapshot.val();
        await set(feeRef, { ...currentFee, ...feeUpdate });
    }
};

export const deleteFeeByStudentId = async (studentId: string) => {
    const fee = await getFeeByStudentId(studentId);
    if (fee) {
        const feeRef = ref(db, `${FEES_PATH}/${fee.id}`);
        await remove(feeRef);
    }
};
