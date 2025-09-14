
'use server';

import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Attendance, AttendanceStatus } from '@/lib/types';
import { format } from 'date-fns';

export const getAttendance = async (): Promise<Attendance[]> => {
    const attendanceCol = collection(db, 'attendance');
    const attendanceSnapshot = await getDocs(attendanceCol);
    const attendanceList = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
    return attendanceList;
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
    const attendanceCol = collection(db, 'attendance');
    const q = query(attendanceCol, where("studentId", "==", studentId));
    const attendanceSnapshot = await getDocs(q);
    const attendanceList = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
    return attendanceList;
}

export const upsertAttendance = async (studentId: string, subject: string, date: Date, status: AttendanceStatus) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const attendanceId = `${studentId}_${subject}_${formattedDate}`;
    const attendanceDocRef = doc(db, 'attendance', attendanceId);
    
    await setDoc(attendanceDocRef, {
        studentId,
        subject,
        date: formattedDate,
        status
    }, { merge: true });
}
