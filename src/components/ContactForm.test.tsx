import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import ContactForm from './ContactForm';

// Hoisted mock function
const mockUseSectionRef = vi.hoisted(() => vi.fn());

// Mock the useSectionRef hook
vi.mock('@/hooks/useSectionRef', () => ({
  useSectionRef: mockUseSectionRef,
  SectionRefProvider: ({ children }: any) => (
    <div data-testid="section-ref-provider">{children}</div>
  )
}));

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSectionRef.mockReturnValue({
      contactRef: { current: null }
    });
  });

  test('renders contact form section with correct structure', () => {
    render(<ContactForm />);

    expect(screen.getByTestId('contact-form-section')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form-title')).toHaveTextContent('Contact us');
    expect(screen.getByTestId('contact-form-name')).toHaveTextContent('Maria Lauren Wisdom');
  });

  test('renders all social media icons', () => {
    render(<ContactForm />);

    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
  });

  test('renders Instagram link with correct attributes', () => {
    render(<ContactForm />);

    const instagramLink = screen.getByLabelText("Visit Maria Lauren's Instagram");
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/marialaurentennis/');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders Facebook link with correct attributes', () => {
    render(<ContactForm />);

    const facebookLink = screen.getByLabelText("Visit Maria Lauren's Facebook");
    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/MariaLaurenTennis');
    expect(facebookLink).toHaveAttribute('target', '_blank');
    expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders Twitter link with correct attributes', () => {
    render(<ContactForm />);

    const twitterLink = screen.getByLabelText("Visit Maria Lauren's Twitter");
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/marialaurenten1');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('applies correct CSS classes to section', () => {
    render(<ContactForm />);

    const section = screen.getByTestId('contact-form-section');
    expect(section).toHaveClass('w-full', 'bg-[#040504]', 'text-white');
  });

  test('applies correct CSS classes to title', () => {
    render(<ContactForm />);

    const title = screen.getByTestId('contact-form-title');
    expect(title).toHaveClass('text-tennis-green');
  });

  test('applies correct CSS classes to name', () => {
    render(<ContactForm />);

    const name = screen.getByTestId('contact-form-name');
    expect(name).toHaveClass('mb-2');
  });

  test('social media links have hover effects', () => {
    render(<ContactForm />);

    const instagramLink = screen.getByLabelText("Visit Maria Lauren's Instagram");
    const facebookLink = screen.getByLabelText("Visit Maria Lauren's Facebook");
    const twitterLink = screen.getByLabelText("Visit Maria Lauren's Twitter");

    expect(instagramLink).toHaveClass('transition-opacity', 'hover:opacity-80');
    expect(facebookLink).toHaveClass('transition-opacity', 'hover:opacity-80');
    expect(twitterLink).toHaveClass('transition-opacity', 'hover:opacity-80');
  });

  test('uses section ref from useSectionRef hook', () => {
    const mockRef = { current: null };
    mockUseSectionRef.mockReturnValue({
      contactRef: mockRef
    });

    render(<ContactForm />);

    expect(mockUseSectionRef).toHaveBeenCalledTimes(1);
  });
});
