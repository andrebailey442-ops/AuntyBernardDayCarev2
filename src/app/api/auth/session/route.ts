
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { SessionUser } from '@/lib/types';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-chars');

export async function GET(req: NextRequest) {
  const token = cookies().get('session')?.value;

  if (!token) {
    return NextResponse.json({ message: 'No session found' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return NextResponse.json({ user: payload as SessionUser });
  } catch (error) {
    console.error('Session verification failed:', error);
    return NextResponse.json({ message: 'Invalid session token' }, { status: 401 });
  }
}
