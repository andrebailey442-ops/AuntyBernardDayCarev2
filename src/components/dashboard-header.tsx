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
import { Bell, LogOut, Settings, Menu } from 'lucide-react';
import Link from 'next/link';
import { ScholarStartLogo } from './icons';
import { DashboardNav } from './dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function DashboardHeader() {

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <div className="flex items-center gap-2">
        <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <ScholarStartLogo className="h-6 w-6 text-primary" />
            <span className="font-bold">ScholarStart</span>
          </Link>
      </div>
      
      <div className="hidden md:flex md:items-center md:gap-5 lg:gap-6 text-sm font-medium">
        <DashboardNav />
      </div>

      <div className="flex w-full items-center gap-4 justify-end">
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
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <nav className="grid gap-6 text-lg font-medium mt-8">
                      <DashboardNav />
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
