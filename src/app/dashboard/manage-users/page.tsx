import UserManager from './_components/user-manager';
import PermissionManager from './_components/permission-manager';

export default function ManageUsersPage() {
    return (
        <div className="space-y-6">
            <UserManager />
            <PermissionManager />
        </div>
    )
}
