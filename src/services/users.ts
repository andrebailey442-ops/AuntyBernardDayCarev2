
import type { User, UserRole } from '@/lib/types';
import { USERS } from '@/lib/data';

const USERS_STORAGE_KEY = 'users';

const isFirstRun = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('appInitialized');
}

const completeFirstRun = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('appInitialized', 'true');
}

export const getUsers = (): User[] => {
    if (typeof window === 'undefined') return [];
    
    if (isFirstRun()) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(USERS));
        completeFirstRun();
        return USERS;
    }
    
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
        // Handle cases where a single user might be stored as an object
        const parsed = JSON.parse(storedUsers);
        return Array.isArray(parsed) ? parsed : Object.values(parsed);
    }
    
    return [];
};


export const findUserByUsername = (username: string): User | null => {
    const users = getUsers();
    const loginIdentifier = username.toLowerCase();
    
    const user = users.find(u => 
        (u.email && u.email.toLowerCase() === loginIdentifier) || 
        (u.username && u.username.toLowerCase() === loginIdentifier)
    );
    
    return user || null;
};

export const addUser = (email: string, role: UserRole, password?: string, avatarUrl?: string, displayName?: string): User => {
    const users = getUsers();
    
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('A user with this email already exists.');
    }
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        username: displayName || email,
        email: email.toLowerCase(),
        role,
        password: password,
        avatarUrl: avatarUrl || `https://picsum.photos/seed/${email}/100/100`,
        imageHint: 'person avatar'
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return newUser;
};

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
    let users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return null;
    }

    // Ensure we don't accidentally wipe the password if it's not being updated
    if (updates.password === '') {
        delete updates.password;
    }

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
}

export const removeUser = (userId: string): void => {
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const authenticateUser = (emailOrUsername: string, password?: string): User | null => {
    const user = findUserByUsername(emailOrUsername);

    if (user && user.password && password) {
        if (user.password === password) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }
    }

    return null;
};
