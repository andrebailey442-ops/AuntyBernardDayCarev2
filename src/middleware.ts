
import {NextRequest, NextResponse} from 'next/server';
import {getSession} from '@/lib/session';

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  const publicPaths = ['/'];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const session = await getSession();

  if (!session?.user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (
    session?.user?.role !== 'Admin' &&
    pathname.startsWith('/dashboard/manage-users')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
