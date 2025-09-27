

import type { Student, Subject, Fee, User, FormDocument, Staff, StaffRole } from './types';

export const STUDENTS: Student[] = [
  {
    id: 'SID-1001',
    name: 'Liam Johnson',
    age: 4,
    dob: '2020-05-23',
    gender: 'Male',
    guardians: [{ firstName: 'Sarah', lastName: 'Johnson', relationship: 'Mother', contact: 'liam.johnson.parent@example.com', phone: '876-555-0101', occupation: 'Doctor', placeOfEmployment: 'University Hospital', workNumber: '876-555-1111', address: '123 Maple St', city: 'Kingston', state: 'St. Andrew' }],
    avatarUrl: 'https://picsum.photos/seed/101/100/100',
    imageHint: 'child smiling',
    preschool: true,
    afterCare: true,
    nursery: false,
    status: 'enrolled',
    emergencyContactName: 'Robert Johnson',
    emergencyContactPhone: '876-555-0102',
    medicalConditions: 'None',
  }
];

export const ARCHIVED_STUDENTS: Student[] = [];

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Math' },
  { id: 'science', name: 'Science' },
  { id: 'reading', name: 'Reading' },
  { id: 'art', name: 'Art' },
  { id: 'music', name: 'Music' },
];

export const GRADES: Grade[] = [];

export const ATTENDANCE: Attendance[] = [];

export const FEES: Fee[] = [
  { id: 'fee-1001', studentId: 'SID-1001', amount: 3000, amountPaid: 3000, status: 'Paid', plan: 'Full Payment' },
];

export const USERS: User[] = [
    {
      id: 'user-1',
      username: 'Admin',
      email: 'admin@example.com',
      role: 'Admin',
      password: 'admin',
      avatarUrl: 'https://picsum.photos/seed/admin/100/100',
      imageHint: 'person avatar'
    },
    {
        id: 'user-2',
        username: 'Teacher',
        email: 'teacher@example.com',
        role: 'Teacher',
        password: 'teacher',
        avatarUrl: 'https://picsum.photos/seed/teacher/100/100',
        imageHint: 'person avatar'
    }
];

export const PERMISSIONS: {id: string, label: string}[] = [
    { id: '/dashboard/preschool', label: 'Preschool Dashboard' },
    { id: '/dashboard/student-management', label: 'Student Management' },
    { id: '/dashboard/attendance', label: 'Attendance' },
    { id: '/dashboard/grades', label: 'Grades' },
    { id: '/dashboard/forms', label: 'Forms' },
    { id: '/dashboard/reports', label: 'Reports' },
    { id: '/dashboard/graduation', label: 'Graduation' },
    { id: '/dashboard/after-care', label: 'After-Care' },
    { id: '/dashboard/nursery', label: 'Nursery' },
    { id: '/dashboard/manage-users', label: 'Manage Users'},
    { id: '/dashboard/staff', label: 'Staff Management' },
    { id: '/dashboard/archive', label: 'Archive' },
];

export const DEFAULT_TEACHER_PERMISSIONS: string[] = ['/dashboard/preschool', '/dashboard/attendance', '/dashboard/grades', '/dashboard/reports', '/dashboard/forms'];

export const FORMS: FormDocument[] = [
    {
      id: 'f1',
      title: 'New Student Application',
      description: 'Standard application form for all new student registrations.',
      icon: 'FileText',
    },
    {
      id: 'f2',
      title: 'Medical & Consent Form',
      description: 'Emergency contacts and medical consent for treatment.',
      icon: 'HeartPulse',
    },
];

export const STAFF: Staff[] = [
    {
      id: 'staff-1',
      name: 'Eleanor Vance',
      dob: '1990-05-15',
      age: 34,
      address: '789 Oak Street, Kingston',
      roles: ['Preschool Attendant'],
      avatarUrl: 'https://i.pravatar.cc/150?u=eleanor',
      imageHint: 'woman smiling'
    },
    {
      id: 'staff-2',
      name: 'Marcus Holloway',
      dob: '1988-11-22',
      age: 35,
      address: '456 Pine Avenue, Montego Bay',
      roles: ['Aftercare Attendant', 'Nursery Attendant'],
      avatarUrl: 'https://i.pravatar.cc/150?u=marcus',
      imageHint: 'man with glasses'
    },
    {
      id: 'staff-3',
      name: 'Clara Oswald',
      dob: '1995-03-01',
      age: 29,
      address: '123 Maple Drive, Ocho Rios',
      roles: ['Nursery Attendant'],
      avatarUrl: 'https://i.pravatar.cc/150?u=clara',
      imageHint: 'woman with dark hair'
    }
];


export const JAMAICAN_PARISHES = [
    { value: 'St. Andrew', label: 'St. Andrew' },
    { value: 'St. Catherine', label: 'St. Catherine' },
    { value: 'Clarendon', label: 'Clarendon' },
    { value: 'Manchester', label: 'Manchester' },
    { value: 'St. Elizabeth', label: 'St. Elizabeth' },
    { value: 'Westmoreland', label: 'Westmoreland' },
    { value: 'Hanover', label: 'Hanover' },
    { value: 'St. James', label: 'St. James' },
    { value: 'Trelawny', label: 'Trelawny' },
    { value: 'St. Ann', label: 'St. Ann' },
    { value: 'St. Mary', label: 'St. Mary' },
    { value: 'Portland', label: 'Portland' },
    { value: 'St. Thomas', label: 'St. Thomas' },
    { value: 'Kingston', label: 'Kingston' },
];

export const CITIES_BY_PARISH: { [key: string]: string[] } = {
    'Kingston': ['Kingston', 'Port Royal', 'Trenchtown'],
    'St. Andrew': ['Stony Hill', 'Liguanea', 'Half-Way-Tree', 'Gordon Town', 'Mavis Bank'],
    'St. Catherine': ['Spanish Town', 'Portmore', 'Old Harbour', 'Linstead', 'Ewarton'],
    'Clarendon': ['May Pen', 'Chapelton', 'Rocky Point', 'Frankfield'],
    'Manchester': ['Mandeville', 'Christiana', 'Porus', 'Williamsfield'],
    'St. Elizabeth': ['Black River', 'Santa Cruz', 'Malvern', 'Junction'],
    'Westmoreland': ['Savanna-la-Mar', 'Negril', 'Grange Hill', 'Whitehouse'],
    'Hanover': ['Lucea', 'Hopewell', 'Green Island', 'Sandy Bay'],
    'St. James': ['Montego Bay', 'Cambridge', 'Adelphi', 'Catadupa'],
    'Trelawny': ['Falmouth', 'Duncans', 'Clark\'s Town', 'Ulster Spring'],
    'St. Ann': ['St. Ann\'s Bay', 'Ocho Rios', 'Brown\'s Town', 'Runaway Bay', 'Discovery Bay'],
    'St. Mary': ['Port Maria', 'Oracabessa', 'Highgate', 'Annotto Bay'],
    'Portland': ['Port Antonio', 'Buff Bay', 'Manchioneal', 'Hope Bay'],
    'St. Thomas': ['Morant Bay', 'Yallahs', 'Seaforth', 'Golden Grove'],
};
