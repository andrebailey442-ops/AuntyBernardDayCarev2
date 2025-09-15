
'use server';

import { DEFAULT_TEACHER_PERMISSIONS } from '@/lib/data';

const STORAGE_KEY = 'teacher_permissions';

export const getTeacherPermissions = async (): Promise<string[]> => {
    if (typeof window === 'undefined') return DEFAULT_TEACHER_PERMISSIONS;
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    // If not set, initialize and return default.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEACHER_PERMISSIONS));
    return DEFAULT_TEACHER_PERMISSIONS;
};

export const saveTeacherPermissions = async (permissions: string[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
};
