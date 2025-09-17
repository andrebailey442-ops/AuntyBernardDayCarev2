
'use server';

import { getDb } from '@/lib/firebase';
import { USERS, STUDENTS, GRADES, ATTENDANCE, FEES, SUBJECTS, DEFAULT_TEACHER_PERMISSIONS } from '@/lib/data';

// This function will check if data exists and initialize it if it doesn't.
// It's a single entry point to avoid multiple checks across different services.
export const initializeData = async () => {
    const db = getDb();
    if (!db) {
        console.log('Database not available for initialization.');
        return;
    }

    const settingsCollection = db.collection('settings');
    const initDoc = await settingsCollection.doc('initialization').get();

    if (initDoc.exists) {
        return; // Data is already initialized
    }

    console.log('First time setup: Initializing all collections in Firestore...');

    const batch = db.batch();

    // Initialize Users
    USERS.forEach(user => {
        const docRef = db.collection('users').doc();
        batch.set(docRef, {
            username: user.username,
            role: user.role,
            password: user.password, // In a real app, hash this
            avatarUrl: user.avatarUrl,
            imageHint: user.imageHint,
        });
    });

    // Initialize Students
    STUDENTS.forEach(student => {
        const { id, ...studentData } = student;
        const docRef = db.collection('students').doc(id);
        batch.set(docRef, studentData);
    });

    // Initialize Subjects
    SUBJECTS.forEach(subject => {
        const docRef = db.collection('subjects').doc(subject.id);
        batch.set(docRef, { name: subject.name });
    });

    // Initialize Grades
    GRADES.forEach(grade => {
        const { id, ...gradeData } = grade;
        const docRef = db.collection('grades').doc(id);
        batch.set(docRef, gradeData);
    });

    // Initialize Attendance
    ATTENDANCE.forEach(att => {
        const { id, ...attData } = att;
        const docRef = db.collection('attendance').doc(id);
        batch.set(docRef, attData);
    });

    // Initialize Fees
    FEES.forEach(fee => {
        const { id, ...feeData } = fee;
        const docRef = db.collection('fees').doc(id);
        batch.set(docRef, feeData);
    });
    
    // Initialize Permissions
    const permissionsRef = settingsCollection.doc('teacher_permissions');
    batch.set(permissionsRef, { permissions: DEFAULT_TEACHER_PERMISSIONS });

    // Mark initialization as complete
    const initCompleteRef = settingsCollection.doc('initialization');
    batch.set(initCompleteRef, { completedAt: new Date().toISOString() });
    
    await batch.commit();

    console.log('Firestore data initialization complete.');
};
