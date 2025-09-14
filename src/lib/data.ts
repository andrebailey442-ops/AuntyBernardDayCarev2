import type { Student, Grade, Attendance, FormDocument, Subject, Fee } from '@/lib/types';

export const STUDENTS: Student[] = [
  { id: 'SID-1721256311311', name: 'Liam Smith', age: 4, parentContact: 'liamsmith.parent@example.com', avatarUrl: 'https://picsum.photos/seed/101/100/100', imageHint: 'child portrait' },
  { id: 'SID-1721256389898', name: 'Olivia Brown', age: 5, parentContact: 'oliviabrown.parent@example.com', avatarUrl: 'https://picsum.photos/seed/102/100/100', imageHint: 'child smiling' },
  { id: 'SID-1721256445123', name: 'Noah Johnson', age: 4, parentContact: 'noahjohnson.parent@example.com', avatarUrl: 'https://picsum.photos/seed/103/100/100', imageHint: 'kid playing' },
  { id: 'SID-1721256478543', name: 'Emma Wilson', age: 5, parentContact: 'emmawilson.parent@example.com', avatarUrl: 'https://picsum.photos/seed/104/100/100', imageHint: 'girl laughing' },
  { id: 'SID-1721256512987', name: 'Lucas Taylor', age: 4, parentContact: 'lucastaylor.parent@example.com', avatarUrl: 'https://picsum.photos/seed/105/100/100', imageHint: 'boy reading' },
  { id: 'SID-1721256543210', name: 'Ava Miller', age: 5, parentContact: 'avamiller.parent@example.com', avatarUrl: 'https://picsum.photos/seed/106/100/100', imageHint: 'child painting' },
];

export const SUBJECTS: Subject[] = [
    { id: 'math', name: 'Mathematics' },
    { id: 'lang', name: 'Language Arts' },
    { id: 'art', name: 'Arts' },
    { id: 'music', name: 'Music' },
    { id: 'science', name: 'Science' },
    { id: 'reading', name: 'Reading' },
    { id: 'building', name: 'Building' },
];

export const GRADES: Grade[] = [
  { id: 'g1', studentId: 'SID-1721256311311', category: 'daily', subject: 'art', grade: 'A', date: '2024-05-20', notes: 'Excellent participation in finger painting.' },
  { id: 'g2', studentId: 'SID-1721256311311', category: 'projects', subject: 'science', grade: 'B', date: '2024-05-22', notes: 'Good effort on the plant growing project.' },
  { id: 'g3', studentId: 'SID-1721256389898', category: 'daily', subject: 'music', grade: 'A', date: '2024-05-21', notes: 'Enthusiastically sang all the songs.' },
  { id: 'g4', studentId: 'SID-1721256445123', category: 'tests', subject: 'math', grade: 'C', date: '2024-05-23', notes: 'Struggled with number recognition 1-10.' },
  { id: 'g5', studentId: 'SID-1721256478543', category: 'quizzes', subject: 'lang', grade: 'B', date: '2024-05-24', notes: 'Recognized most alphabet letters.' },
  { id: 'g6', studentId: 'SID-1721256512987', category: 'daily', subject: 'reading', grade: 'A', date: '2024-05-20', notes: 'Listened attentively during story time.' },
  { id: 'g7', studentId: 'SID-1721256543210', category: 'projects', subject: 'building', grade: 'A', date: '2024-05-25', notes: 'Built a very creative block tower.' },
];

export const ATTENDANCE: Attendance[] = [
  { id: 'a1', studentId: 'SID-1721256311311', date: '2024-05-20', status: 'present', subject: 'art' },
  { id: 'a2', studentId: 'SID-1721256389898', date: '2024-05-20', status: 'present', subject: 'art' },
  { id: 'a3', studentId: 'SID-1721256445123', date: '2024-05-20', status: 'present', subject: 'art' },
  { id: 'a4', studentId: 'SID-1721256478543', date: '2024-05-20', status: 'absent', subject: 'art' },
  { id: 'a5', studentId: 'SID-1721256512987', date: '2024-05-20', status: 'present', subject: 'art' },
  { id: 'a6', studentId: 'SID-1721256543210', date: '2024-05-20', status: 'present', subject: 'art' },
  { id: 'a7', studentId: 'SID-1721256311311', date: '2024-05-21', status: 'present', subject: 'music' },
  { id: 'a8', studentId: 'SID-1721256389898', date: '2024-05-21', status: 'present', subject: 'music' },
  { id: 'a9', studentId: 'SID-1721256445123', date: '2024-05-21', status: 'tardy', subject: 'music' },
  { id: 'a10', studentId: 'SID-1721256478543', date: '2024-05-21', status: 'present', subject: 'music' },
  { id: 'a11', studentId: 'SID-1721256512987', date: '2024-05-21', status: 'present', subject: 'music' },
  { id: 'a12', studentId: 'SID-1721256543210', date: '2024-05-21', status: 'present', subject: 'music' },
];


export const FORMS: FormDocument[] = [
    { id: 'f1', title: 'New Student Application', description: 'Complete this form to enroll a new student.', icon: 'FileText' },
    { id: 'f2', title: 'Medical & Consent Form', description: 'Provide health details and give consent for school activities.', icon: 'HeartPulse' },
];

export const FEES: Fee[] = [
    { id: 'fee1', studentId: 'SID-1721256311311', amount: 2375.00, status: 'Paid', plan: 'Full Payment' },
    { id: 'fee2', studentId: 'SID-1721256389898', amount: 1250.00, status: 'Pending', plan: 'Two Installments' },
    { id: 'fee3', studentId: 'SID-1721256445123', amount: 625.00, status: 'Paid', plan: 'Monthly Plan' },
    { id: 'fee4', studentId: 'SID-1721256478543', amount: 2500.00, status: 'Overdue', plan: 'Two Installments' },
    { id: 'fee5', studentId: 'SID-1721256512987', amount: 625.00, status: 'Pending', plan: 'Monthly Plan' },
    { id: 'fee6', studentId: 'SID-1721256543210', amount: 2375.00, status: 'Paid', plan: 'Full Payment' },
];
