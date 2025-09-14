
'use client';

/**
 * NOTE: This is a client-side only utility because localStorage is a browser API.
 * The 'use server' directive in the service files is a bit of a misnomer in this context,
 * as Next.js will execute these functions on the client when called from client components.
 */

export function getFromLocalStorage<T>(key: string): T[] {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return [];
    }
}

export function saveToLocalStorage<T>(key: string, value: T[]) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
}

export function initializeLocalStorage<T>(key: string, defaultValue: T[]) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const item = window.localStorage.getItem(key);
        if (!item) {
            window.localStorage.setItem(key, JSON.stringify(defaultValue));
        }
    } catch (error) {
        console.error(`Error initializing localStorage key “${key}”:`, error);
    }
}
