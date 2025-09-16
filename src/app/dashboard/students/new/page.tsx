
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { NewStudentForm } from './_components/new-student-form';

export default function NewStudentPage() {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <NewStudentForm />
    </div>
  );
}
