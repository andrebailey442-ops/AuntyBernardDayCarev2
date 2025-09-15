import type { Subject } from '@/lib/types';
import { SUBJECTS } from '@/lib/data';

const COLLECTION_NAME = 'subjects';

const getSubjectsFromStorage = (): Subject[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COLLECTION_NAME);
    return data ? JSON.parse(data) : [];
};

const saveSubjectsToStorage = (data: Subject[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(data));
};

export const initializeSubjectsData = (initialData: Subject[]) => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(COLLECTION_NAME)) {
        saveSubjectsToStorage(initialData);
    }
};


export const getSubjects = async (): Promise<Subject[]> => {
    let subjects = getSubjectsFromStorage();
    if (subjects.length === 0) {
        initializeSubjectsData(SUBJECTS);
        subjects = SUBJECTS;
    }
    return subjects;
};