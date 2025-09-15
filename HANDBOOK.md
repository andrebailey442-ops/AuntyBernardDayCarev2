# BusyBee Application Handbook

## 1. Introduction

Welcome to the BusyBee application! This handbook provides a comprehensive overview of the features and functionalities available to manage your preschool and after-care programs. BusyBee is designed to be an intuitive and efficient tool for handling student records, attendance, grades, financials, and more.

---

## 2. Getting Started

### 2.1. Logging In

-   Access the application through the main login page.
-   Enter your assigned `username` and `password`.
-   The default credentials for initial setup are:
    -   **Admin:** `Admin` / `admin`
    -   **Teacher:** `Teacher` / `teacher`

### 2.2. Main Dashboard

After logging in, you will land on the main dashboard, which presents two primary sections:
-   **Preschool Management:** For all academic and administrative tasks related to the preschool.
-   **After-Care Management:** For managing student check-ins and check-outs for the after-care program.

---

## 3. Preschool Management Dashboard

This is the central hub for managing all aspects of the preschool.

### 3.1. Dashboard Overview

The preschool dashboard provides an at-a-glance view of key metrics:
-   **Total Students:** The number of currently enrolled students.
-   **Attendance Rate:** The average attendance for the current month.
-   **Active Forms:** The number of downloadable forms available.
-   **Revenue:** Total revenue from paid fees.
-   **Student List:** A list of all enrolled students.
-   **Weekly Attendance Chart:** A bar chart summarizing the week's attendance.
-   **Grade Distribution:** A pie chart showing the overall distribution of grades.

### 3.2. Quick Links / Actions

The "Actions" section offers one-click access to the most common tasks:
-   **Add New Student:** Opens the student registration form.
-   **Student Management:** Takes you to the detailed student management table.
-   **Financial:** Opens the financial management page.
-   **View All Forms:** Navigates to the forms repository.
-   **Enter New Grades:** Opens the grade entry page.
-   **Take Attendance:** Navigates to the daily attendance tracker.
-   **Graduation:** Opens the graduation management page.

---

## 4. Core Modules

### 4.1. Student Management (`/dashboard/student-management`)

-   **View Students:** A searchable and filterable table of all enrolled students.
-   **Actions for Each Student:**
    -   **View/Edit Profile:** Access the student's detailed profile or edit their information.
    -   **View Report Summary:** Open a dialog with a quick summary of the student's grades and attendance.
    -   **View Full Report Page:** Navigate to the dedicated, printable report card page for the student.
    -   **Graduate Student:** Change the student's status to 'graduated' and move them to the archive.
    -   **Remove Student:** Permanently delete a student's record from the system.

### 4.2. New Student Registration (`/dashboard/students/new`)

-   A detailed form to register a new student.
-   **Auto-Generated Student ID:** A unique ID is created automatically.
-   **Date of Birth Entry:** Use the dropdowns for Month, Day, and Year. The age is calculated automatically.
-   **Payment Plan Selection:** Choose a payment plan. The required 30% enrollment deposit is calculated and displayed.
-   **Enrollment Status:** New students are added with a **`Pending`** status. Their status automatically changes to **`Enrolled`** once at least 30% of their fee is paid.
-   **Download PDF:** You can download a blank, printable version of the registration form.

### 4.3. Attendance (`/dashboard/attendance`)

-   Select a date using the calendar.
-   For each student, select `Present`, `Absent`, or `Tardy` for each subject from the dropdown menus.
-   Click **Save Attendance** to record the day's data.

### 4.4. Grades (`/dashboard/grades`)

-   Enter grades (`A`, `B`, `C`, `D`, `F`, or `Incomplete`) for each student in each subject.
-   Click **Save All Grades** to update the records.

### 4.5. Financial (`/dashboard/financial`)

-   View a list of all students and their fee status (`Paid`, `Pending`, `Overdue`).
-   **Make Payment:**
    -   From the actions menu on a student row, select "Make Payment."
    -   The dialog will pre-fill the student's ID and payment plan.
    -   Enter the amount being paid.
    -   Click **Process Payment**. If the payment meets the 30% threshold, the student's status will change to `Enrolled`.
-   **View Invoice:**
    -   From the actions menu, select "View Invoice" to see an on-screen summary.
    -   You can download a detailed PDF of the invoice, which includes the amount paid and the remaining amount due.

### 4.6. Forms (`/dashboard/forms`)

-   A central repository for important documents.
-   Currently available forms: `New Student Application`, `Medical & Consent Form`, and `Fee Payment Form`.
-   Click **Download PDF** to get a blank, printable copy of any form.

### 4.7. Reports (`/dashboard/reports`)

-   Search for any student (including graduated ones).
-   Click **View Report** to navigate to a detailed, printable report card page that includes grades, attendance summary, and teacher comments.
-   From the report card page, you can download a formal PDF version.

### 4.8. Graduation (`/dashboard/graduation`)

-   **Enrolled Students List:** View all students eligible for graduation. Click **Graduate** to move them to the graduated list.
-   **Graduated Students List:** View all archived graduates.
-   **Generate Certificate:** For any graduated student, click **Generate Certificate** to download a personalized, printable PDF certificate of graduation.

---

## 5. After-Care Management (`/dashboard/after-care`)

-   This page is dedicated to managing students enrolled in the after-care program.
-   **Check-in / Check-out:**
    -   The main table lists all students in the after-care program.
    -   Click **Check In** to mark a student as present. The time of check-in is automatically logged.
    -   Click **Check Out** to mark a student as having departed. The time of check-out is also logged.
-   **Dashboard Cards:** View real-time counts of total students, students currently checked in, and students who have been checked out.

This handbook should serve as a useful guide for navigating the BusyBee application. For administrative functions, please refer to the `ADMIN_MANUAL.md`.
