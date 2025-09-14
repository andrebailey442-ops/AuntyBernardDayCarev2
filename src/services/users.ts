
'use server';

import { db } from '@/lib/firebase';
import type { User, UserRole } from '@/lib/types';
import { USERS } from '@/lib/data';

const COLLECTION_NAME = 'users';

const initializeUserData = async () => {
    const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
    if (snapshot.empty) {
        const batch = db.batch();
        USERS.forEach(item => {
            const docRef = db.collection(COLLECTION_NAME).doc(item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
    }
}

export const getUsers = async (): Promise<User[]> => {
    await initializeUserData();
    const snapshot = await db.collection(COLLECTION_NAME).get();
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
    const docRef = await db.collection(COLLECTION_NAME).add(newUser);
    return { id: docRef.id, ...newUser };
};

export const removeUser = async (userId: string): Promise<void> => {
    await db.collection(COLLECTION_NAME).doc(userId).delete();
};

export const resetPassword = async (userId: string, newPassword?: string): Promise<void> => {
    const docRef = db.collection(COLLECTION_NAME).doc(userId);
    await docRef.update({ password: newPassword });
};

export const authenticateUser = async (username: string, password?: string): Promise<User | null> => {
    await initializeUserData();
    const snapshot = await db.collection(COLLECTION_NAME)
        .where('username', '==', username)
        .where('password', '==', password)
        .get();

    if (snapshot.empty) {
        return null;
    }
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
}
