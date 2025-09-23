
import type { Attendance, AttendanceStatus } from '@/lib/types';
import { ATTENDANCE } from '@/lib/data';
import { format } from 'date-fns';
import { db } from '@/lib/firebase-client';
import { ref, get, set } from 'firebase/database';
import { ATTENDANCE_PATH } from '@/lib/firebase-db';

export const getAttendance = async (): Promise<Attendance[]> => {
    const snapshot = await get(ref(db, ATTENDANCE_PATH));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    // If no data, initialize with default and return
    await set(ref(db, ATTENDANCE_PATH), ATTENDANCE);
    return ATTENDANCE;
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    const allAttendance = await getAttendance();
    return allAttendance.filter(a => a.studentId === studentId);
};

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;
    
    const newAttendanceRecord: Attendance = {
        id: attendanceId,
        studentId,
        subject,
        date: formattedDate,
        status,
    };
    
    await set(ref(db, `${ATTENDANCE_PATH}/${attendanceId}`), newAttendanceRecord);
};

export const deleteAttendanceByStudentId = async (studentId: string) => {
    const allAttendance = await getAttendance();
    const updates: { [key: string]: null } = {};
    allAttendance.forEach(a => {
        if (a.studentId === studentId) {
            updates[`${ATTENDANCE_PATH}/${a.id}`] = null;
        }
    });
    await set(ref(db), updates);
};
