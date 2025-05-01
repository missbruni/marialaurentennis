import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getServerSession } from 'next-auth/next';

const ADMIN_EMAILS = ['brunalima@me.com', 'marialaurentennis@gmail.com'];

export async function POST(request: NextRequest) {
  try {
    const { uid, role } = await request.json();

    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await adminAuth.setCustomUserClaims(uid, { role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json({ error: 'Failed to set user role' }, { status: 500 });
  }
}
