'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import GradeManager from './_components/grade-manager';

export default function GradesPage() {
    const router = useRouter();
  return (
    <div className="space-y-4">
        <div>
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>
        <GradeManager />
    </div>
  );
}
