

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

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, { message: 'Please enter your email or username.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const { login, user, loading: authLoading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: 'Admin',
      password: 'admin',
    },
  });

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

  React.useEffect(() => {
    // If a user is already logged in from a previous session, redirect.
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const pageLoading = authLoading || isLoading;

  if (authLoading) {
      return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
            <div>Loading...</div>
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
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
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
                            disabled={pageLoading}
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
