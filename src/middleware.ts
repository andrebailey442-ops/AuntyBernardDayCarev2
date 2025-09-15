
import {NextRequest, NextResponse} from 'next/server';

export async function middleware(request: NextRequest) {
    // This middleware is now a placeholder.
    // Client-side routing will handle redirects based on auth state.
    return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
