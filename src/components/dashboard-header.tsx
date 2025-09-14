'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Bell, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { ScholarStartLogo } from './icons';
import { DashboardNav } from './dashboard-nav';

export function DashboardHeader() {

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <ScholarStartLogo className="h-6 w-6 text-primary" />
          <span className="font-bold">ScholarStart</span>
        </Link>
        <DashboardNav />
      </nav>
      
      {/* Mobile Menu can be added here if needed */}

      <div className="flex w-full items-center gap-4 md:ml-auto md:w-auto">
        <div className="md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
                <ScholarStartLogo className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold font-headline">ScholarStart</span>
            </Link>
        </div>
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Search can go here if needed */}
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="https://picsum.photos/seed/admin/100/100"
                  alt="Admin"
                />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href="/" legacyBehavior passHref>
              <DropdownMenuItem asChild>
                <a>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </a>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
