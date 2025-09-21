
export const readmeContent = `
# Aunty Bernard DayCare and Pre-school Management App

This is a comprehensive, full-stack application designed to manage the daily operations of a daycare and preschool. Built with a modern tech stack, it provides administrators and teachers with the tools they need to manage students, staff, attendance, grades, and more.

The application is a Progressive Web App (PWA), meaning it can be installed on any device (desktop or mobile) for a native-app-like experience.

---

## Features

- **Multi-Program Management**: Separate dashboards for Preschool, After-Care, and Nursery programs.
- **Student Management**: A centralized system to add, edit, and view student profiles, including detailed guardian and medical information.
- **Staff Management**: Tools for administrators to manage staff profiles, weekly schedules, and daily clock-in/clock-out.
- **Attendance Tracking**:
    - **Students**: Daily, subject-based attendance tracking for preschool.
    - **Staff**: Real-time clock-in/clock-out with lateness detection.
- **Financial Management**: Track tuition fees, process payments, and generate invoices.
- **Academic Reporting**: Enter and manage student grades and generate printable report cards and graduation certificates.
- **Role-Based Access Control**: Differentiated permissions for 'Admin' and 'Teacher' roles, managed through the UI.
- **AI-Powered Features**:
    - **Smart Student Import**: Analyze spreadsheet data (XLSX, CSV) to intelligently map and import student records.
    - **Image Resizing**: Automatically resize and crop uploaded images for slideshows.
- **PWA Ready**: Installable on desktop and mobile devices for easy access.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (for cloud-based data storage)
- **Authentication**: Firebase Authentication
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)

---

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 1. Installation

\`\`\`bash
git clone <repository-url>
cd <project-directory>
npm install
\`\`\`

### 2. Firebase Setup

This project uses Firebase for authentication and database services.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App**: Inside your project, create a new Web App and copy the \`firebaseConfig\` object.
3.  **Environment Variables**: Create a \`.env.local\` file in the root of the project and add your Firebase configuration keys:

    \`\`\`
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    \`\`\`

4.  **Enable Services**: In the Firebase Console, enable **Firestore Database** and **Authentication** (with Email/Password).

### 3. Running the Development Server

To run the application in development mode, use:

\`\`\`bash
npm run dev
\`\`\`

This will start the Next.js development server, typically on \`http://localhost:3000\`.

---

## Project Structure

-   **/src/app**: Main application routes using the Next.js App Router.
    -   **/src/app/dashboard**: Contains all the protected routes and layouts for the main application dashboard.
        -   **/src/app/dashboard/[section]**: Each folder represents a major feature (e.g., \`preschool\`, \`staff\`, \`student-management\`).
        -   **/src/app/dashboard/[section]/_components**: Contains React components specific to that feature/section.
-   **/src/components**: Shared UI components.
    -   **/src/components/ui**: Auto-generated components from ShadCN UI.
-   **/src/services**: Data-handling logic. This is the "backend" of the frontend, abstracting all interactions with local storage or Firebase.
-   **/src/lib**: Core utilities, type definitions (\`types.ts\`), and data constants.
-   **/src/hooks**: Custom React hooks, such as \`useAuth\` for authentication state.
-   **/src/ai**: Contains all Genkit-related code.
    -   **/src/ai/flows**: Defines the AI flows (e.g., \`analyzeStudentImport\`) that orchestrate calls to the Gemini model.
-   **/public**: Static assets, including icons and the PWA manifest.

---

## Authentication & Data

-   **Authentication**: Managed by \`src/hooks/use-auth.tsx\`, which interacts with Firebase Auth. User session is persisted in local storage.
-   **Data Management**: The application was initially built using local storage but has been migrated to **Firebase Firestore**. All data services in \`/src/services\` now read from and write to Firestore collections, ensuring data is synchronized across all devices.

This README provides a solid foundation for anyone new to the project. Let me know if you'd like me to add more sections!
`;

export const handbookContent = `
# Aunty Bernard’s School App: Handbook

Welcome to our school's app! This handbook will help you learn how to use it. It’s your guide to managing our wonderful students across all programs.

---

## Getting Started

### How to Log In

1.  Go to the login page.
2.  Type in your assigned \`username\` and \`password\`.
3.  Default credentials are provided for initial setup:
    *   **Admin:** \`Admin\` / \`admin\`
    *   **Teacher:** \`Teacher\` / \`teacher\`

### The Main Dashboard

After you log in, you will see the main selection screen. From here, you can navigate to one of the four main sections of the application:
- **Preschool Management**
- **After-Care Management**
- **Nursery Management**
- **Staff Management**

---

## Preschool Management

This section is for all core school-day activities.

### Main Dashboard

The Preschool dashboard gives you a complete overview:
*   **Stats**: Total students, attendance rates, and active forms.
*   **Quick Links**: Buttons for common actions like adding a student, taking attendance, or entering grades.
*   **Student List**: A searchable list of all currently enrolled preschool students.
*   **Charts**: Visual summaries of weekly attendance and grade distribution.

### Student Management

*   **View All Students**: Search, filter, and sort all students in the system (enrolled, pending, or graduated).
*   **Bulk Actions**: Select multiple students to download their report cards at once.
*   **Student Actions (from dropdown menu)**:
    *   **View/Edit Profile**: Look at or change a student's information.
    *   **View Report Summary**: A quick pop-up with grades and attendance.
    *   **Full Report Page**: A dedicated, printable report card page.
    *   **Graduate**: Mark a student as "graduated" to move them to the alumni list.
    *   **Remove**: Permanently remove a student from the system.

### Add New Student

*   A multi-step form to register a new student.
*   **Student ID**: A unique ID is automatically generated.
*   **Program Enrollment**: Select which programs the student is enrolling in (Preschool, After-Care, Nursery).
*   **Status**: New students are "Enrolled" by default.
*   **Print Form**: You can download a blank, printable PDF of the registration form.

### Attendance

*   Select a date on the calendar.
*   Mark each student as \`Present\`, \`Absent\`, or \`Tardy\` for each subject.
*   Save all records with a single click.

### Grades

*   Assign a grade (\`A\`, \`B\`, \`C\`, etc.) for each student in each subject.
*   Search for specific students to quickly find and update their grades.
*   Save all changes at once.

### Financial (Admin Only)

*   See a list of all students and their payment status (\`Paid\`, \`Pending\`, \`Overdue\`).
*   **Make a Payment**: Process a payment for a student, which can update their status to "Enrolled".
*   **View Invoice**: Generate and download a detailed PDF invoice.

### Forms

*   A library of important documents like the \`New Student Application\`.
*   Download blank PDF copies for offline use.

### Reports

*   Search for any student (current or graduated).
*   Click **View Report** to see their full report card.
*   Print a professionally formatted PDF of the report card.

### Graduation

*   **Enrolled List**: See students ready for graduation and move them to the graduated list.
*   **Graduated History**: View lists of alumni, organized by graduation year.
*   **Generate Certificate**: Create and download a formal graduation certificate for any graduated student.

---

## After-Care & Nursery Management

These sections are for managing students in the after-care and nursery programs. Both function similarly.

*   **Check-in / Check-out**:
    *   The main table shows all students enrolled in the program.
    *   Click **Check In** when a student arrives and **Check Out** when they depart.
    *   Clock-in times and the user who performed the action are recorded.
*   **Overtime**: The system automatically calculates and flags overtime if a student is checked out late.
*   **Daily Log**: A separate table shows all students who have been checked out for the day.
*   **Archive**: At the end of the day, an administrator can **Clear & Archive Log**. This moves the daily records into the Log History and resets the dashboard for the next day.
*   **Log History**: Review and download PDF reports of check-in/out logs from previous days.

---

## Staff Management (Admin Only)

This section is for managing all staff members.

*   **Staff List**: View, edit, or remove staff profiles.
*   **Weekly Schedule**: Assign weekly shifts for each staff member in a simple grid. Download a printable roster.
*   **Daily Clock-in/Clock-out**: Similar to the student check-in, this allows for tracking staff attendance. It includes lateness detection.
*   **Log History**: Archive daily staff logs and review attendance from previous days.
*   **Staff Profile**: A detailed view of each staff member's information and assigned roles.

---

This handbook covers the main features of the application. For administrative tasks like managing user accounts and permissions, please refer to the **Administrator's Guide**.
`;

export const adminManualContent = `
# Aunty Bernard’s School App: Administrator's Guide

This guide is exclusively for administrators. It covers special permissions and tasks that are only available to users with the 'Admin' role.

For general application features, please refer to the main **School App Handbook**.

---

## Administrator-Only Capabilities

As an administrator, you have full access to all features in the app, plus these powerful tools:

*   **Manage Users**: Add, edit, and remove user accounts (both Admins and Teachers).
*   **Manage Role Permissions**: Control which pages and features are accessible to the 'Teacher' role.
*   **Manage Staff**: Add, edit, and schedule staff members.
*   **Financial Oversight**: Full access to student financial records, including processing payments.
*   **System Configuration**: Update the application logo and slideshow images.

---

## User & Permission Management

The **Manage Users** page (accessible from the user dropdown menu) is your central hub for controlling who can access the application and what they can do.

### User Management

This section lists all current users of the app.

*   **View Users**: See a list of all users, their email, and their assigned role (\`Admin\` or \`Teacher\`).
*   **Add New Staff/User**:
    1.  Click the **Add Staff** button.
    2.  Fill in the user's name, email, a temporary password, and assign a role.
    3.  Click **Add Staff**. The user is now active.
*   **Edit a User**:
    1.  Click the three-dots menu next to a user's name and select **Edit Profile**.
    2.  You can change their role or set a new password.
*   **Remove a User**:
    1.  Select **Remove User** from the dropdown menu.
    2.  Confirm the action. This is permanent and cannot be undone.

### Role Permissions Management

This section allows you to customize the user experience for teachers.

*   **How it Works**: The grid lists all major pages of the application. Checking a box grants all users with the 'Teacher' role access to that page. Unchecking it removes the link from their navigation menu.
*   **Default Admin Permissions**: Administrators have access to all pages. The "Manage Users" permission is locked for Admins.
*   **Saving Changes**:
    1.  Use the checkboxes to grant or revoke access for the 'Teacher' role.
    2.  Click **Save Teacher Permissions**. The changes take effect immediately for all teacher accounts.

---

## Staff Management

The **Staff** section is where you manage employee profiles, schedules, and attendance.

*   **Staff Profiles**: Add new staff members with their personal details and assigned roles (e.g., 'Preschool Attendant').
*   **Weekly Schedule**: Use the interactive table to set the work schedule for each staff member for the entire week. You can also download a printable PDF of the weekly roster.
*   **Daily Clock-in/Clock-out**: Monitor staff attendance in real-time. The system automatically flags late clock-ins.
*   **Edit Clock-in Time**: As an admin, you can manually adjust a staff member's clock-in time if they forgot to do it themselves.
*   **Log Archiving**: At the end of each day, archive the attendance log to keep records clean and ready for the next day.

---

## System Configuration

### Manage Slideshow Images

From any of the main dashboard pages (Preschool, After-Care, Nursery), you can manage the hero slideshow images.

1.  Click your user avatar in the top-right corner.
2.  Select **Manage Images** from the dropdown menu.
3.  In the dialog, you can remove existing images or upload new ones.
4.  Uploaded images are automatically resized and cropped by an AI to fit the slideshow dimensions perfectly.

### Update Application Logo

1.  Click your user avatar.
2.  Select **Update Logo**.
3.  Upload a new image file to replace the default "Busy Bee" logo throughout the application. You can also reset it back to the default.

---

That’s all for the administrator's guide! For all other features, please refer to the main **School App Handbook**.
`;
