
import type { User, UserRole } from '@/lib/types';
import { USERS } from '@/lib/data';

const USERS_STORAGE_KEY = 'users';

const getStoredUsers = (): User[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : USERS;
};

const setStoredUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};


export const getUsers = (): User[] => {
    return getStoredUsers().map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    });
};

export const findUserByUsername = (username: string): User | null => {
    const users = getStoredUsers();
    const loginIdentifier = username.toLowerCase();
    
    const user = users.find(u => 
        u.email?.toLowerCase() === loginIdentifier || 
        u.username.toLowerCase() === loginIdentifier
    );
    
    return user || null;
};

export const addUser = (email: string, role: UserRole, password?: string, avatarUrl?: string, displayName?: string): User => {
    const users = getStoredUsers();
    
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('A user with this email already exists.');
    }
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        username: displayName || email,
        email: email.toLowerCase(),
        role,
        password: password, // Storing plain text password in local storage
        avatarUrl: avatarUrl || `https://picsum.photos/seed/${email}/100/100`,
        imageHint: 'person avatar'
    };

    users.push(newUser);
    setStoredUsers(users);
    
    return newUser;
};

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return null;
    }

    // Ensure we don't accidentally wipe the password if it's not being updated
    if (updates.password === '') {
        delete updates.password;
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    setStoredUsers(users);

    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword as User;
}

export const removeUser = (userId: string): void => {
    let users = getStoredUsers();
    users = users.filter(u => u.id !== userId);
    setStoredUsers(users);
};

export const authenticateUser = (emailOrUsername: string, password?: string): User | null => {
    const user = findUserByUsername(emailOrUsername);

    if (user && user.password && password) {
        if (user.password === password) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }
    } else if (user && !user.password && !password) {
        // For passwordless login (e.g. if we were to re-add Google Sign-In)
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }

    return null;
};
