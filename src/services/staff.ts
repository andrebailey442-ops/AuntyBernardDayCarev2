
import type { Staff, StaffSchedule, StaffAttendance, ArchivedStaffLog } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { ref, get, set, remove, push } from 'firebase/database';
import { STAFF_PATH, STAFF_SCHEDULE_PATH, STAFF_ATTENDANCE_PATH, ARCHIVED_STAFF_LOGS_PATH } from '@/lib/firebase-db';

// Staff Management
export const getStaff = async (): Promise<Staff[]> => {
    const staffRef = ref(db, STAFF_PATH);
    const snapshot = await get(staffRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

export const getStaffMember = async (id: string): Promise<Staff | null> => {
    const staffRef = ref(db, `${STAFF_PATH}/${id}`);
    const snapshot = await get(staffRef);
    if (snapshot.exists()) {
        return { id, ...snapshot.val() };
    }
    return null;
}

export const addStaff = async (staffData: Omit<Staff, 'id' | 'avatarUrl' | 'imageHint'>): Promise<Staff> => {
    const staffListRef = ref(db, STAFF_PATH);
    const newStaffRef = push(staffListRef);
    const newStaff: Staff = {
        ...staffData,
        id: newStaffRef.key!,
        avatarUrl: `https://i.pravatar.cc/150?u=${staffData.name.replace(/\s/g, '')}`,
        imageHint: 'person',
    };
    await set(newStaffRef, newStaff);
    return newStaff;
};

export const updateStaff = async (id: string, staffData: Partial<Omit<Staff, 'id'>>): Promise<Staff | null> => {
    const staffRef = ref(db, `${STAFF_PATH}/${id}`);
    const snapshot = await get(staffRef);
    if (snapshot.exists()) {
        const currentData = snapshot.val();
        const updatedData = { ...currentData, ...staffData };
        await set(staffRef, updatedData);
        return { id, ...updatedData };
    }
    return null;
}

export const deleteStaff = async (staffId: string) => {
    const staffRef = ref(db, `${STAFF_PATH}/${staffId}`);
    await remove(staffRef);
};


// Schedule Management
export const getStaffSchedule = async (): Promise<StaffSchedule> => {
    const scheduleRef = ref(db, STAFF_SCHEDULE_PATH);
    const snapshot = await get(scheduleRef);
    return snapshot.exists() ? snapshot.val() : {};
};

export const setStaffSchedule = async (schedule: StaffSchedule) => {
    const scheduleRef = ref(db, STAFF_SCHEDULE_PATH);
    await set(scheduleRef, schedule);
};

// Attendance Management
export const getStaffAttendance = async (date: string): Promise<StaffAttendance> => {
    const attendanceRef = ref(db, `${STAFF_ATTENDANCE_PATH}/${date}`);
    const snapshot = await get(attendanceRef);
    return snapshot.exists() ? snapshot.val() : {};
}

export const setStaffAttendance = async (date: string, attendance: StaffAttendance) => {
    const attendanceRef = ref(db, `${STAFF_ATTENDANCE_PATH}/${date}`);
    await set(attendanceRef, attendance);
};

// Logbook
export const getArchivedStaffLogs = async (): Promise<ArchivedStaffLog[]> => {
    const logsRef = ref(db, ARCHIVED_STAFF_LOGS_PATH);
    const snapshot = await get(logsRef);
    if (snapshot.exists()) {
        return Object.values(snapshot.val());
    }
    return [];
}

export const saveArchivedStaffLogs = async (logs: ArchivedStaffLog[]) => {
    const logsRef = ref(db, ARCHIVED_STAFF_LOGS_PATH);
    await set(logsRef, logs);
}
