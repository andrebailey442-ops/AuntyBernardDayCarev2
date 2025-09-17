
import { USERS, STUDENTS, FEES, SUBJECTS, DEFAULT_TEACHER_PERMISSIONS, PERMISSIONS } from '@/lib/data';

const INIT_FLAG = 'isInitialized';

const initializeLocalStorage = () => {
    localStorage.setItem('users', JSON.stringify(USERS));
    localStorage.setItem('students', JSON.stringify(STUDENTS));
    localStorage.setItem('archivedStudents', JSON.stringify([]));
    localStorage.setItem('subjects', JSON.stringify(SUBJECTS));
    localStorage.setItem('fees', JSON.stringify(FEES));
    localStorage.setItem('grades', JSON.stringify([]));
    localStorage.setItem('attendance', JSON.stringify([]));
    localStorage.setItem('teacher_permissions', JSON.stringify(DEFAULT_TEACHER_PERMISSIONS));
    localStorage.setItem('admin_permissions', JSON.stringify(PERMISSIONS.map(p => p.id)));
    localStorage.setItem(INIT_FLAG, 'true');
};

export const initializeData = () => {
    if (typeof window === 'undefined') {
        return;
    }
    const isInitialized = localStorage.getItem(INIT_FLAG);
    if (!isInitialized) {
        console.log('First time setup: Initializing local storage with mock data...');
        initializeLocalStorage();
    }
};
