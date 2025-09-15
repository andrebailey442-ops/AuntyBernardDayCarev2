# BusyBee Administrator User Manual

## 1. Introduction

This manual is intended for users with the **Admin** role. It covers administrative functionalities that are not available to standard Teacher-level users, including user management and permission settings. Please familiarize yourself with the `HANDBOOK.md` for general application features.

---

## 2. Administrator Privileges

As an Administrator, you have access to all features within the BusyBee application, plus the following exclusive capabilities:

-   **User Management:** Add, remove, and manage user accounts.
-   **Permission Management:** Control which sections of the application are accessible to the Teacher role.

These features are accessible via the **Manage Users** option in the user profile dropdown menu at the top-right of the dashboard.

---

## 3. User Management (`/dashboard/manage-users`)

This page is the central location for managing all user accounts in the system.

### 3.1. Viewing Users

-   The main table displays a list of all current users, their associated role (`Admin` or `Teacher`), and an avatar.

### 3.2. Adding a New User

1.  Click the **Add User** button at the top-right of the user management card.
2.  A dialog box will appear. Fill in the following fields:
    -   **Username:** The name the user will use to log in.
    -   **Password:** A temporary or permanent password for the new user.
    -   **Role:** Select either `Admin` or `Teacher` from the dropdown.
3.  Click **Add User** to create the account. A confirmation message will appear, and the new user will be added to the list.

### 3.3. Managing Existing Users

For each user in the list, you can perform actions from the dropdown menu (three-dot icon) on the right side of their row.

#### Resetting a Password

1.  Click the actions menu and select **Reset Password**.
2.  A dialog will appear, prompting you to enter a new password for that user.
3.  Enter the new password and click **Reset Password**. The user's password will be updated immediately.

#### Removing a User

1.  Click the actions menu and select **Remove User**.
2.  A confirmation alert will appear to prevent accidental deletion.
3.  Click **Continue** to permanently remove the user account. This action cannot be undone.

---

## 4. Permission Management (`/dashboard/manage-users`)

The "Teacher Role Permissions" card, located below the user manager, allows you to control what features and pages users with the `Teacher` role can access.

### 4.1. How It Works

-   The dashboard navigation for teachers is dynamically generated based on the permissions you set here.
-   If a permission is granted, the corresponding link will appear in their navigation menu.
-   If a permission is revoked, the link will be hidden. The system also includes route protection to prevent teachers from accessing unauthorized pages by manually typing the URL.

### 4.2. Modifying Teacher Permissions

1.  The section displays a list of all available pages/modules that can be assigned.
2.  **Check the box** next to a permission to grant access to the Teacher role.
3.  **Uncheck the box** to revoke access.
4.  After making your desired changes, click the **Save Changes** button.

The changes will take effect immediately for all users with the `Teacher` role.

#### Default Permissions

By default, the Teacher role has access to:
-   `/dashboard/attendance`
-   `/dashboard/grades`

You can customize this to fit the needs of your organization.

---

This concludes the administrator-specific manual. For all other application features, please refer to the main `HANDBOOK.md`.
