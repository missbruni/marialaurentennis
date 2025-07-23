import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import AdminPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/admin'
}));

// Mock the admin preloader hook
vi.mock('@/lib/admin-preloader', () => ({
  useAdminPreloader: () => ({
    preloadRouteComponents: vi.fn()
  })
}));

describe('AdminPage', () => {
  test('renders admin dashboard with all cards', () => {
    render(<AdminPage />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to the admin dashboard/)).toBeInTheDocument();

    // Check that all dashboard items are rendered
    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  test('shows correct status text for each card', () => {
    render(<AdminPage />);

    // Check status text for each card
    expect(screen.getByText('Set Up')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('12 Active')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('25 Total')).toBeInTheDocument();
  });

  test('shows correct action text for each card', () => {
    render(<AdminPage />);

    // Check action text for each card
    expect(screen.getByText('Manage availability →')).toBeInTheDocument();
    expect(screen.getByText('Manage settings →')).toBeInTheDocument();
    expect(screen.getByText('View all bookings →')).toBeInTheDocument();
    expect(screen.getByText('Edit profile →')).toBeInTheDocument();
    expect(screen.getByText('View analytics →')).toBeInTheDocument();
    expect(screen.getByText('View clients →')).toBeInTheDocument();
  });

  test('disabled cards have correct styling', () => {
    render(<AdminPage />);

    // Check that disabled cards have the correct aria-disabled attribute
    const disabledCards = screen
      .getAllByRole('button', { hidden: true })
      .filter((card) => card.getAttribute('disabled') === '');
    expect(disabledCards.length).toBe(4); // Bookings, Profile, Analytics, and Clients should be disabled
  });
});
