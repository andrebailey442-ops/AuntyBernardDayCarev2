
'use server';

import { DEFAULT_TEACHER_PERMISSIONS, PERMISSIONS } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { getDb } from '@/lib/firebase';

const getPermissionsKey = (role: UserRole) => `${role.toLowerCase()}_permissions`;

export const getPermissionsByRole = async (role: UserRole): Promise<string[]> => {
    const db = getDb();
    if (!db) return role === 'Teacher' ? DEFAULT_TEACHER_PERMISSIONS : PERMISSIONS.map(p => p.id);

    const docRef = db.collection('settings').doc(getPermissionsKey(role));
    const doc = await docRef.get();

    if (doc.exists) {
        return doc.data()?.permissions || [];
    } else {
        // Set default permissions if not found
        let defaultPermissions: string[];
        if (role === 'Teacher') {
            defaultPermissions = DEFAULT_TEACHER_PERMISSIONS;
        } else { // Admin
            defaultPermissions = PERMISSIONS.map(p => p.id);
        }
        await docRef.set({ permissions: defaultPermissions });
        return defaultPermissions;
    }
};

export const savePermissionsByRole = async (role: UserRole, permissions: string[]): Promise<void> => {
     const db = getDb();
     if (!db) return;
     const docRef = db.collection('settings').doc(getPermissionsKey(role));
     await docRef.set({ permissions });
};
