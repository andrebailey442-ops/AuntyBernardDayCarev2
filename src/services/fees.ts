import type { Fee } from '@/lib/types';

const COLLECTION_NAME = 'fees';

const getFeesFromStorage = (): Fee[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COLLECTION_NAME);
    return data ? JSON.parse(data) : [];
};

const saveFeesToStorage = (data: Fee[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(data));
};

export const initializeFeesData = (initialData: Fee[]) => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(COLLECTION_NAME)) {
        saveFeesToStorage(initialData);
    }
};


export const getFees = async (): Promise<Fee[]> => {
    return getFeesFromStorage();
};

export const getFeeByStudentId = async (studentId: string): Promise<Fee | null> => {
    const allFees = getFeesFromStorage();
    return allFees.find(fee => fee.studentId === studentId) || null;
}

export const addFee = async (fee: Omit<Fee, 'id'>) => {
    const allFees = getFeesFromStorage();
    const newFee = { id: `fee-${Date.now()}`, ...fee } as Fee;
    allFees.push(newFee);
    saveFeesToStorage(allFees);
    return newFee.id;
}

export const updateFee = async (id: string, feeUpdate: Partial<Fee>) => {
    let allFees = getFeesFromStorage();
    const feeIndex = allFees.findIndex(f => f.id === id);
    if (feeIndex > -1) {
        allFees[feeIndex] = { ...allFees[feeIndex], ...feeUpdate };
        saveFeesToStorage(allFees);
    }
};

export const deleteFeeByStudentId = async (studentId: string) => {
    let allFees = getFeesFromStorage();
    const updatedFees = allFees.filter(fee => fee.studentId !== studentId);
    saveFeesToStorage(updatedFees);
};