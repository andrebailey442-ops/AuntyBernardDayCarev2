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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScholarStartLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const user = await login(data.username, data.password);
      if (user) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${user.username}!`,
        });
        router.push('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid username or password.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleTeacherLogin = () => {
    form.setValue('username', 'Teacher');
    form.setValue('password', 'teacher');
    form.handleSubmit(onSubmit)();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
            <ScholarStartLogo className="h-12 w-12 text-primary" />
            <h1 className="text-3xl font-bold">
              ScholarStart
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Please enter your credentials to log in.
            </p>
        </div>
        <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Use "Admin" and "admin" to continue.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                          <Input
                              placeholder="Admin"
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
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In as Admin'}
                    </Button>
                    <Button type="button" variant="secondary" className="w-full" onClick={handleTeacherLogin} disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In as Teacher'}
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
