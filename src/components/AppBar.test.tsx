import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import AppBar from './AppBar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSectionRef } from '@/hooks/useSectionRef';

// Mock the necessary dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn()
}));

vi.mock('next-themes', () => ({
  useTheme: vi.fn().mockReturnValue({ theme: 'light', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@/hooks/useSectionRef', () => ({
  useSectionRef: vi.fn(),
  SectionRefProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('./Login', () => ({
  default: () => <div data-testid="login-component">Login Component</div>
}));

vi.mock('./ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

describe('AppBar', () => {
  const mockRouter = {
    push: vi.fn()
  };

  const mockScrollToBookingForm = vi.fn();
  const mockScrollToContact = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(usePathname).mockReturnValue('/');
    vi.mocked(useAuth).mockReturnValue({ isAdmin: false } as any);
    vi.mocked(useSectionRef).mockReturnValue({
      scrollToBookingForm: mockScrollToBookingForm,
      scrollToContact: mockScrollToContact
    } as any);
    vi.mocked(useTheme).mockReturnValue({ theme: 'light' } as any);
  });

  test('renders basic navigation elements', () => {
    render(<AppBar />);

    const logo = screen.getByAltText('Maria Lauren Tennis');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/fullname.svg');

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Book Now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle menu' })).toBeInTheDocument();

    expect(screen.getByTestId('login-component')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('renders admin link when user is admin', () => {
    vi.mocked(useAuth).mockReturnValue({ isAdmin: true } as any);

    render(<AppBar />);

    const adminLinks = screen.getAllByText('Admin');
    expect(adminLinks.length).toBeGreaterThan(0);
  });

  test('does not render admin link when user is not admin', () => {
    vi.mocked(useAuth).mockReturnValue({ isAdmin: false } as any);

    render(<AppBar />);

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  test('updates logo when theme changes', async () => {
    const { rerender } = render(<AppBar />);

    let logo = screen.getByAltText('Maria Lauren Tennis');
    expect(logo).toHaveAttribute('src', '/fullname.svg');

    vi.mocked(useTheme).mockReturnValue({ theme: 'dark' } as any);
    rerender(<AppBar />);

    logo = screen.getByAltText('Maria Lauren Tennis');
    expect(logo).toHaveAttribute('src', '/fullname-white.svg');
  });

  test('calls scrollToBookingForm when Lessons button is clicked on home page', async () => {
    vi.mocked(usePathname).mockReturnValue('/');

    const { user } = render(<AppBar />);

    const lessonsButton = screen.getAllByText('Lessons')[0];
    await user.click(lessonsButton);

    expect(mockScrollToBookingForm).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('navigates to home and scrolls to booking form when Lessons button is clicked on another page', async () => {
    vi.mocked(usePathname).mockReturnValue('/about');

    const { user } = render(<AppBar />);

    const lessonsButton = screen.getAllByText('Lessons')[0];
    await user.click(lessonsButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/');

    await waitFor(() => {
      expect(mockScrollToBookingForm).toHaveBeenCalledTimes(1);
    });
  });

  test('calls scrollToContact when Contact button is clicked on home page', async () => {
    vi.mocked(usePathname).mockReturnValue('/');

    const { user } = render(<AppBar />);

    const contactButton = screen.getAllByText('Contact')[0];
    await user.click(contactButton);

    expect(mockScrollToContact).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  test('navigates to home and scrolls to contact when Contact button is clicked on another page', async () => {
    vi.mocked(usePathname).mockReturnValue('/about');

    const { user } = render(<AppBar />);

    const contactButton = screen.getAllByText('Contact')[0];
    await user.click(contactButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/');

    await waitFor(() => {
      expect(mockScrollToContact).toHaveBeenCalledTimes(1);
    });
  });

  test('Book Now button calls scrollToBookingForm', async () => {
    const { user } = render(<AppBar />);

    const bookNowButton = screen.getByRole('button', { name: 'Book Now' });
    await user.click(bookNowButton);

    expect(mockScrollToBookingForm).toHaveBeenCalledTimes(1);
  });

  test('mobile menu Book Now button calls scrollToBookingForm and closes menu', async () => {
    const { user } = render(<AppBar />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    await user.click(menuButton);

    const mobileButtons = screen.getAllByRole('button', { name: 'Book Now' });
    const mobileBookNowButton = mobileButtons[mobileButtons.length - 1]; // Last one should be in mobile menu

    await user.click(mobileBookNowButton);

    expect(mockScrollToBookingForm).toHaveBeenCalledTimes(1);
  });
});
