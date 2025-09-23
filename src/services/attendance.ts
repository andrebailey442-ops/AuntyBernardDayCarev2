
import type { Attendance, AttendanceStatus } from '@/lib/types';
import { ATTENDANCE } from '@/lib/data';
import { format } from 'date-fns';

const ATTENDANCE_STORAGE_KEY = 'attendance';

export const getAttendance = (): Attendance[] => {
    if (typeof window === 'undefined') return [];
    
    const storedAttendance = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (storedAttendance) {
        return JSON.parse(storedAttendance);
    }
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(ATTENDANCE));
    return ATTENDANCE;
};

export const getAttendanceByStudent = (studentId: string): Attendance[] => {
    const allAttendance = getAttendance();
    return allAttendance.filter(a => a.studentId === studentId);
};

export const upsertAttendance = (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const allAttendance = getAttendance();
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

    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(allAttendance));
};

export const deleteAttendanceByStudentId = (studentId: string) => {
    const allAttendance = getAttendance();
    const updatedAttendance = allAttendance.filter(a => a.studentId !== studentId);
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updatedAttendance));
};
