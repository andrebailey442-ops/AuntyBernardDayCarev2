

import type { Staff, StaffSchedule, StaffAttendance, ArchivedStaffLog } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set, update } from 'firebase/database';
import { STAFF_PATH, STAFF_SCHEDULE_PATH, STAFF_ATTENDANCE_PATH, ARCHIVED_STAFF_LOGS_PATH } from '@/lib/firebase-db';

// Staff Management
export const getStaff = async (): Promise<Staff[]> => {
    const snapshot = await get(ref(db, STAFF_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    return [];
};

export const getStaffMember = async (id: string): Promise<Staff | undefined> => {
    const staffRef = ref(db, `${STAFF_PATH}/${id}`);
    const snapshot = await get(staffRef);
    return snapshot.exists() ? snapshot.val() : undefined;
}

export const addStaff = async (staffData: Omit<Staff, 'id' | 'avatarUrl' | 'imageHint'>) => {
    const id = `staff-${Date.now()}`;
    const newStaff = { 
        ...staffData,
        id,
        avatarUrl: `https://i.pravatar.cc/150?u=${staffData.name.replace(/\s/g, '')}`,
        imageHint: 'person',
     };
    await set(ref(db, `${STAFF_PATH}/${id}`), newStaff);
}

export const updateStaff = async (id: string, staffData: Partial<Omit<Staff, 'id'>>): Promise<Staff | undefined> => {
    const staffRef = ref(db, `${STAFF_PATH}/${id}`);
    await update(staffRef, staffData);
    const snapshot = await get(staffRef);
    return snapshot.val();
}

export const deleteStaff = async (staffId: string) => {
    await set(ref(db, `${STAFF_PATH}/${staffId}`), null);
};


// Schedule Management
export const getStaffSchedule = async (): Promise<StaffSchedule> => {
    const snapshot = await get(ref(db, STAFF_SCHEDULE_PATH));
    return snapshot.exists() ? snapshot.val() : {};
};

export const setStaffSchedule = async (schedule: StaffSchedule) => {
    await set(ref(db, STAFF_SCHEDULE_PATH), schedule);
};

// Attendance Management
export const getStaffAttendance = async (date: string): Promise<StaffAttendance> => {
    const snapshot = await get(ref(db, `${STAFF_ATTENDANCE_PATH}/${date}`));
    return snapshot.exists() ? snapshot.val() : {};
}

export const setStaffAttendance = async (date: string, attendance: StaffAttendance) => {
    await set(ref(db, `${STAFF_ATTENDANCE_PATH}/${date}`), attendance);
};

// Logbook
export const getArchivedStaffLogs = async (): Promise<ArchivedStaffLog[]> => {
    const snapshot = await get(ref(db, ARCHIVED_STAFF_LOGS_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    return [];
}

export const saveArchivedStaffLogs = async (logs: ArchivedStaffLog[]) => {
    await set(ref(db, ARCHIVED_STAFF_LOGS_PATH), logs);
}
