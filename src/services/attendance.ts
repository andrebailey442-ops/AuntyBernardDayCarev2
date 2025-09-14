
'use server';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Attendance } from '@/lib/types';

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
