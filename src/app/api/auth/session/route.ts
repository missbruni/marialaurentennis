import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/firebase-admin';
import { COOKIE_NAME } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const sessionCookie = await createSessionCookie(idToken);
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);

    // Handle Firebase Admin initialization errors
    if (error instanceof Error && error.message.includes('Firebase Admin not initialized')) {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
