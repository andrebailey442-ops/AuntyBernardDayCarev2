
'use server';

import type { Attendance, AttendanceStatus } from '@/lib/types';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export const getAttendance = async (): Promise<Attendance[]> => {
    if (!db) return [];
    const snapshot = await db.collection('attendance').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    if (!db) return [];
    const snapshot = await db.collection('attendance').where('studentId', '==', studentId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
}

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    if (!db) return;
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;

    const attendanceRef = db.collection('attendance').doc(attendanceId);
    
    await attendanceRef.set({
        studentId,
        subject,
        date: formattedDate,
        status
    }, { merge: true });
}

export const deleteAttendanceByStudentId = async (studentId: string) => {
    if (!db) return;
    const snapshot = await db.collection('attendance').where('studentId', '==', studentId).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};
