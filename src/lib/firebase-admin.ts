import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let firebaseAdmin: App | null = null;
let adminAuth: Auth | null = null;

function initializeFirebaseAdmin(): App | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    console.warn('Firebase Admin environment variables not available');
    return null;
  }

  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    };

    firebaseAdmin = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

    adminAuth = getAuth(firebaseAdmin);
    return firebaseAdmin;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}

export function getFirebaseAdmin(): App | null {
  return firebaseAdmin || initializeFirebaseAdmin();
}

export function getAdminAuth(): Auth | null {
  if (!adminAuth) {
    initializeFirebaseAdmin();
  }
  return adminAuth;
}

export async function verifySessionCookie(sessionCookie: string) {
  const auth = getAdminAuth();
  if (!auth) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

export async function createSessionCookie(idToken: string, expiresIn = 60 * 60 * 24 * 5 * 1000) {
  const auth = getAdminAuth();
  if (!auth) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    return await auth.createSessionCookie(idToken, { expiresIn });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    throw error;
  }
}
