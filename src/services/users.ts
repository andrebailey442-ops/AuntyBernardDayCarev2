
'use server';

import type { User, UserRole } from '@/lib/types';
import { USERS } from '@/lib/data';
import { db } from '@/lib/firebase';
import { initializeData } from './initialize';

const COLLECTION_NAME = 'users';

export const getUsers = async (): Promise<User[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.empty) {
        return [];
    }
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
    return { id: docRef.id, ...newUser } as User;
};

export const removeUser = async (userId: string): Promise<void> => {
    await db.collection(COLLECTION_NAME).doc(userId).delete();
};

export const authenticateUser = async (username: string, password?: string): Promise<User | null> => {
    const snapshot = await db.collection(COLLECTION_NAME)
        .where('username', '==', username)
        .where('password', '==', password)
        .limit(1)
        .get();
        
    if (snapshot.empty) {
        // Fallback for initial data bootstrap. In a real app, you'd remove this.
        await initializeData();
        const fallbackSnapshot = await db.collection(COLLECTION_NAME)
            .where('username', '==', username)
            .where('password', '==', password)
            .limit(1)
            .get();
        if (fallbackSnapshot.empty) {
            return null;
        }
        const userDoc = fallbackSnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
    }
    
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
}

export const initializeUsersData = async () => {
    const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
    if (snapshot.empty) {
        console.log('Initializing users collection...');
        const batch = db.batch();
        USERS.forEach(user => {
            // In a real app, hash passwords before storing
            const { id, ...userData } = user; // id is not stored in the document fields
            batch.set(db.collection(COLLECTION_NAME).doc(), userData);
        });
        await batch.commit();
    }
}
