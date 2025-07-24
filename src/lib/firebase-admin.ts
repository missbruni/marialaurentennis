import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
};

// Only initialize if we're in a runtime environment (not during build)
export const firebaseAdmin =
  typeof window === 'undefined' && getApps().length === 0
    ? initializeApp(firebaseAdminConfig)
    : getApps()[0] || null;

export const adminAuth = firebaseAdmin ? getAuth(firebaseAdmin) : null;

export async function verifySessionCookie(sessionCookie: string) {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

export async function createSessionCookie(idToken: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    return await adminAuth.createSessionCookie(idToken, { expiresIn });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    throw error;
  }
}
