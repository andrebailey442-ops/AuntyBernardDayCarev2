
import type { User, UserRole } from '@/lib/types';
import { USERS } from '@/lib/data';
import { db } from '@/lib/firebase-client';
import { ref, get, set, update } from 'firebase/database';
import { USERS_PATH, APP_STATE_PATH } from '@/lib/firebase-db';

export const isFirstRun = async (): Promise<boolean> => {
    const appStateRef = ref(db, `${APP_STATE_PATH}/isInitialized`);
    try {
        const snapshot = await get(appStateRef);
        return !snapshot.exists() || !snapshot.val();
    } catch (e) {
        // If we get a permission denied, it's likely the first run and rules aren't set.
        // We'll assume it's the first run to allow admin creation.
        return true;
    }
}

export const completeFirstRun = async () => {
    await set(ref(db, `${APP_STATE_PATH}/isInitialized`), true);
}

export const getUsers = async (): Promise<User[]> => {
    const snapshot = await get(ref(db, USERS_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        // Firebase returns an object, convert it to an array
        return Object.values(data);
    }
    return [];
};


export const findUserByUsername = async (username: string): Promise<User | null> => {
    const users = await getUsers();
    const loginIdentifier = username.toLowerCase();
    
    const user = users.find(u => 
        (u.email && u.email.toLowerCase() === loginIdentifier) || 
        (u.username && u.username.toLowerCase() === loginIdentifier)
    );
    
    return user || null;
};

export const addUser = async (email: string, role: UserRole, password?: string, avatarUrl?: string, displayName?: string): Promise<User> => {
    const users = await getUsers();
    
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('A user with this email already exists.');
    }
    
    const id = `user-${Date.now()}`;
    const newUser: User = {
        id,
        username: displayName || email,
        email: email.toLowerCase(),
        role,
        password: password, // In a real app, this should be hashed
        avatarUrl: avatarUrl || `https://picsum.photos/seed/${email}/100/100`,
        imageHint: 'person avatar'
    };

    await set(ref(db, `${USERS_PATH}/${id}`), newUser);

    if (users.length === 0) {
        await completeFirstRun();
    }
    
    return newUser;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
    const userRef = ref(db, `${USERS_PATH}/${userId}`);

    // Ensure we don't accidentally wipe the password if it's not being updated
    if (updates.password === '') {
        delete updates.password;
    }
    
    await update(userRef, updates);
    const snapshot = await get(userRef);

    if(snapshot.exists()) {
        const updatedUser = snapshot.val();
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
    }
    return null;
}

export const removeUser = async (userId: string): Promise<void> => {
    await set(ref(db, `${USERS_PATH}/${userId}`), null);
};

export const authenticateUser = async (emailOrUsername: string, password?: string): Promise<User | null> => {
    const user = await findUserByUsername(emailOrUsername);

    if (user && user.password && password) {
        if (user.password === password) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }
    }

    return null;
};
