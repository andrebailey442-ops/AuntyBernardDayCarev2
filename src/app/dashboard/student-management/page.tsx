'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StudentManager from './_components/student-manager';

export default function StudentManagementPage() {
    const router = useRouter();
    return (
        <div className="space-y-4">
             <div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
            <StudentManager />
        </div>
    )
}
