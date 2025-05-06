import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
};

export const firebaseAdmin =
  getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

export const adminAuth = getAuth(firebaseAdmin);

export async function verifySessionCookie(sessionCookie: string) {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

export async function createSessionCookie(idToken: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
  try {
    return await adminAuth.createSessionCookie(idToken, { expiresIn });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    throw error;
  }
}
