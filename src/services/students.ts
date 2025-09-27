

import type { Student, StudentStatus } from '@/lib/types';
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
const APP_SETTINGS_PATH = 'appSettings';

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
        // If student is being graduated or cancelled
        if (studentUpdate.status === 'graduated' || studentUpdate.status === 'cancelled') {
            const studentToArchive = { ...snapshot.val(), ...studentUpdate, archivedOn: new Date().toISOString() };
            const updates: { [key: string]: any } = {};
            updates[`${STUDENTS_PATH}/${id}`] = null;
            updates[`${ARCHIVED_STUDENTS_PATH}/${id}`] = studentToArchive;
            await update(ref(db), updates);
        } else {
            await update(studentRef, studentUpdate);
        }
    } else {
        await update(archivedStudentRef, studentUpdate);
    }
};


export const deleteStudent = async (id: string) => {
    const studentData = await getStudent(id);
    if (studentData) {
        const archivedStudent = { 
            ...studentData, 
            status: 'cancelled' as StudentStatus,
            archivedOn: new Date().toISOString()
        };
        const updates: { [key: string]: any } = {};
        updates[`${STUDENTS_PATH}/${id}`] = null;
        updates[`${ARCHIVED_STUDENTS_PATH}/${id}`] = archivedStudent;
        await update(ref(db), updates);
    }
};

export const reregisterStudent = async (studentId: string): Promise<Student | null> => {
    const archivedStudentRef = ref(db, `${ARCHIVED_STUDENTS_PATH}/${studentId}`);
    const snapshot = await get(archivedStudentRef);

    if (snapshot.exists()) {
        const archivedData = snapshot.val();
        
        const { archivedOn, graduationDate, status, ...restOfData } = archivedData;

        const newStudentData: Student = {
            ...restOfData,
            status: 'enrolled', // Re-register as enrolled
        };

        const updates: { [key: string]: any } = {};
        updates[`${STUDENTS_PATH}/${studentId}`] = newStudentData; // Restore with same ID
        updates[`${ARCHIVED_STUDENTS_PATH}/${studentId}`] = null; // Remove from archive
        
        await update(ref(db), updates);

        return newStudentData;
    }
    return null;
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

