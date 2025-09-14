

import type { Student, Subject, Grade, Attendance, Fee, User } from './types';

export const STUDENTS: Student[] = [];

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Math' },
  { id: 'science', name: 'Science' },
  { id: 'reading', name: 'Reading' },
  { id: 'art', name: 'Art' },
  { id: 'music', name: 'Music' },
];

export const GRADES: Grade[] = [];

export const ATTENDANCE: Attendance[] = [];

export const FEES: Fee[] = [];

export const USERS: User[] = [
    {
      id: 'user-1',
      username: 'Admin',
      role: 'Admin',
      password: 'admin',
      avatarUrl: 'https://picsum.photos/seed/admin/100/100',
      imageHint: 'person avatar'
    },
    {
        id: 'user-2',
        username: 'Teacher',
        role: 'Teacher',
        password: 'teacher',
        avatarUrl: 'https://picsum.photos/seed/teacher/100/100',
        imageHint: 'person avatar'
    }
];

export const PERMISSIONS: {id: string, label: string}[] = [
    { id: '/dashboard/student-management', label: 'Student Management' },
    { id: '/dashboard/attendance', label: 'Attendance' },
    { id: '/dashboard/grades', label: 'Grades' },
    { id: '/dashboard/financial', label: 'Financial' },
    { id: '/dashboard/forms', label: 'Forms' },
];

export const DEFAULT_TEACHER_PERMISSIONS: string[] = ['/dashboard/attendance', '/dashboard/grades'];
