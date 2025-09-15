
import { NextRequest, NextResponse } from 'next/server';

// This is a basic middleware setup.
// You can expand it to handle redirects, authentication, etc.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Example: Redirect /old-path to /new-path
  // if (pathname === '/old-path') {
  //   return NextResponse.redirect(new URL('/new-path', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
