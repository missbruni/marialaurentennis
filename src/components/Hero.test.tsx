import { describe, expect, vi, beforeEach, test } from 'vitest';

import Hero from './Hero';
import { render, screen } from '../lib/test-utils';

describe('Hero', () => {
  const mockBookLesson = vi.fn();

  beforeEach(() => {
    mockBookLesson.mockReset();
  });

  test('renders correctly', () => {
    render(<Hero />);

    expect(screen.getByText('Maria Lauren Tennis')).toBeInTheDocument();
    expect(screen.getByText(/Personalized coaching/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Lesson' })).toBeInTheDocument();
  });
});
