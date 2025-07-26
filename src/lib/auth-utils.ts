import { cookies } from 'next/headers';
import { verifySessionCookie } from './firebase-admin';
import { logger } from './logger';
import type { Firestore } from 'firebase-admin/firestore';

export interface AuthenticatedUser {
  uid: string;
  role?: string;
  email?: string;
}

/**
 * Wrapper function to authenticate server actions using session cookies
 * @param requireAdmin - Whether the action requires admin privileges
 * @returns Promise<AuthenticatedUser | null> - The authenticated user or null if authentication failed
 */
export async function authenticateServerAction(
  requireAdmin: boolean = false
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mlt_session')?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedToken = await verifySessionCookie(sessionCookie);

    if (!decodedToken) {
      return null;
    }

    if (requireAdmin && (!decodedToken.role || decodedToken.role !== 'admin')) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      role: decodedToken.role,
      email: decodedToken.email
    };
  } catch (error) {
    logger.authFailure(
      'authenticateServerAction',
      error instanceof Error ? error : new Error('Unknown authentication error'),
      {
        action: 'authenticateServerAction',
        requireAdmin
      }
    );
    return null;
  }
}

/**
 * Higher-order function that wraps server actions with authentication
 * @param action - The server action function to wrap
 * @param requireAdmin - Whether the action requires admin privileges
 * @returns Wrapped server action with authentication
 */
export function withAuth<T extends FormData, R>(
  action: (formData: T, db: Firestore, user: AuthenticatedUser) => Promise<R>,
  requireAdmin: boolean = false
) {
  return async (formData: T): Promise<R | { success: false; error: string }> => {
    const user = await authenticateServerAction(requireAdmin);

    if (!user) {
      const errorMessage = requireAdmin
        ? 'Unauthorized: Admin access required'
        : 'Authentication required';
      return { success: false, error: errorMessage };
    }

    // Initialize Firebase Admin Firestore once
    const { getAdminFirestore } = await import('@/lib/firebase-admin');
    const db = getAdminFirestore();

    if (!db) {
      return { success: false, error: 'Server configuration error' };
    }

    return action(formData, db, user);
  };
}
