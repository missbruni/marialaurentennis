import { describe, expect, vi, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

vi.mock('next-themes', () => ({
  useTheme: vi.fn().mockReturnValue({
    theme: 'light',
    setTheme: vi.fn(),
    themes: ['light', 'dark', 'system'],
    systemTheme: 'light',
    resolvedTheme: 'light'
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('ThemeToggle', () => {
  test('renders correctly', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  test('toggles theme when clicked', async () => {
    const setThemeMock = vi.fn();
    const nextThemes = await vi.importMock('next-themes');
    (nextThemes as any).useTheme.mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light',
      resolvedTheme: 'light'
    });

    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);

    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });
});
