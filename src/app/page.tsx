
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { BusyBeeLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import WallArt from '@/components/wall-art';
import type { User } from '@/lib/types';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, { message: 'Please enter your email or username.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const superUserSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters.'}),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.'}),
});

type SuperUserFormValues = z.infer<typeof superUserSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const { login, user, loading: authLoading, isFirstRun, completeFirstRun } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: 'Admin',
      password: 'admin',
    },
  });

  const superUserForm = useForm<SuperUserFormValues>({
    resolver: zodResolver(superUserSchema),
    defaultValues: {
        username: '',
        email: '',
        password: '',
    }
  })

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const loggedInUser = await login(data.emailOrUsername, data.password);
      if (loggedInUser) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${loggedInUser.username}!`,
        });
        router.push('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email/username or password.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSuperUserSubmit = async (data: SuperUserFormValues) => {
    setIsLoading(true);
    try {
        await completeFirstRun(data.username, data.email, data.password);
        toast({
            title: 'Admin Account Created!',
            description: 'You can now log in with your new credentials.',
        });
        // The isFirstRun state will automatically update in useAuth, which will re-render this page to show the login form.
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Creation Failed',
            description: 'Could not create the admin account. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  React.useEffect(() => {
    // If a user is already logged in from a previous session, redirect.
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const pageLoading = authLoading || isLoading;

  if (isFirstRun === undefined || authLoading) {
      return (
          <main className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
               <WallArt />
               <p>Loading...</p>
          </main>
      )
  }
  
  if (isFirstRun) {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
             <WallArt />
            <div className="relative z-10 w-full max-w-md space-y-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <BusyBeeLogo className="h-12 w-12 text-primary" />
                    <h1 className="text-3xl font-bold">Welcome!</h1>
                    <p className="text-muted-foreground">
                        It looks like this is the first time you're running the app. Please create a Super Admin account to get started.
                    </p>
                </div>
                <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle>Create Super Admin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...superUserForm}>
                            <form onSubmit={superUserForm.handleSubmit(handleSuperUserSubmit)} className="space-y-4">
                                <FormField control={superUserForm.control} name="username" render={({ field }) => (
                                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="e.g., SuperAdmin" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={superUserForm.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="admin@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={superUserForm.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <Button type="submit" className="w-full" disabled={pageLoading}>
                                    {pageLoading ? 'Creating Account...' : 'Create Admin Account'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
      <WallArt />
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
            <BusyBeeLogo className="h-12 w-12 text-primary" />
            <h1 className="text-3xl font-bold">
              Aunty Bernard DayCare and Pre-school
            </h1>
            <p className="text-muted-foreground">
              Please sign in to continue to the dashboard.
            </p>
        </div>
        <Card className="backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Use "Admin" and "admin" to sign in.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                      control={loginForm.control}
                      name="emailOrUsername"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Email or Username</FormLabel>
                          <FormControl>
                          <Input
                              placeholder="admin or admin@example.com"
                              {...field}
                              disabled={pageLoading}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                          <Input
                              type="password"
                              placeholder="admin"
                              {...field}
                              disabled={pageLoading}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={pageLoading}>
                        {pageLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                </form>
            </Form>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
