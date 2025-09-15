
'use client';

import { DEFAULT_TEACHER_PERMISSIONS } from '@/lib/data';

const PERMISSIONS_STORAGE_KEY = 'teacher_permissions';

export const getTeacherPermissions = async (): Promise<string[]> => {
    if (typeof window !== 'undefined') {
        const storedPermissions = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
        if (storedPermissions) {
            return JSON.parse(storedPermissions);
        } else {
            localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(DEFAULT_TEACHER_PERMISSIONS));
            return DEFAULT_TEACHER_PERMISSIONS;
        }
    }
    return DEFAULT_TEACHER_PERMISSIONS;
};

export const saveTeacherPermissions = async (permissions: string[]): Promise<void> => {
     if (typeof window !== 'undefined') {
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    }
};
