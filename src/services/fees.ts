
'use server';

import type { Fee } from '@/lib/types';
import { getFromLocalStorage, saveToLocalStorage, initializeLocalStorage } from '@/lib/local-storage';
import { FEES } from '@/lib/data';

const STORAGE_KEY = 'fees';

export const initializeFeeData = () => {
    initializeLocalStorage(STORAGE_KEY, FEES);
}

export const getFees = async (): Promise<Fee[]> => {
    return getFromLocalStorage<Fee>(STORAGE_KEY);
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const allFees = await getFees();
    return allFees.find(fee => fee.studentId === studentId) || null;
}

export const addFee = async (fee: Omit<Fee, 'id'>) => {
    const allFees = await getFees();
    const newFee: Fee = {
        id: `fee-${Date.now()}`,
        ...fee,
    };
    allFees.push(newFee);
    saveToLocalStorage(STORAGE_KEY, allFees);
    return newFee.id;
}

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    let allFees = await getFees();
    const feeIndex = allFees.findIndex(f => f.id === id);
    if (feeIndex > -1) {
        allFees[feeIndex] = { ...allFees[feeIndex], ...feeUpdate };
        saveToLocalStorage(STORAGE_KEY, allFees);
    } else {
        // Handle case where fee record for a student might not exist yet, especially on first payment
        if (feeUpdate.studentId) {
            const studentFeeIndex = allFees.findIndex(f => f.studentId === feeUpdate.studentId);
            if (studentFeeIndex > -1) {
                allFees[studentFeeIndex] = { ...allFees[studentFeeIndex], ...feeUpdate };
                saveToLocalStorage(STORAGE_KEY, allFees);
            } else {
                console.error(`Could not find fee to update for student ID: ${feeUpdate.studentId}`);
            }
        } else {
             console.error(`Could not find fee to update with ID: ${id}`);
        }
    }
};

export const deleteFeeByStudentId = async (studentId: string) => {
    let allFees = await getFees();
    const updatedFees = allFees.filter(f => f.studentId !== studentId);
    saveToLocalStorage(STORAGE_KEY, updatedFees);
};
