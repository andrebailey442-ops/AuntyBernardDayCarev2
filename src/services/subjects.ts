import type { Subject } from '@/lib/types';
import { getFromLocalStorage, initializeLocalStorage } from '@/lib/local-storage';
import { SUBJECTS } from '@/lib/data';

const STORAGE_KEY = 'subjects';

export const initializeSubjectData = () => {
    initializeLocalStorage(STORAGE_KEY, SUBJECTS);
}

export const getSubjects = async (): Promise<Subject[]> => {
    return getFromLocalStorage<Subject>(STORAGE_KEY);
};
