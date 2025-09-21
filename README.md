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

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Firebase Setup

This project uses Firebase for authentication and database services.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App**: Inside your project, create a new Web App and copy the `firebaseConfig` object.
3.  **Environment Variables**: Create a `.env.local` file in the root of the project and add your Firebase configuration keys:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    ```

4.  **Enable Services**: In the Firebase Console, enable **Firestore Database** and **Authentication** (with Email/Password).

### 3. Running the Development Server

To run the application in development mode, use:

```bash
npm run dev
```

This will start the Next.js development server, typically on `http://localhost:3000`.

---

## Project Structure

-   **/src/app**: Main application routes using the Next.js App Router.
    -   **/src/app/dashboard**: Contains all the protected routes and layouts for the main application dashboard.
        -   **/src/app/dashboard/[section]**: Each folder represents a major feature (e.g., `preschool`, `staff`, `student-management`).
        -   **/src/app/dashboard/[section]/_components**: Contains React components specific to that feature/section.
-   **/src/components**: Shared UI components.
    -   **/src/components/ui**: Auto-generated components from ShadCN UI.
-   **/src/services**: Data-handling logic. This is the "backend" of the frontend, abstracting all interactions with local storage or Firebase.
-   **/src/lib**: Core utilities, type definitions (`types.ts`), and data constants.
-   **/src/hooks**: Custom React hooks, such as `useAuth` for authentication state.
-   **/src/ai**: Contains all Genkit-related code.
    -   **/src/ai/flows**: Defines the AI flows (e.g., `analyzeStudentImport`) that orchestrate calls to the Gemini model.
-   **/public**: Static assets, including icons and the PWA manifest.

---

## Authentication & Data

-   **Authentication**: Managed by `src/hooks/use-auth.tsx`, which interacts with Firebase Auth. User session is persisted in local storage.
-   **Data Management**: The application was initially built using local storage but has been migrated to **Firebase Firestore**. All data services in `/src/services` now read from and write to Firestore collections, ensuring data is synchronized across all devices.

This README provides a solid foundation for anyone new to the project. Let me know if you'd like me to add more sections!
