

import type { Student } from '@/lib/types';
import { deleteFeeByStudentId } from './fees';
import { deleteGradesByStudentId } from './grades';
import { deleteAttendanceByStudentId } from './attendance';
import { db } from '@/lib/firebase-client';
import { ref, get, set, update } from 'firebase/database';
import { STUDENTS_PATH, ARCHIVED_STUDENTS_PATH } from '@/lib/firebase-db';

const AFTERCARE_ATTENDANCE_PATH = 'afterCareAttendance';
const NURSERY_ATTENDANCE_PATH = 'nurseryAttendance';
const ARCHIVED_AFTERCARE_LOGS_PATH = 'afterCareArchivedLogs';
const ARCHIVED_NURSERY_LOGS_PATH = 'nurseryArchivedLogs';

export const getStudents = async (): Promise<Student[]> => {
    const snapshot = await get(ref(db, STUDENTS_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    return [];
};

export const getArchivedStudents = async (): Promise<Student[]> => {
    const snapshot = await get(ref(db, ARCHIVED_STUDENTS_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    return [];
}

export const getStudent = async (id: string): Promise<Student | null> => {
    let snapshot = await get(ref(db, `${STUDENTS_PATH}/${id}`));
    if (snapshot.exists()) {
        return snapshot.val();
    }
    snapshot = await get(ref(db, `${ARCHIVED_STUDENTS_PATH}/${id}`));
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return null;
}

export const addStudent = async (id: string, student: Omit<Student, 'id' | 'status'>) => {
    const newStudent: Student = {
        ...student,
        id,
        status: 'enrolled',
    };
    await set(ref(db, `${STUDENTS_PATH}/${id}`), newStudent);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const studentRef = ref(db, `${STUDENTS_PATH}/${id}`);
    const archivedStudentRef = ref(db, `${ARCHIVED_STUDENTS_PATH}/${id}`);

    const snapshot = await get(studentRef);
    if (snapshot.exists()) {
        // If student is being graduated
        if (studentUpdate.status === 'graduated') {
            const studentToGraduate = { ...snapshot.val(), ...studentUpdate };
            const updates: { [key: string]: any } = {};
            updates[`${STUDENTS_PATH}/${id}`] = null;
            updates[`${ARCHIVED_STUDENTS_PATH}/${id}`] = studentToGraduate;
            await update(ref(db), updates);
        } else {
            await update(studentRef, studentUpdate);
        }
    } else {
        await update(archivedStudentRef, studentUpdate);
    }
};

export const deleteStudent = async (id: string) => {
    await set(ref(db, `${STUDENTS_PATH}/${id}`), null);
    
    // Also delete related data
    await deleteFeeByStudentId(id);
    await deleteGradesByStudentId(id);
    await deleteAttendanceByStudentId(id);
};

// After Care
export const getAfterCareAttendance = async (date: string) => {
    const snapshot = await get(ref(db, `${AFTERCARE_ATTENDANCE_PATH}/${date}`));
    return snapshot.exists() ? snapshot.val() : {};
}
export const saveAfterCareAttendance = async (date: string, attendance: any) => {
    await set(ref(db, `${AFTERCARE_ATTENDANCE_PATH}/${date}`), attendance);
}
export const getArchivedAfterCareLogs = async () => {
    const snapshot = await get(ref(db, ARCHIVED_AFTERCARE_LOGS_PATH));
    return snapshot.exists() ? Object.values(snapshot.val()) : [];
}
export const saveArchivedAfterCareLogs = async (logs: any) => {
    await set(ref(db, ARCHIVED_AFTERCARE_LOGS_PATH), logs);
}

// Nursery
export const getnurseryAttendance = async (date: string) => {
    const snapshot = await get(ref(db, `${NURSERY_ATTENDANCE_PATH}/${date}`));
    return snapshot.exists() ? snapshot.val() : {};
}
export const savenurseryAttendance = async (date: string, attendance: any) => {
    await set(ref(db, `${NURSERY_ATTENDANCE_PATH}/${date}`), attendance);
}
export const getArchivednurseryLogs = async () => {
    const snapshot = await get(ref(db, ARCHIVED_NURSERY_LOGS_PATH));
    return snapshot.exists() ? Object.values(snapshot.val()) : [];
}
export const saveArchivednurseryLogs = async (logs: any) => {
    await set(ref(db, ARCHIVED_NURSERY_LOGS_PATH), logs);
}

// Global App Settings
const APP_SETTINGS_PATH = 'appSettings';

export const getSlideshowImages = async () => {
    const snapshot = await get(ref(db, `${APP_SETTINGS_PATH}/slideshowImages`));
    return snapshot.exists() ? snapshot.val() : null;
};
export const setSlideshowImages = async (images: any) => {
    await set(ref(db, `${APP_SETTINGS_PATH}/slideshowImages`), images);
};
export const getLogoUrl = async () => {
    const snapshot = await get(ref(db, `${APP_SETTINGS_PATH}/logoUrl`));
    return snapshot.exists() ? snapshot.val() : null;
};
export const setLogoUrl = async (url: string) => {
    await set(ref(db, `${APP_SETTINGS_PATH}/logoUrl`), url);
};
export const clearLogoUrl = async () => {
    await set(ref(db, `${APP_SETTINGS_PATH}/logoUrl`), null);
};
