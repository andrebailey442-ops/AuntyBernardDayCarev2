
'use server';

import { db } from '@/lib/firebase';
import type { Attendance, AttendanceStatus } from '@/lib/types';
import { format } from 'date-fns';

const COLLECTION_NAME = 'attendance';

export const getAttendance = async (): Promise<Attendance[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => doc.data() as Attendance);
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    return snapshot.docs.map(doc => doc.data() as Attendance);
}

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;
    
    const attendanceDocRef = db.collection(COLLECTION_NAME).doc(attendanceId);

    const newRecord: Attendance = {
        id: attendanceId,
        studentId,
        subject,
        date: formattedDate,
        status
    };

    await attendanceDocRef.set(newRecord, { merge: true });
}
