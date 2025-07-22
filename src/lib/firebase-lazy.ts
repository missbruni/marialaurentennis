import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Lazy loading promises for Firebase services
let firebaseAppPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<Auth> | null = null;
let firestorePromise: Promise<Firestore> | null = null;

// Initialize Firebase app lazily
async function initializeFirebaseApp(): Promise<FirebaseApp> {
  if (firebaseAppPromise) {
    return firebaseAppPromise;
  }

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

    if (!getApps().length) {
      return initializeApp(firebaseConfig);
    } else {
      return getApps()[0];
    }
  });

  return firebaseAppPromise;
}

// Lazy load Firebase Auth
export async function getAuth(): Promise<Auth> {
  if (authPromise) {
    return authPromise;
  }

  authPromise = Promise.all([import('firebase/auth'), initializeFirebaseApp()]).then(
    ([{ getAuth }, app]) => getAuth(app)
  );

  return authPromise;
}

// Lazy load Firestore
export async function getFirestore(): Promise<Firestore> {
  if (firestorePromise) {
    return firestorePromise;
  }

  firestorePromise = Promise.all([import('firebase/firestore'), initializeFirebaseApp()]).then(
    ([{ getFirestore }, app]) => getFirestore(app)
  );

  return firestorePromise;
}

// Lazy load Firebase App
export async function getFirebaseApp(): Promise<FirebaseApp> {
  return initializeFirebaseApp();
}

// Preload functions for performance optimization
export function preloadAuth(): void {
  if (!authPromise) {
    getAuth();
  }
}

export function preloadFirestore(): void {
  if (!firestorePromise) {
    getFirestore();
  }
}

export function preloadAll(): void {
  preloadAuth();
  preloadFirestore();
}
