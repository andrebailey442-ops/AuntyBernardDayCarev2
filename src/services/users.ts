
import type { User, UserRole } from '@/lib/types';
import { getFromLocalStorage, saveToLocalStorage, initializeLocalStorage } from '@/lib/local-storage';
import { USERS } from '@/lib/data';

const STORAGE_KEY = 'users';

export const initializeUserData = () => {
    initializeLocalStorage(STORAGE_KEY, USERS);
}

export const getUsers = async (): Promise<User[]> => {
    return getFromLocalStorage<User>(STORAGE_KEY);
};

export const addUser = async (username: string, role: UserRole, password?: string): Promise<User> => {
    const users = await getUsers();
    const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        role,
        password,
        avatarUrl: `https://picsum.photos/seed/${username}/100/100`,
        imageHint: 'person avatar'
    };
    users.push(newUser);
    saveToLocalStorage(STORAGE_KEY, users);
    return newUser;
};

export const removeUser = async (userId: string): Promise<void> => {
    let users = await getUsers();
    users = users.filter(user => user.id !== userId);
    saveToLocalStorage(STORAGE_KEY, users);
};

export const resetPassword = async (userId: string, newPassword?: string): Promise<void> => {
    const users = await getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        saveToLocalStorage(STORAGE_KEY, users);
    }
};
