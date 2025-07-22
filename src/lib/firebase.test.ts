import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getAuth, getFirestore, preloadAuth, preloadFirestore, preloadAll } from './firebase';

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'test-app' })),
  getApps: vi.fn(() => [])
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null }))
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore' }))
}));

describe('Firebase Lazy Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should preload auth without errors', () => {
    expect(() => preloadAuth()).not.toThrow();
  });

  test('should preload firestore without errors', () => {
    expect(() => preloadFirestore()).not.toThrow();
  });

  test('should preload all services without errors', () => {
    expect(() => preloadAll()).not.toThrow();
  });

  test('should get auth instance', async () => {
    const auth = await getAuth();
    expect(auth).toBeDefined();
    expect(auth.currentUser).toBeNull();
  });

  test('should get firestore instance', async () => {
    const db = await getFirestore();
    expect(db).toBeDefined();
    expect(db.type).toBe('firestore');
  });

  test('should cache instances after first load', async () => {
    const auth1 = await getAuth();
    const auth2 = await getAuth();
    expect(auth1).toBe(auth2);
  });
});
