
'use client';

import { DEFAULT_TEACHER_PERMISSIONS, PERMISSIONS } from '@/lib/data';
import type { UserRole } from '@/lib/types';

const getPermissionsKey = (role: UserRole) => `${role.toLowerCase()}_permissions`;

export const getPermissionsByRole = async (role: UserRole): Promise<string[]> => {
    if (typeof window !== 'undefined') {
        const storageKey = getPermissionsKey(role);
        const storedPermissions = localStorage.getItem(storageKey);
        if (storedPermissions) {
            return JSON.parse(storedPermissions);
        } else {
            // Default permissions
            let defaultPermissions: string[];
            if (role === 'Teacher') {
                defaultPermissions = DEFAULT_TEACHER_PERMISSIONS;
            } else { // Admin
                defaultPermissions = PERMISSIONS.map(p => p.id);
            }
            localStorage.setItem(storageKey, JSON.stringify(defaultPermissions));
            return defaultPermissions;
        }
    }
    // Fallback for SSR
    return role === 'Teacher' ? DEFAULT_TEACHER_PERMISSIONS : PERMISSIONS.map(p => p.id);
};

export const savePermissionsByRole = async (role: UserRole, permissions: string[]): Promise<void> => {
     if (typeof window !== 'undefined') {
        const storageKey = getPermissionsKey(role);
        localStorage.setItem(storageKey, JSON.stringify(permissions));
    }
};
