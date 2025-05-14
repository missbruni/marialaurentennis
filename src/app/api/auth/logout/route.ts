import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, isProtectedRoute } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  const referer = request.headers.get('referer') || '';
  const url = new URL(referer);
  const isProtected = isProtectedRoute(url.pathname);

  const response = NextResponse.json({
    success: true,
    isProtected: isProtected
  });

  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/'
  });

  return response;
}
