
import type { Fee } from '@/lib/types';
import { FEES } from '@/lib/data';

const FEES_STORAGE_KEY = 'fees';

const getStoredFees = (): Fee[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(FEES_STORAGE_KEY);
    return data ? JSON.parse(data) : FEES;
};

const setStoredFees = (fees: Fee[]) => {
    localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(fees));
};

export const getFees = (): Fee[] => {
    return getStoredFees();
};

export const getFeeByStudentId = (studentId: string): Fee | null => {
    const fees = getStoredFees();
    const fee = fees.find(f => f.studentId === studentId);
    return fee || null;
};

export const addFee = (fee: Omit<Fee, 'id'>): string => {
    const fees = getStoredFees();
    const newId = `fee-${Date.now()}`;
    const newFee = { ...fee, id: newId };
    fees.push(newFee);
    setStoredFees(fees);
    return newId;
};

export const updateFee = (id: string, feeUpdate: Partial<Fee>) => {
    const fees = getStoredFees();
    const index = fees.findIndex(f => f.id === id);
    if (index > -1) {
        fees[index] = { ...fees[index], ...feeUpdate };
        setStoredFees(fees);
    }
};

export const deleteFeeByStudentId = (studentId: string) => {
    let fees = getStoredFees();
    fees = fees.filter(f => f.studentId !== studentId);
    setStoredFees(fees);
};
