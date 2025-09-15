
'use server';

import { DEFAULT_TEACHER_PERMISSIONS } from '@/lib/data';
import { db } from '@/lib/firebase';

const DOC_ID = 'teacher_permissions';
const COLLECTION_NAME = 'settings';

export const getTeacherPermissions = async (): Promise<string[]> => {
    try {
        const doc = await db.collection(COLLECTION_NAME).doc(DOC_ID).get();
        if (doc.exists) {
            const data = doc.data();
            return data?.permissions || DEFAULT_TEACHER_PERMISSIONS;
        } else {
            // If doc doesn't exist, create it with default permissions
            await db.collection(COLLECTION_NAME).doc(DOC_ID).set({ permissions: DEFAULT_TEACHER_PERMISSIONS });
            return DEFAULT_TEACHER_PERMISSIONS;
        }
    } catch (error) {
        console.error("Error fetching teacher permissions: ", error);
        return DEFAULT_TEACHER_PERMISSIONS;
    }
};

export const saveTeacherPermissions = async (permissions: string[]): Promise<void> => {
    await db.collection(COLLECTION_NAME).doc(DOC_ID).set({ permissions });
};
