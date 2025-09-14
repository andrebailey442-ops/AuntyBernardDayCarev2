
import type { LucideIcon } from 'lucide-react';

export type Student = {
  id: string;
  name: string;
  age: number;
  dob?: string;
  parentContact: string;
  avatarUrl: string;
  imageHint: string;
};

export type GradeCategory = 'daily' | 'projects' | 'tests' | 'quizzes';

export type Subject = {
    id: string;
    name: string;
}

export type Grade = {
  id: string;
  studentId: string;
  category: GradeCategory;
  subject: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | 'Incomplete' | '';
  date: string;
  notes?: string;
};

export type AttendanceStatus = 'present' | 'absent' | 'tardy';

export type Attendance = {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  subject: string;
};

export type FormDocument = {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof import('lucide-react').icons;
};

export type Fee = {
    id: string;
    studentId: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    plan: 'Full Payment' | 'Two Installments' | 'Monthly Plan';
};
