
import type { Staff, StaffSchedule, StaffAttendance, ArchivedStaffLog } from '@/lib/types';
import { STAFF } from '@/lib/data';

const STAFF_STORAGE_KEY = 'staff';
const STAFF_SCHEDULE_STORAGE_KEY = 'staff_schedule';
const STAFF_ATTENDANCE_STORAGE_KEY = 'staff_attendance';
const ARCHIVED_STAFF_LOGS_STORAGE_KEY = 'archived_staff_logs';


// Staff Management
export const getStaff = (): Staff[] => {
    if (typeof window === 'undefined') return [];
    
    const storedStaff = localStorage.getItem(STAFF_STORAGE_KEY);
    if (storedStaff) {
        return JSON.parse(storedStaff);
    }
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(STAFF));
    return STAFF;
};

export const getStaffMember = (id: string): Staff | undefined => {
    return getStaff().find(s => s.id === id);
}

export const addStaff = (staffData: Omit<Staff, 'id' | 'avatarUrl' | 'imageHint'>) => {
    const allStaff = getStaff();
    const newStaff = { 
        ...staffData,
        id: `staff-${Date.now()}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${staffData.name.replace(/\s/g, '')}`,
        imageHint: 'person',
     };
    allStaff.push(newStaff);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(allStaff));
}

export const updateStaff = (id: string, staffData: Partial<Omit<Staff, 'id'>>): Staff | undefined => {
    const allStaff = getStaff();
    const index = allStaff.findIndex(s => s.id === id);
    if (index > -1) {
        allStaff[index] = { ...allStaff[index], ...staffData };
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(allStaff));
        return allStaff[index];
    }
    return undefined;
}

export const deleteStaff = (staffId: string) => {
    const allStaff = getStaff();
    const updatedStaff = allStaff.filter(s => s.id !== staffId);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
};


// Schedule Management
export const getStaffSchedule = (): StaffSchedule => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(STAFF_SCHEDULE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
};

export const setStaffSchedule = (schedule: StaffSchedule) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STAFF_SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
};

// Attendance Management
export const getStaffAttendance = (date: string): StaffAttendance => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(`${STAFF_ATTENDANCE_STORAGE_KEY}_${date}`);
    return stored ? JSON.parse(stored) : {};
}

export const setStaffAttendance = (date: string, attendance: StaffAttendance) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STAFF_ATTENDANCE_STORAGE_KEY}_${date}`, JSON.stringify(attendance));
};

// Logbook
export const getArchivedStaffLogs = (): ArchivedStaffLog[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ARCHIVED_STAFF_LOGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

export const saveArchivedStaffLogs = (logs: ArchivedStaffLog[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ARCHIVED_STAFF_LOGS_STORAGE_KEY, JSON.stringify(logs));
}
