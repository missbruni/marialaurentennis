import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

let firebaseAppPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<Auth> | null = null;
let firestorePromise: Promise<Firestore> | null = null;

async function initializeFirebaseApp(): Promise<FirebaseApp> {
  if (firebaseAppPromise) {
    console.log('[FIREBASE] Returning existing Firebase app instance');
    return firebaseAppPromise;
  }

  console.log('[FIREBASE] Initializing Firebase app');
  firebaseAppPromise = import('firebase/app').then(({ initializeApp, getApps }) => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    console.log('[FIREBASE] Firebase config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey
    });

    if (!getApps().length) {
      console.log('[FIREBASE] Creating new Firebase app instance');
      return initializeApp(firebaseConfig);
    } else {
      console.log('[FIREBASE] Using existing Firebase app instance');
      return getApps()[0];
    }
  });

  return firebaseAppPromise;
}

export async function getAuth(): Promise<Auth> {
  if (authPromise) {
    console.log('[FIREBASE] Returning existing Auth instance');
    return authPromise;
  }

  console.log('[FIREBASE] Initializing Firebase Auth');
  const firebaseAuthPromise = import('firebase/auth');
  authPromise = Promise.all([firebaseAuthPromise, initializeFirebaseApp()]).then(
    ([{ getAuth }, app]) => {
      console.log('[FIREBASE] Auth instance created successfully');
      return getAuth(app);
    }
  );

  return authPromise;
}

export async function getFirestore(): Promise<Firestore> {
  if (firestorePromise) {
    console.log('[FIREBASE] Returning existing Firestore instance');
    return firestorePromise;
  }

  console.log('[FIREBASE] Initializing Firebase Firestore');
  const firebaseFirestorePromise = import('firebase/firestore');
  firestorePromise = Promise.all([firebaseFirestorePromise, initializeFirebaseApp()]).then(
    ([{ getFirestore }, app]) => {
      console.log('[FIREBASE] Firestore instance created successfully');
      return getFirestore(app);
    }
  );

  return firestorePromise;
}

export function preloadAuth(): void {
  if (!authPromise) {
    console.log('[FIREBASE] Preloading Auth');
    getAuth();
  }
}

export function preloadFirestore(): void {
  if (!firestorePromise) {
    console.log('[FIREBASE] Preloading Firestore');
    getFirestore();
  }
}

export function preloadAll(): void {
  console.log('[FIREBASE] Preloading all Firebase services');
  preloadAuth();
  preloadFirestore();
}
