
'use client';

import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type StudentListActionsProps = {
  studentId: string;
};

export default function StudentListActions({ studentId }: StudentListActionsProps) {
  const router = useRouter();

  const handleViewProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const handleEditProfile = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}/edit`);
  };

  const handleGenerateReport = (studentId: string) => {
    router.push(`/dashboard/reports/${studentId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleViewProfile(studentId)}>View Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditProfile(studentId)}>Edit Profile</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleGenerateReport(studentId)}
        >
          Generate Report Card
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
