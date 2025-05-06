import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isProtectedRoute && !session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // add other (post) API routes that require authentication
  if (request.nextUrl.pathname.startsWith('/api/auth/') && !session) {
    return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'content-type': 'application/json' }
    });
  }

  return NextResponse.next();
}

// middleware runs on
export const config = {
  matcher: ['/admin/:path*', '/api/auth/:path*']
};
