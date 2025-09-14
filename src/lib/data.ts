
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
    }
];
