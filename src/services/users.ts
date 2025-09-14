import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, UserRole } from '@/lib/types';
import { USERS } from '@/lib/data';

const COLLECTION_NAME = 'users';

export const initializeUserData = async () => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        USERS.forEach(item => {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
    }
}

export const getUsers = async (): Promise<User[]> => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const addUser = async (username: string, role: UserRole, password?: string): Promise<User> => {
    const newUser: Omit<User, 'id'> = {
        username,
        role,
        password,
        avatarUrl: `https://picsum.photos/seed/${username}/100/100`,
        imageHint: 'person avatar'
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newUser);
    return { id: docRef.id, ...newUser };
};

export const removeUser = async (userId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION_NAME, userId));
};

export const resetPassword = async (userId: string, newPassword?: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(docRef, { password: newPassword });
};

export const authenticateUser = async (username: string, password?: string): Promise<User | null> => {
    const q = query(collection(db, COLLECTION_NAME), where('username', '==', username), where('password', '==', password));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
}
