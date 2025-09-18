
import type { Staff, StaffRole, StaffSchedule, StaffAttendance } from '@/lib/types';
import { STAFF } from '@/lib/data';
import { format } from 'date-fns';

const STAFF_STORAGE_KEY = 'staff';
const STAFF_SCHEDULE_STORAGE_KEY = 'staffSchedule';
const STAFF_ATTENDANCE_STORAGE_KEY_PREFIX = 'staffAttendance_';

// Staff Management
const getStoredStaff = (): Staff[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STAFF_STORAGE_KEY);
    return data ? JSON.parse(data) : STAFF;
};

const setStoredStaff = (staff: Staff[]) => {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
};

export const getStaff = (): Staff[] => {
    return getStoredStaff();
};

export const addStaff = (name: string, role: StaffRole): Staff => {
    const staff = getStoredStaff();
    const newStaff: Staff = {
        id: `staff-${Date.now()}`,
        name,
        role,
        avatarUrl: `https://i.pravatar.cc/150?u=${name.replace(/\s/g, '')}`,
        imageHint: 'person',
    };
    staff.push(newStaff);
    setStoredStaff(staff);
    return newStaff;
};

export const deleteStaff = (staffId: string) => {
    let staff = getStoredStaff();
    staff = staff.filter(s => s.id !== staffId);
    setStoredStaff(staff);
};


// Schedule Management
const getStoredSchedule = (): StaffSchedule => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STAFF_SCHEDULE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
};

const setStoredSchedule = (schedule: StaffSchedule) => {
    localStorage.setItem(STAFF_SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
};

export const getStaffSchedule = (): StaffSchedule => {
    return getStoredSchedule();
};

export const setStaffSchedule = (schedule: StaffSchedule) => {
    setStoredSchedule(schedule);
};

// Attendance Management
const getStoredAttendance = (date: string): StaffAttendance => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(`${STAFF_ATTENDANCE_STORAGE_KEY_PREFIX}${date}`);
    return data ? JSON.parse(data) : {};
}

const setStoredAttendance = (date: string, attendance: StaffAttendance) => {
    localStorage.setItem(`${STAFF_ATTENDANCE_STORAGE_KEY_PREFIX}${date}`, JSON.stringify(attendance));
};


export const getStaffAttendance = (date: string): StaffAttendance => {
    return getStoredAttendance(date);
}

export const setStaffAttendance = (date: string, attendance: StaffAttendance) => {
    setStoredAttendance(date, attendance);
}
