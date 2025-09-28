

import type { Student, StudentActivityLogEntry, StudentStatus } from '@/lib/types';
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

export const getStudents = async (includeArchived = false): Promise<Student[]> => {
    const studentsSnapshot = await get(ref(db, STUDENTS_PATH));
    let students: Student[] = [];
    if (studentsSnapshot.exists()) {
        students = Object.values(studentsSnapshot.val());
    }

    if (includeArchived) {
        const archivedSnapshot = await get(ref(db, ARCHIVED_STUDENTS_PATH));
        if (archivedSnapshot.exists()) {
            students = [...students, ...Object.values(archivedSnapshot.val())];
        }
    }
    return students;
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

export const addStudent = async (id: string, student: Omit<Student, 'id' | 'status'>, performedBy?: string) => {
    const creationLog: StudentActivityLogEntry = {
        action: 'Profile Created',
        user: performedBy || 'System',
        date: new Date().toISOString(),
    };
    const newStudent: Student = {
        ...student,
        id,
        status: 'enrolled',
        activityLog: [creationLog],
    };
    await set(ref(db, `${STUDENTS_PATH}/${id}`), newStudent);
};

export const updateStudent = async (id: string, studentUpdate: Partial<Student>) => {
    const studentRef = ref(db, `${STUDENTS_PATH}/${id}`);
    const archivedStudentRef = ref(db, `${ARCHIVED_STUDENTS_PATH}/${id}`);

    const snapshot = await get(studentRef);
    if (snapshot.exists()) {
        const currentStudent = snapshot.val() as Student;
        
        let action = 'Profile Updated';
        let notes = '';

        if (studentUpdate.status && studentUpdate.status !== currentStudent.status) {
            action = `Status changed to ${studentUpdate.status}`;
        } else {
            const changes: string[] = [];
            for (const key in studentUpdate) {
                if (key === 'activityLog' || key === 'statusChangedBy' || key === 'statusChangedOn') continue;

                const typedKey = key as keyof Student;
                const oldValue = currentStudent[typedKey];
                const newValue = studentUpdate[typedKey];

                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    if (typeof newValue !== 'object' && typeof oldValue !== 'object') {
                        changes.push(`Changed ${key} from '${oldValue || 'empty'}' to '${newValue || 'empty'}'.`);
                    } else if (key === 'guardians' && Array.isArray(newValue) && Array.isArray(oldValue)) {
                        changes.push('Updated guardian information.');
                    } else if (key === 'authorizedPickups' && Array.isArray(newValue) && Array.isArray(oldValue)) {
                        changes.push('Updated authorized pickup list.');
                    } else {
                        changes.push(`Updated ${key}.`);
                    }
                }
            }
            if(changes.length > 0) {
                notes = changes.join(' ');
            } else {
                // If there are no other changes, don't log a generic "Profile Updated"
                return;
            }
        }
        
        const newLogEntry: StudentActivityLogEntry = {
            action,
            notes,
            user: studentUpdate.statusChangedBy || 'System',
            date: new Date().toISOString(),
        };

        const updatedActivityLog = [...(currentStudent.activityLog || []), newLogEntry];

        const fullUpdate = { ...studentUpdate, activityLog: updatedActivityLog };
        
        if (studentUpdate.status === 'graduated' || studentUpdate.status === 'cancelled') {
            const studentToArchive = { ...currentStudent, ...fullUpdate, archivedOn: new Date().toISOString() };
            const updates: { [key: string]: any } = {};
            updates[`${STUDENTS_PATH}/${id}`] = null;
            updates[`${ARCHIVED_STUDENTS_PATH}/${id}`] = studentToArchive;
            await update(ref(db), updates);
        } else {
            await update(studentRef, fullUpdate);
        }
    } else {
         const archivedSnapshot = await get(archivedStudentRef);
         if (archivedSnapshot.exists()) {
            await update(archivedStudentRef, studentUpdate);
         }
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
        
        const newId = `SID-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        
        const { id, archivedOn, graduationDate, status, ...restOfData } = archivedData;

        const newStudentData: Student = {
            ...restOfData,
            id: newId,
            status: 'enrolled', // Re-register as enrolled
        };

        const updates: { [key: string]: any } = {};
        updates[`${STUDENTS_PATH}/${newId}`] = newStudentData; // Add as new student
        
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
    try {
        const snapshot = await get(ref(db, `${APP_SETTINGS_PATH}/logoUrl`));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error: any) {
        if (error.message.includes('Permission denied')) {
            console.warn('Permission denied reading logo URL. This is expected before login.');
            return null;
        }
        throw error;
    }
};
export const setLogoUrl = async (url: string) => {
    await set(ref(db, `${APP_SETTINGS_PATH}/logoUrl`), url);
};
export const clearLogoUrl = async () => {
    await set(ref(db, `${APP_SETTINGS_PATH}/logoUrl`), null);
};
