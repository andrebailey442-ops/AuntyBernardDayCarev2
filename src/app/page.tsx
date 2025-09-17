
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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true); // Set initial loading to true
  const { login, user } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const completeLogin = (user: User) => {
    toast({
      title: 'Login Successful',
      description: `Welcome, ${user.username}!`,
    });
    router.push('/dashboard');
  }

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const user = await login(data.emailOrUsername, data.password);
      if (user) {
        completeLogin(user);
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

  React.useEffect(() => {
    // If a user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
      return;
    }

    // Automatically log in as Admin
    handleLogin({ emailOrUsername: 'Admin', password: 'admin' });
  }, [user]);


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
              Please wait while we automatically log you in...
            </p>
        </div>
        <Card className="backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Use "Admin" with password "admin" to continue.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                      control={form.control}
                      name="emailOrUsername"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Email or Username</FormLabel>
                          <FormControl>
                          <Input
                              placeholder="admin or admin@example.com"
                              {...field}
                              disabled={isLoading}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                          <Input
                              type="password"
                              placeholder="admin"
                              {...field}
                              disabled={isLoading}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
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
