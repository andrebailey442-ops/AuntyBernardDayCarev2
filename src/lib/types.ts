import type { LucideIcon } from 'lucide-react';

export type Student = {
  id: string;
  name: string;
  age: number;
  parentContact: string;
  avatarUrl: string;
  imageHint: string;
};

export type GradeCategory = 'daily' | 'projects' | 'tests' | 'quizzes';

export type Grade = {
  id: string;
  studentId: string;
  category: GradeCategory;
  subject: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | 'Incomplete';
  date: string;
  notes?: string;
};

export type AttendanceStatus = 'present' | 'absent' | 'tardy';

export type Attendance = {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
};

export type FormDocument = {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof import('lucide-react').icons;
};
