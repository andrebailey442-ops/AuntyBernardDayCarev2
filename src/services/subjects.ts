
import type { Subject } from '@/lib/types';
import { SUBJECTS } from '@/lib/data';

const SUBJECTS_STORAGE_KEY = 'subjects';

export const getSubjects = (): Subject[] => {
    if (typeof window === 'undefined') return SUBJECTS;
    
    const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (storedSubjects) {
        return JSON.parse(storedSubjects);
    } else {
        // Initialize subjects if they don't exist
        localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(SUBJECTS));
        return SUBJECTS;
    }
};
