
import type { Fee } from '@/lib/types';
import { FEES } from '@/lib/data';

const FEES_STORAGE_KEY = 'fees';

export const getFees = (): Fee[] => {
    if (typeof window === 'undefined') return [];
    
    const storedFees = localStorage.getItem(FEES_STORAGE_KEY);
    if (storedFees) {
        return JSON.parse(storedFees);
    }
    localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(FEES));
    return FEES;
};

export const getFeeByStudentId = (studentId: string): Fee | undefined => {
    const allFees = getFees();
    return allFees.find(f => f.studentId === studentId);
}

export const addFee = (fee: Omit<Fee, 'id'>) => {
    const allFees = getFees();
    const newFee = { ...fee, id: `fee-${Date.now()}` };
    allFees.push(newFee);
    localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(allFees));
}

export const updateFee = (id: string, feeUpdate: Partial<Fee>) => {
    let allFees = getFees();
    const feeIndex = allFees.findIndex(f => f.id === id);
    if (feeIndex > -1) {
        allFees[feeIndex] = { ...allFees[feeIndex], ...feeUpdate };
        localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(allFees));
    }
};

export const deleteFeeByStudentId = (studentId: string) => {
    let allFees = getFees();
    allFees = allFees.filter(f => f.studentId !== studentId);
    localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(allFees));
}
