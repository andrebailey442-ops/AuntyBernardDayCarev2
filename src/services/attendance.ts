import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Attendance, AttendanceStatus } from '@/lib/types';
import { format } from 'date-fns';
import { ATTENDANCE } from '@/lib/data';

const COLLECTION_NAME = 'attendance';

export const initializeAttendanceData = async () => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        const promises = ATTENDANCE.map(item => setDoc(doc(db, COLLECTION_NAME, item.id), item));
        await Promise.all(promises);
    }
}

export const getAttendance = async (): Promise<Attendance[]> => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Attendance);
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    const q = query(collection(db, COLLECTION_NAME), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Attendance);
}

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;
    
    const attendanceDocRef = doc(db, COLLECTION_NAME, attendanceId);

    const newRecord: Attendance = {
        id: attendanceId,
        studentId,
        subject,
        date: formattedDate,
        status
    };

    await setDoc(attendanceDocRef, newRecord, { merge: true });
}
