import type { Student, Grade, Attendance, FormDocument } from '@/lib/types';

export const STUDENTS: Student[] = [
  { id: '1', name: 'Liam Smith', age: 4, parentContact: 'liamsmith.parent@example.com', avatarUrl: 'https://picsum.photos/seed/101/100/100', imageHint: 'child portrait' },
  { id: '2', name: 'Olivia Brown', age: 5, parentContact: 'oliviabrown.parent@example.com', avatarUrl: 'https://picsum.photos/seed/102/100/100', imageHint: 'child smiling' },
  { id: '3', name: 'Noah Johnson', age: 4, parentContact: 'noahjohnson.parent@example.com', avatarUrl: 'https://picsum.photos/seed/103/100/100', imageHint: 'kid playing' },
  { id: '4', name: 'Emma Wilson', age: 5, parentContact: 'emmawilson.parent@example.com', avatarUrl: 'https://picsum.photos/seed/104/100/100', imageHint: 'girl laughing' },
  { id: '5', name: 'Lucas Taylor', age: 4, parentContact: 'lucastaylor.parent@example.com', avatarUrl: 'https://picsum.photos/seed/105/100/100', imageHint: 'boy reading' },
  { id: '6', name: 'Ava Miller', age: 5, parentContact: 'avamiller.parent@example.com', avatarUrl: 'https://picsum.photos/seed/106/100/100', imageHint: 'child painting' },
];

export const GRADES: Grade[] = [
  { id: 'g1', studentId: '1', category: 'daily', subject: 'Art', grade: 'A', date: '2024-05-20', notes: 'Excellent participation in finger painting.' },
  { id: 'g2', studentId: '1', category: 'projects', subject: 'Science', grade: 'B', date: '2024-05-22', notes: 'Good effort on the plant growing project.' },
  { id: 'g3', studentId: '2', category: 'daily', subject: 'Music', grade: 'A', date: '2024-05-21', notes: 'Enthusiastically sang all the songs.' },
  { id: 'g4', studentId: '3', category: 'tests', subject: 'Math', grade: 'C', date: '2024-05-23', notes: 'Struggled with number recognition 1-10.' },
  { id: 'g5', studentId: '4', category: 'quizzes', subject: 'Language', grade: 'B', date: '2024-05-24', notes: 'Recognized most alphabet letters.' },
  { id: 'g6', studentId: '5', category: 'daily', subject: 'Reading', grade: 'A', date: '2024-05-20', notes: 'Listened attentively during story time.' },
  { id: 'g7', studentId: '6', category: 'projects', subject: 'Building', grade: 'A', date: '2024-05-25', notes: 'Built a very creative block tower.' },
];

export const ATTENDANCE: Attendance[] = [
  { id: 'a1', studentId: '1', date: '2024-05-20', status: 'present' },
  { id: 'a2', studentId: '2', date: '2024-05-20', status: 'present' },
  { id: 'a3', studentId: '3', date: '2024-05-20', status: 'present' },
  { id: 'a4', studentId: '4', date: '2024-05-20', status: 'absent' },
  { id: 'a5', studentId: '5', date: '2024-05-20', status: 'present' },
  { id: 'a6', studentId: '6', date: '2024-05-20', status: 'present' },
  { id: 'a7', studentId: '1', date: '2024-05-21', status: 'present' },
  { id: 'a8', studentId: '2', date: '2024-05-21', status: 'present' },
  { id: 'a9', studentId: '3', date: '2024-05-21', status: 'tardy' },
  { id: 'a10', studentId: '4', date: '2024-05-21', status: 'present' },
  { id: 'a11', studentId: '5', date: '2024-05-21', status: 'present' },
  { id: 'a12', studentId: '6', date: '2024-05-21', status: 'present' },
];


export const FORMS: FormDocument[] = [
    { id: 'f1', title: 'Student Application Form', description: 'New student enrollment application.', icon: 'FileText' },
    { id: 'f2', title: 'Medical Information Form', description: 'Emergency contacts and health details.', icon: 'HeartPulse' },
    { id: 'f3', title: 'Photo Release Consent', description: 'Permission to use student photos.', icon: 'Camera' },
    { id: 'f4', title: 'Field Trip Permission Slip', description: 'Consent for off-campus activities.', icon: 'Bus' },
];
