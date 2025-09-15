
'use server';

import type { User, UserRole } from '@/lib/types';
import { USERS, STUDENTS, GRADES, ATTENDANCE, FEES, SUBJECTS } from '@/lib/data';
import { initializeStudentsData } from './students';
import { initializeGradesData } from './grades';
import { initializeAttendanceData } from './attendance';
import { initializeFeesData } from './fees';
import { initializeSubjectsData } from './subjects';

const COLLECTION_NAME = 'users';

const getUsersFromStorage = (): User[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COLLECTION_NAME);
    return data ? JSON.parse(data) : [];
};

const saveUsersToStorage = (data: User[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(data));
};

export const initializeLocalStorageData = async () => {
    if (typeof window === 'undefined') return;
    // Check if users are initialized, if so, assume all data is initialized
    if (!localStorage.getItem(COLLECTION_NAME)) {
        saveUsersToStorage(USERS);
        initializeStudentsData(STUDENTS);
        initializeGradesData(GRADES);
        initializeAttendanceData(ATTENDANCE);
        initializeFeesData(FEES);
        initializeSubjectsData(SUBJECTS);
    }
}

export const getUsers = async (): Promise<User[]> => {
    return getUsersFromStorage();
};

export const addUser = async (username: string, role: UserRole, password?: string): Promise<User> => {
    const allUsers = getUsersFromStorage();
    const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        role,
        password,
        avatarUrl: `https://picsum.photos/seed/${username}/100/100`,
        imageHint: 'person avatar'
    };
    allUsers.push(newUser);
    saveUsersToStorage(allUsers);
    return newUser;
};

export const removeUser = async (userId: string): Promise<void> => {
    let allUsers = getUsersFromStorage();
    const updatedUsers = allUsers.filter(u => u.id !== userId);
    saveUsersToStorage(updatedUsers);
};

export const resetPassword = async (userId: string, newPassword?: string): Promise<void> => {
    let allUsers = getUsersFromStorage();
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        allUsers[userIndex].password = newPassword;
        saveUsersToStorage(allUsers);
    }
};

export const authenticateUser = async (username: string, password?: string): Promise<User | null> => {
    const allUsers = getUsersFromStorage();
    const user = allUsers.find(u => u.username === username && u.password === password);
    return user || null;
}
