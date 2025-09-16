
'use client';

import type { User, UserRole } from '@/lib/types';
import { USERS } from '@/lib/data';

const USERS_STORAGE_KEY = 'users';

const getUsersFromStorage = (): User[] => {
    if (typeof window !== 'undefined') {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
            return JSON.parse(storedUsers);
        } else {
            // If no users in storage, initialize with default users
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(USERS));
            return USERS;
        }
    }
    return USERS; // Fallback for SSR
}

const saveUsersToStorage = (users: User[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
}

export const getUsers = async (): Promise<User[]> => {
    return getUsersFromStorage();
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
    const users = getUsersFromStorage();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export const addUser = async (email: string, role: UserRole, password?: string, avatarUrl?: string, displayName?: string): Promise<User> => {
    const users = getUsersFromStorage();
    const existingUser = users.find(u => u.username.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('A user with this email already exists.');
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        username: email, // Use email as username
        role,
        password,
        avatarUrl: avatarUrl || `https://picsum.photos/seed/${email}/100/100`,
        imageHint: 'person avatar'
    };
    users.push(newUser);
    saveUsersToStorage(users);
    return newUser;
};

export const removeUser = async (userId: string): Promise<void> => {
    let users = getUsersFromStorage();
    users = users.filter(u => u.id !== userId);
    saveUsersToStorage(users);
};

export const authenticateUser = async (emailOrUsername: string, password?: string): Promise<User | null> => {
    const users = getUsersFromStorage();
    const loginIdentifier = emailOrUsername.toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === loginIdentifier && u.password === password);
    return user || null;
};
