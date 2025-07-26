import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import MockDate from 'mockdate';

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
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    getIdTokenResult: vi.fn().mockResolvedValue({ claims: { role: 'user' } })
  };

  const auth = {
    currentUser: null,
    onAuthStateChanged: vi.fn((auth, callback) => {
      // Call the callback synchronously to avoid timing issues in tests
      callback(null);
      return vi.fn();
    }),
    signInWithPopup: vi.fn(() =>
      Promise.resolve({
        user: mockUser
      })
    ),
    signOut: vi.fn(() => Promise.resolve()),
    GoogleAuthProvider: vi.fn(() => ({})),
    FacebookAuthProvider: vi.fn(() => ({})),
    signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockUser })),
    createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockUser }))
  };

  return {
    getAuth: vi.fn(() => auth),
    onAuthStateChanged: auth.onAuthStateChanged,
    signInWithPopup: auth.signInWithPopup,
    signOut: auth.signOut,
    GoogleAuthProvider: auth.GoogleAuthProvider,
    FacebookAuthProvider: auth.FacebookAuthProvider,
    signInWithEmailAndPassword: auth.signInWithEmailAndPassword,
    createUserWithEmailAndPassword: auth.createUserWithEmailAndPassword
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

// Mock lucide-react globally, passing through all icons except the ones we want to mock
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual<any>('lucide-react');
  return {
    ...actual,
    FacebookIcon: (props: any) => <svg data-testid="facebook-icon" {...props} />,
    InstagramIcon: (props: any) => <svg data-testid="instagram-icon" {...props} />,
    TwitterIcon: (props: any) => <svg data-testid="twitter-icon" {...props} />,
    Loader2: (props: any) => (
      <div data-testid="loader" {...props}>
        Loading...
      </div>
    )
  };
});

// This ensures all date-related tests use a fixed date to prevent future failures
const FIXED_DATE = new Date('2023-07-15T10:30:00.000Z');
MockDate.set(FIXED_DATE);

afterEach(() => {
  MockDate.reset();
});
