
'use server';

import type { Attendance, AttendanceStatus } from '@/lib/types';
import { format } from 'date-fns';
import { getFromLocalStorage, saveToLocalStorage, initializeLocalStorage } from '@/lib/local-storage';
import { ATTENDANCE } from '@/lib/data';

const STORAGE_KEY = 'attendance';

// Initialize with seed data if it doesn't exist
initializeLocalStorage(STORAGE_KEY, ATTENDANCE);

export const getAttendance = async (): Promise<Attendance[]> => {
    return getFromLocalStorage<Attendance>(STORAGE_KEY);
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    const allAttendance = await getAttendance();
    return allAttendance.filter(a => a.studentId === studentId);
}

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const allAttendance = await getAttendance();

    const attendanceId = `${studentId}_${subject}_${formattedDate}`;
    const existingIndex = allAttendance.findIndex(a => a.id === attendanceId);
    
    if (existingIndex > -1) {
        // Update existing record
        allAttendance[existingIndex] = { ...allAttendance[existingIndex], status };
    } else {
        // Add new record
        const newRecord: Attendance = {
            id: attendanceId,
            studentId,
            subject,
            date: formattedDate,
            status
        };
        allAttendance.push(newRecord);
    }
    
    saveToLocalStorage(STORAGE_KEY, allAttendance);
}
