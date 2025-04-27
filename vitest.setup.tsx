import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: any) => (
    <img src={src} alt={alt} width={width} height={height} {...props} />
  )
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

vi.mock('firebase/auth', () => {
  const auth = {
    currentUser: null,
    onAuthStateChanged: vi.fn((auth, callback) => {
      callback(null);
      return vi.fn();
    }),
    signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    signOut: vi.fn(() => Promise.resolve()),
    GoogleAuthProvider: vi.fn(() => ({}))
  };

  return {
    getAuth: vi.fn(() => auth),
    onAuthStateChanged: auth.onAuthStateChanged,
    signInWithPopup: auth.signInWithPopup,
    signOut: auth.signOut,
    GoogleAuthProvider: auth.GoogleAuthProvider
  };
});

vi.mock('firebase/firestore', () => {
  const TimestampMock = function (seconds: number, nanoseconds: number) {
    return {
      seconds,
      nanoseconds,
      toDate: () => new Date(seconds * 1000)
    };
  };

  TimestampMock.fromDate = vi.fn((date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
    toDate: () => date
  }));

  TimestampMock.now = vi.fn(() => ({
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: (Date.now() % 1000) * 1000000,
    toDate: () => new Date()
  }));

  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    Timestamp: TimestampMock
  };
});

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({}))
}));
