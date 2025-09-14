import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEFAULT_TEACHER_PERMISSIONS } from '@/lib/data';

const DOC_ID = 'teacher_permissions';
const COLLECTION_NAME = 'settings';

export const initializePermissionData = async () => {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        await setDoc(docRef, { permissions: DEFAULT_TEACHER_PERMISSIONS });
    }
}

export const getTeacherPermissions = async (): Promise<string[]> => {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().permissions as string[];
    }
    return DEFAULT_TEACHER_PERMISSIONS;
};

export const saveTeacherPermissions = async (permissions: string[]) => {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    await setDoc(docRef, { permissions });
};
