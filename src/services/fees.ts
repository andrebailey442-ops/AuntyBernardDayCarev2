
'use client';

import type { Fee } from '@/lib/types';
import { FEES } from '@/lib/data';

const FEES_STORAGE_KEY = 'fees';

const getFeesFromStorage = (): Fee[] => {
    if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem(FEES_STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(FEES));
            return FEES;
        }
    }
    return FEES;
}

const saveFeesToStorage = (fees: Fee[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(fees));
    }
}

export const getFees = async (): Promise<Fee[]> => {
    return getFeesFromStorage();
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const allFees = getFeesFromStorage();
    return allFees.find(f => f.studentId === studentId) || null;
}

export const addFee = async (fee: Omit<Fee, 'id'>): Promise<string> => {
    const allFees = getFeesFromStorage();
    const newFee = { id: `fee-${Date.now()}`, ...fee } as Fee;
    allFees.push(newFee);
    saveFeesToStorage(allFees);
    return newFee.id;
}

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    const allFees = getFeesFromStorage();
    const feeIndex = allFees.findIndex(f => f.id === id);
    if (feeIndex > -1) {
        allFees[feeIndex] = { ...allFees[feeIndex], ...feeUpdate };
        saveFeesToStorage(allFees);
    }
};

export const deleteFeeByStudentId = async (studentId: string) => {
    let allFees = getFeesFromStorage();
    allFees = allFees.filter(f => f.studentId !== studentId);
    saveFeesToStorage(allFees);
};
