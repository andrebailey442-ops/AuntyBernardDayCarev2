
import type { Attendance, AttendanceStatus } from '@/lib/types';
import { format } from 'date-fns';

const ATTENDANCE_STORAGE_KEY = 'attendance';

const getStoredAttendance = (): Attendance[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const setStoredAttendance = (attendance: Attendance[]) => {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendance));
};

export const getAttendance = (): Attendance[] => {
    return getStoredAttendance();
};

export const getAttendanceByStudent = (studentId: string): Attendance[] => {
    const allAttendance = getStoredAttendance();
    return allAttendance.filter(a => a.studentId === studentId);
};

export const upsertAttendance = (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const allAttendance = getStoredAttendance();
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;

    const existingIndex = allAttendance.findIndex(a => a.id === attendanceId);

    if (existingIndex > -1) {
        allAttendance[existingIndex] = { ...allAttendance[existingIndex], status };
    } else {
        allAttendance.push({
            id: attendanceId,
            studentId,
            subject,
            date: formattedDate,
            status,
        });
    }

    setStoredAttendance(allAttendance);
};

export const deleteAttendanceByStudentId = (studentId: string) => {
    let allAttendance = getStoredAttendance();
    allAttendance = allAttendance.filter(a => a.studentId !== studentId);
    setStoredAttendance(allAttendance);
};
