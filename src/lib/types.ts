

import type { LucideIcon } from 'lucide-react';

export type Guardian = {
  firstName: string;
  lastName: string;
  relationship: string;
  contact: string; // email
  phone: string;
  occupation?: string;
  placeOfEmployment?: string;
  workNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  addressSameAsGuardian1?: boolean;
};

export type AuthorizedPickup = {
  name: string;
  relationship: string;
  phone: string;
};

export type StudentDocument = {
  name: string;
  url: string; // Data URL for the file
  type: string; // e.g., 'application/pdf'
};

export type Student = {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: 'Male' | 'Female';
  avatarUrl: string;
  imageHint: string;
  preschool?: boolean;
  afterCare?: boolean;
  nursery?: boolean;
  status?: 'enrolled' | 'graduated' | 'pending';
  graduationDate?: string;
  // Extended details from form
  guardians: Guardian[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  authorizedPickups?: AuthorizedPickup[];
  documents?: StudentDocument[];
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
  grade: 'Mastery' | 'Satisfactory' | 'Fair' | 'Incomplete' | '';
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
    amountPaid: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    plan: 'Full Payment' | 'Two Installments' | 'Monthly Plan';
};

export type UserRole = 'Admin' | 'Teacher';

export type User = {
  id: string;
  username: string; // This is the display name
  email?: string; // This is the login email
  role: UserRole;
  password?: string; // Should be handled securely in a real app
  avatarUrl: string;
  imageHint: string;
};

export type SessionUser = Omit<User, 'password'>;


export type Permission = {
    id: string;
    label: string;
    role: 'Teacher' | 'Admin';
    allowed: boolean;
}

export type StaffRole = 'Preschool Attendant' | 'Aftercare Attendant' | 'Nursery Attendant';

export type Staff = {
  id: string;
  name: string;
  dob: string;
  age: number;
  address: string;
  roles: StaffRole[];
  avatarUrl: string;
  imageHint: string;
};

export type StaffSchedule = {
  [staffId: string]: {
    [day: string]: string; // e.g., '9am-5pm'
  };
};

export type StaffClockStatus = 'Clocked-In' | 'Clocked-Out';

export type StaffClockRecord = {
  status: StaffClockStatus;
  checkInTime?: string;
  checkOutTime?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
  isLate?: boolean;
};

export type StaffAttendance = {
  [staffId: string]: StaffClockRecord;
};

export type ArchivedStaffLog = {
    date: string; // YYYY-MM-DD
    records: (Staff & { log: StaffClockRecord })[];
}
