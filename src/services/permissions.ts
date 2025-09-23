
import { DEFAULT_TEACHER_PERMISSIONS, PERMISSIONS } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set } from 'firebase/database';
import { PERMISSIONS_PATH } from '@/lib/firebase-db';

export const getPermissionsByRole = async (role: UserRole): Promise<string[]> => {
    const permissionsRef = ref(db, `${PERMISSIONS_PATH}/${role.toLowerCase()}`);
    try {
        const snapshot = await get(permissionsRef);

        if (snapshot.exists()) {
            return snapshot.val();
        }
    } catch (error) {
        console.warn('Permission denied reading permissions, falling back to default. This is expected on first run.');
    }

    // Return defaults if nothing in db or permission denied
    if (role === 'Teacher') {
        await savePermissionsByRole('Teacher', DEFAULT_TEACHER_PERMISSIONS);
        return DEFAULT_TEACHER_PERMISSIONS;
    }
    
    // Admin gets all permissions by default
    const allPermissions = PERMISSIONS.map(p => p.id);
    await savePermissionsByRole('Admin', allPermissions);
    return allPermissions;
};

export const savePermissionsByRole = async (role: UserRole, permissions: string[]): Promise<void> => {
    const permissionsRef = ref(db, `${PERMISSIONS_PATH}/${role.toLowerCase()}`);
    await set(permissionsRef, permissions);
};
