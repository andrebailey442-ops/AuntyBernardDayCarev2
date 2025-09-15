
'use server';

import type { Attendance, AttendanceStatus } from '@/lib/types';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

const COLLECTION_NAME = 'attendance';

export const getAttendance = async (): Promise<Attendance[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
     if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
}

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;
    
    const newRecord: Omit<Attendance, 'id'> = {
        studentId,
        subject,
        date: formattedDate,
        status
    };

    await db.collection(COLLECTION_NAME).doc(attendanceId).set(newRecord);
}

export const deleteAttendanceByStudentId = async (studentId: string) => {
    const snapshot = await db.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();
    if (snapshot.empty) {
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

export const initializeAttendanceData = async (initialData: Attendance[]) => {
    const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
    if (snapshot.empty && initialData.length > 0) {
        console.log('Initializing attendance collection...');
        const batch = db.batch();
        initialData.forEach(attendance => {
            const { id, ...attendanceData } = attendance;
            batch.set(db.collection(COLLECTION_NAME).doc(id), attendanceData);
        });
        await batch.commit();
    }
};
