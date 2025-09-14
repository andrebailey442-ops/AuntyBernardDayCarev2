import { getFromLocalStorage, saveToLocalStorage, initializeLocalStorage } from '@/lib/local-storage';
import { DEFAULT_TEACHER_PERMISSIONS } from '@/lib/data';

const STORAGE_KEY = 'teacherPermissions';

export const initializePermissionData = () => {
    initializeLocalStorage(STORAGE_KEY, DEFAULT_TEACHER_PERMISSIONS);
}

export const getTeacherPermissions = async (): Promise<string[]> => {
    return getFromLocalStorage<string>(STORAGE_KEY);
};

export const saveTeacherPermissions = async (permissions: string[]) => {
    saveToLocalStorage(STORAGE_KEY, permissions);
};
