import React from 'react';
import { preloadAuth, preloadFirestore, preloadAll } from '@/lib/firebase';

interface FirebaseLazyLoaderProps {
  children: React.ReactNode;
  preloadStrategy?: 'auth' | 'firestore' | 'all';
}

/**
 * FirebaseLazyLoader component
 *
 * This component preloads Firebase services based on the specified strategy:
 * - 'auth': Only preloads Firebase Auth
 * - 'firestore': Only preloads Firestore
 * - 'all': Preloads both Auth and Firestore (default)
 *
 * Usage:
 * <FirebaseLazyLoader preloadStrategy="all">
 *   <YourApp />
 * </FirebaseLazyLoader>
 */
export function FirebaseLazyLoader({ children, preloadStrategy = 'all' }: FirebaseLazyLoaderProps) {
  React.useEffect(() => {
    switch (preloadStrategy) {
      case 'auth':
        preloadAuth();
        break;
      case 'firestore':
        preloadFirestore();
        break;
      case 'all':
      default:
        preloadAll();
        break;
    }
  }, [preloadStrategy]);

  return <>{children}</>;
}

/**
 * Hook to manually preload Firebase services
 *
 * Usage:
 * const { preloadAuth, preloadFirestore, preloadAll } = useFirebasePreloader();
 *
 * // Preload when user clicks login button
 * const handleLoginClick = () => {
 *   preloadAuth();
 *   // Navigate to login page
 * };
 */
export function useFirebasePreloader() {
  return {
    preloadAuth,
    preloadFirestore,
    preloadAll
  };
}
