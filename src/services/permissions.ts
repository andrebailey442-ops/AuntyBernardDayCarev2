
'use server';

import { db } from '@/lib/firebase';
import { DEFAULT_TEACHER_PERMISSIONS } from '@/lib/data';

const DOC_ID = 'teacher_permissions';
const COLLECTION_NAME = 'settings';

export const getTeacherPermissions = async (): Promise<string[]> => {
    const docRef = db.collection(COLLECTION_NAME).doc(DOC_ID);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return (docSnap.data() as { permissions: string[] }).permissions;
    }
    // If not set, initialize and return default.
    await setDoc(docRef, { permissions: DEFAULT_TEACHER_PERMISSIONS });
    return DEFAULT_TEACHER_PERMISSIONS;
};

export const saveTeacherPermissions = async (permissions: string[]) => {
    const docRef = db.collection(COLLECTION_NAME).doc(DOC_ID);
    await docRef.set({ permissions });
};
