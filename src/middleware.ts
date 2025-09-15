
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { SessionUser } from '@/lib/types';
import { getTeacherPermissions } from '@/services/permissions';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-chars');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session')?.value;

  const publicPaths = ['/'];
  if (publicPaths.includes(pathname) || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const user = payload as SessionUser;

    if (pathname.startsWith('/dashboard')) {
      if (user.role === 'Teacher') {
        const permissions = await getTeacherPermissions(); // This will run server-side now
        const isAllowed = 
          pathname === '/dashboard' ||
          pathname.startsWith('/dashboard/preschool') ||
          permissions.includes(pathname);
        const isAdminPage = pathname.startsWith('/dashboard/manage-users');

        if (!isAllowed || isAdminPage) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
  } catch (err) {
    console.error('JWT Verification Error:', err);
    request.cookies.delete('session');
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
