
import { DEFAULT_TEACHER_PERMISSIONS, PERMISSIONS } from '@/lib/data';
import type { UserRole } from '@/lib/types';

const getPermissionsKey = (role: UserRole) => `${role.toLowerCase()}_permissions`;

export const getPermissionsByRole = (role: UserRole): string[] => {
    if (typeof window === 'undefined') return [];
    
    const key = getPermissionsKey(role);
    const storedPermissions = localStorage.getItem(key);

    if (storedPermissions) {
        return JSON.parse(storedPermissions);
    }

    // Return defaults if nothing is in local storage
    if (role === 'Teacher') {
        return DEFAULT_TEACHER_PERMISSIONS;
    }
    // Admin gets all permissions by default
    return PERMISSIONS.map(p => p.id);
};

export const savePermissionsByRole = (role: UserRole, permissions: string[]): void => {
     if (typeof window === 'undefined') return;
     const key = getPermissionsKey(role);
     localStorage.setItem(key, JSON.stringify(permissions));
};
