import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import MyAccount from './MyAccount';

// Mock the hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

// Mock the UI components
vi.mock('./ui/avatar', () => ({
  Avatar: ({ children, className, ...props }: any) => (
    <div data-testid="avatar" className={className} {...props}>
      {children}
    </div>
  ),
  AvatarFallback: ({ children, className, ...props }: any) => (
    <div data-testid="avatar-fallback" className={className} {...props}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, ...props }: any) => (
    <img data-testid="avatar-image" src={src} alt={alt} {...props} />
  )
}));

vi.mock('./ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('./ui/popover', () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children, asChild }: any) => (
    <div data-testid="popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  PopoverContent: ({ children, className }: any) => (
    <div data-testid="popover-content" className={className}>
      {children}
    </div>
  )
}));

// Hoisted mock functions
const mockUseAuth = vi.hoisted(() => vi.fn());
const mockUseRouter = vi.hoisted(() => vi.fn());

// Mock the hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>
}));
vi.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
  usePathname: vi.fn(() => '/')
}));

describe('MyAccount', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    getIdTokenResult: vi.fn().mockResolvedValue({ claims: { role: 'user' } })
  };

  const mockUserWithPhoto = {
    ...mockUser,
    photoURL: 'https://example.com/photo.jpg'
  };

  const mockUserWithoutDisplayName = {
    ...mockUser,
    displayName: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('data-variant', 'ghost');
    expect(loginButton).toHaveAttribute('data-size', 'lg');
  });

  test('calls onLoginClick when login button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    const user = userEvent.setup();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    expect(onLoginClick).toHaveBeenCalledTimes(1);
  });

  test('renders nothing when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
      loading: true
    });

    const onLoginClick = vi.fn();
    render(<MyAccount onLoginClick={onLoginClick} />);

    // When loading, the account UI should not be present
    expect(screen.queryByTestId('avatar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
  });

  test('renders avatar with fallback when user is authenticated without photo', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    render(<MyAccount onLoginClick={onLoginClick} />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('T');
  });

  test('renders avatar with image when user has photo URL', () => {
    mockUseAuth.mockReturnValue({
      user: mockUserWithPhoto,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    render(<MyAccount onLoginClick={onLoginClick} />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-image')).toHaveAttribute(
      'src',
      'https://example.com/photo.jpg'
    );
    expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', "Test User's profile");
  });

  test('uses email initial when display name is not available', () => {
    mockUseAuth.mockReturnValue({
      user: mockUserWithoutDisplayName,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    render(<MyAccount onLoginClick={onLoginClick} />);

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('T');
  });

  test('renders popover with user information when avatar is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    const user = userEvent.setup();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const avatar = screen.getByTestId('avatar');
    await user.click(avatar);

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('navigates to bookings page when view bookings is clicked', async () => {
    const mockPush = vi.fn();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn()
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    const user = userEvent.setup();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const avatar = screen.getByTestId('avatar');
    await user.click(avatar);

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    const viewBookingsButton = screen.getByRole('button', { name: 'View Bookings' });
    await user.click(viewBookingsButton);

    expect(mockPush).toHaveBeenCalledWith('/bookings');
  });

  test('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      loading: false
    });

    const onLoginClick = vi.fn();
    const user = userEvent.setup();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const avatar = screen.getByTestId('avatar');
    await user.click(avatar);

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('applies correct CSS classes to avatar', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass(
      'hover:ring-primary/50',
      'relative',
      'h-10',
      'w-10',
      'cursor-pointer',
      'overflow-hidden',
      'rounded-full',
      'object-cover',
      'transition-all',
      'hover:ring-2'
    );
  });

  test('applies correct CSS classes to avatar fallback', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const avatarFallback = screen.getByTestId('avatar-fallback');
    expect(avatarFallback).toHaveClass('bg-tennis-green', 'text-white', 'dark:text-black');
  });

  test('applies correct CSS classes to login button', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toHaveClass(
      'text-foreground',
      'hidden',
      'h-9',
      'cursor-pointer',
      'items-center',
      'justify-center',
      'rounded-md',
      'border-1',
      'px-4',
      'transition-colors',
      'duration-200',
      'hover:bg-white/20',
      'md:inline-flex'
    );
  });

  test('popover content has correct styling', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      loading: false
    });

    const onLoginClick = vi.fn();
    const user = userEvent.setup();
    render(<MyAccount onLoginClick={onLoginClick} />);

    const avatar = screen.getByTestId('avatar');
    await user.click(avatar);

    await waitFor(() => {
      const popoverContent = screen.getByTestId('popover-content');
      expect(popoverContent).toHaveClass('w-56', 'p-2');
    });
  });
});
