
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/services/users';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import type { User, SessionUser } from '@/lib/types';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-chars');

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const user = await authenticateUser(username, password);

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const { password: userPassword, ...sessionUser } = user;

    const expirationTime = '2h';
    const token = await new SignJWT(sessionUser)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expirationTime)
      .sign(SECRET_KEY);

    cookies().set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    });

    return NextResponse.json({ user: sessionUser });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
