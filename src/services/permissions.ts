
import { DEFAULT_TEACHER_PERMISSIONS, PERMISSIONS } from '@/lib/data';
import type { UserRole } from '@/lib/types';

const PERMISSIONS_STORAGE_KEY = 'permissions';

type PermissionsStore = {
    [role in UserRole]?: string[];
}

export const getPermissionsByRole = (role: UserRole): string[] => {
    if (typeof window === 'undefined') return [];
    
    const storedPermissions = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    const permissions: PermissionsStore = storedPermissions ? JSON.parse(storedPermissions) : {};
    
    if (permissions[role]) {
        return permissions[role]!;
    }

    // Return defaults if nothing is in local storage
    if (role === 'Teacher') {
        savePermissionsByRole('Teacher', DEFAULT_TEACHER_PERMISSIONS);
        return DEFAULT_TEACHER_PERMISSIONS;
    }
    
    // Admin gets all permissions by default
    const allPermissions = PERMISSIONS.map(p => p.id);
    savePermissionsByRole('Admin', allPermissions);
    return allPermissions;
};

export const savePermissionsByRole = (role: UserRole, permissions: string[]): void => {
    const storedPermissions = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    const currentPermissions: PermissionsStore = storedPermissions ? JSON.parse(storedPermissions) : {};
    
    currentPermissions[role] = permissions;
    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(currentPermissions));
};
