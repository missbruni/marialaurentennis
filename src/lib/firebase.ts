import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

let firebaseAppPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<Auth> | null = null;
let firestorePromise: Promise<Firestore> | null = null;

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

export async function getAuth(): Promise<Auth> {
  if (authPromise) {
    return authPromise;
  }

  const firebaseAuthPromise = import('firebase/auth');
  authPromise = Promise.all([firebaseAuthPromise, initializeFirebaseApp()]).then(
    ([{ getAuth }, app]) => getAuth(app)
  );

  return authPromise;
}

export async function getFirestore(): Promise<Firestore> {
  if (firestorePromise) {
    return firestorePromise;
  }

  console.log('🔍 getFirestore - initializing Firestore');

  const firebaseFirestorePromise = import('firebase/firestore');
  firestorePromise = Promise.all([firebaseFirestorePromise, initializeFirebaseApp()])
    .then(([{ getFirestore }, app]) => {
      console.log('✅ getFirestore - Firestore initialized successfully');
      return getFirestore(app);
    })
    .catch((error) => {
      console.error('❌ getFirestore - Firestore initialization failed:', error);
      throw error;
    });

  return firestorePromise;
}

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
