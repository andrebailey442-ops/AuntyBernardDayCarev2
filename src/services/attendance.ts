
import type { Attendance, AttendanceStatus } from '@/lib/types';
import { format } from 'date-fns';
import { db } from '@/lib/firebase-client';
import { ref, get, set, remove } from 'firebase/database';
import { ATTENDANCE_PATH } from '@/lib/firebase-db';

export const getAttendance = async (): Promise<Attendance[]> => {
    const attendanceRef = ref(db, ATTENDANCE_PATH);
    const snapshot = await get(attendanceRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
    }
    return [];
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    const allAttendance = await getAttendance();
    return allAttendance.filter(a => a.studentId === studentId);
};

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;
    const attendanceRef = ref(db, `${ATTENDANCE_PATH}/${attendanceId}`);

    const newAttendance: Attendance = {
        id: attendanceId,
        studentId,
        subject,
        date: formattedDate,
        status,
    };

    await set(attendanceRef, newAttendance);
};

export const deleteAttendanceByStudentId = async (studentId: string) => {
    const allAttendance = await getAttendance();
    const attendanceToDelete = allAttendance.filter(a => a.studentId === studentId);

    const promises = attendanceToDelete.map(a => {
        const attendanceRef = ref(db, `${ATTENDANCE_PATH}/${a.id}`);
        return remove(attendanceRef);
    });

    await Promise.all(promises);
};
