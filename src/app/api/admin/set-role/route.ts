import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { uid, role } = await request.json();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 403 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.role || decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Not an admin' }, { status: 403 });
    }

    await adminAuth.setCustomUserClaims(uid, { role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json({ error: 'Failed to set user role' }, { status: 500 });
  }
}
