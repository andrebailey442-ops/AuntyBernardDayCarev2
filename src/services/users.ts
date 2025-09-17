
'use server';

import type { User, UserRole } from '@/lib/types';
import { db } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

export const getUsers = async (): Promise<User[]> => {
    if (!db) return [];
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        // Exclude password from the returned user object
        const { password, ...user } = data;
        return { id: doc.id, ...user } as User;
    });
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
    if (!db) return null;
    const loginIdentifier = username.toLowerCase();
    const snapshot = await db.collection('users').where('email', '==', loginIdentifier).limit(1).get();
    
    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
    }
    
    const snapshotByUsername = await db.collection('users').where('username', '==', username).limit(1).get();
    if(!snapshotByUsername.empty) {
        const doc = snapshotByUsername.docs[0];
        return { id: doc.id, ...doc.data() } as User;
    }
    
    return null;
}

export const addUser = async (email: string, role: UserRole, password?: string, avatarUrl?: string, displayName?: string): Promise<User> => {
    if (!db) throw new Error("Database not initialized");

    const usersRef = db.collection('users');
    const existingUser = await usersRef.where('email', '==', email.toLowerCase()).get();
    if (!existingUser.empty) {
        throw new Error('A user with this email already exists.');
    }

    let hashedPassword = undefined;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }
    
    const newUser: Omit<User, 'id'> = {
        username: displayName || email,
        email: email,
        role,
        password: hashedPassword,
        avatarUrl: avatarUrl || `https://picsum.photos/seed/${email}/100/100`,
        imageHint: 'person avatar'
    };

    const docRef = await usersRef.add(newUser);
    
    return { id: docRef.id, ...newUser };
};

export const removeUser = async (userId: string): Promise<void> => {
    if (!db) return;
    await db.collection('users').doc(userId).delete();
};

export const authenticateUser = async (emailOrUsername: string, password?: string): Promise<User | null> => {
    if (!db) return null;
    const user = await findUserByUsername(emailOrUsername);

    if (user && user.password && password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }
    } else if (user && !user.password && !password) {
        // For passwordless login (e.g. Google Sign-In)
        return user;
    }

    return null;
};
