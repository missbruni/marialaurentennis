import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, COOKIE_NAME } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  const isProtected = isProtectedRoute(request.nextUrl.pathname);
  const alreadyHasAuthParams = request.nextUrl.searchParams.has('auth');

  if (isProtected && !session && !alreadyHasAuthParams) {
    const url = new URL(request.url);
    url.searchParams.set('auth', 'true');
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // add other (post) API routes that require authentication
  // if (request.nextUrl.pathname.startsWith('/api/auth/') && !session) {
  //   return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
  //     status: 401,
  //     headers: { 'content-type': 'application/json' }
  //   });
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/auth/:path*']
};
