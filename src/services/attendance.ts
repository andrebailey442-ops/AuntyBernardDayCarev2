
'use client';

import type { Attendance, AttendanceStatus } from '@/lib/types';
import { ATTENDANCE } from '@/lib/data';
import { format } from 'date-fns';

const ATTENDANCE_STORAGE_KEY = 'attendance';

const getAttendanceFromStorage = (): Attendance[] => {
    if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            // Initialize with default data if nothing is in storage
            localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(ATTENDANCE));
            return ATTENDANCE;
        }
    }
    return ATTENDANCE; // Fallback for server-side rendering
}

const saveAttendanceToStorage = (attendance: Attendance[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendance));
    }
}

export const getAttendance = async (): Promise<Attendance[]> => {
    return getAttendanceFromStorage();
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    const allAttendance = getAttendanceFromStorage();
    return allAttendance.filter(a => a.studentId === studentId);
}

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const allAttendance = getAttendanceFromStorage();
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;

    const existingIndex = allAttendance.findIndex(a => a.id === attendanceId);

    if (existingIndex !== -1) {
        allAttendance[existingIndex] = { ...allAttendance[existingIndex], status };
    } else {
        allAttendance.push({
            id: attendanceId,
            studentId,
            subject,
            date: formattedDate,
            status
        });
    }
    saveAttendanceToStorage(allAttendance);
}

export const deleteAttendanceByStudentId = async (studentId: string) => {
    let allAttendance = getAttendanceFromStorage();
    allAttendance = allAttendance.filter(a => a.studentId !== studentId);
    saveAttendanceToStorage(allAttendance);
};
