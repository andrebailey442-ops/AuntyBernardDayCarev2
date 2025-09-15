
'use client';

import * as React from 'react';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle, Trash2, KeyRound } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { User, UserRole } from '@/lib/types';
import { getUsers, addUser, removeUser } from '@/services/users';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserManager() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);
  const [newUsername, setNewUsername] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newRole, setNewRole] = React.useState<UserRole>('Teacher');

  const [isRemoveUserAlertOpen, setIsRemoveUserAlertOpen] = React.useState(false);
  const [userToRemove, setUserToRemove] = React.useState<User | null>(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const userList = await getUsers();
      setUsers(userList);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'Username and password are required.'});
        return;
    }
    try {
        const newUser = await addUser(newUsername, newRole, newPassword);
        setUsers(prev => [...prev, newUser]);
        toast({ title: 'User Added', description: `${newUsername} has been added.`});
        setIsAddUserDialogOpen(false);
        setNewUsername('');
        setNewPassword('');
        setNewRole('Teacher');
    } catch (error) {
        console.error('Failed to add user: ', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add user.'});
    }
  };
  
  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    try {
        await removeUser(userToRemove.id);
        setUsers(prev => prev.filter(u => u.id !== userToRemove.id));
        toast({ title: 'User Removed', description: `${userToRemove.username} has been removed.`});
    } catch(error) {
        console.error('Failed to remove user: ', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove user.'});
    } finally {
        setIsRemoveUserAlertOpen(false);
        setUserToRemove(null);
    }
  };

  const openRemoveUserAlert = (user: User) => {
    setUserToRemove(user);
    setIsRemoveUserAlertOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Add, remove, and manage administrator and teacher accounts.</CardDescription>
        </div>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Enter the details for the new user account.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">Username</Label>
                        <Input id="username" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input id="password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select onValueChange={(value: UserRole) => setNewRole(value)} value={newRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Teacher">Teacher</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-[150px]" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
            ) : users.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      alt="User avatar"
                      className="aspect-square rounded-full object-cover"
                      height="40"
                      src={user.avatarUrl}
                      width="40"
                      data-ai-hint={user.imageHint}
                    />
                    <div className="font-medium">{user.username}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => openRemoveUserAlert(user)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AlertDialog open={isRemoveUserAlertOpen} onOpenChange={setIsRemoveUserAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove the account for {userToRemove?.username}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveUser}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
