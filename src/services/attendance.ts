import type { Attendance, AttendanceStatus } from '@/lib/types';
import { format } from 'date-fns';

const COLLECTION_NAME = 'attendance';

const getAttendanceFromStorage = (): Attendance[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COLLECTION_NAME);
    return data ? JSON.parse(data) : [];
};

const saveAttendanceToStorage = (data: Attendance[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COLLECTION_NAME, JSON.stringify(data));
};

export const initializeAttendanceData = (initialData: Attendance[]) => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(COLLECTION_NAME)) {
        saveAttendanceToStorage(initialData);
    }
};

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

    const newRecord: Attendance = {
        id: attendanceId,
        studentId,
        subject,
        date: formattedDate,
        status
    };

    if (existingIndex > -1) {
        allAttendance[existingIndex] = newRecord;
    } else {
        allAttendance.push(newRecord);
    }
    saveAttendanceToStorage(allAttendance);
}