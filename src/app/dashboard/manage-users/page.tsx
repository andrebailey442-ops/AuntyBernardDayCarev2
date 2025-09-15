'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UserManager from './_components/user-manager';
import PermissionManager from './_components/permission-manager';

export default function ManageUsersPage() {
    const router = useRouter();
    return (
        <div className="space-y-6">
            <div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
            <UserManager />
            <PermissionManager />
        </div>
    )
}
