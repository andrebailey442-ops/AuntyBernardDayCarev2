
import type { User, UserRole } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { USERS_PATH, APP_STATE_PATH } from '@/lib/firebase-db';

export const isFirstRun = async (): Promise<boolean> => {
    const appStateRef = ref(db, `${APP_STATE_PATH}/isInitialized`);
    const snapshot = await get(appStateRef);
    return !snapshot.exists() || !snapshot.val();
}

export const setFirstRunComplete = async (): Promise<void> => {
    const appStateRef = ref(db, `${APP_STATE_PATH}/isInitialized`);
    await set(appStateRef, true);
}


export const getUsers = async (): Promise<User[]> => {
    const usersRef = ref(db, USERS_PATH);
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.keys(usersData).map(key => ({
            id: key,
            ...usersData[key]
        }));
    }
    return [];
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
    const users = await getUsers();
    const loginIdentifier = username.toLowerCase();
    
    const user = users.find(u => 
        u.email?.toLowerCase() === loginIdentifier || 
        u.username.toLowerCase() === loginIdentifier
    );
    
    return user || null;
};

export const addUser = async (email: string, role: UserRole, password?: string, avatarUrl?: string, displayName?: string): Promise<User> => {
    const users = await getUsers();
    
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('A user with this email already exists.');
    }
    
    const userId = `user-${Date.now()}`;
    const userRef = ref(db, `${USERS_PATH}/${userId}`);
    
    const newUser: Omit<User, 'id'> = {
        username: displayName || email,
        email: email.toLowerCase(),
        role,
        password: password,
        avatarUrl: avatarUrl || `https://picsum.photos/seed/${email}/100/100`,
        imageHint: 'person avatar'
    };

    await set(userRef, newUser);
    
    return { ...newUser, id: userId };
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
    const userRef = ref(db, `${USERS_PATH}/${userId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        return null;
    }

    const currentUser = snapshot.val();

    // Ensure we don't accidentally wipe the password if it's not being updated
    if (updates.password === '') {
        delete updates.password;
    }

    const updatedUser = { ...currentUser, ...updates };
    await set(userRef, updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    return { ...userWithoutPassword, id: userId } as User;
}

export const removeUser = async (userId: string): Promise<void> => {
    const userRef = ref(db, `${USERS_PATH}/${userId}`);
    await remove(userRef);
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
