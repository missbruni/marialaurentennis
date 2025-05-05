import { describe, expect, vi, beforeEach, test } from 'vitest';

import Hero from './HeroAnimated';
import { render, screen } from '../lib/test-utils';

describe('Hero', () => {
  const mockBookLesson = vi.fn();

  beforeEach(() => {
    mockBookLesson.mockReset();
  });

  test('renders correctly', () => {
    render(<Hero />);

    expect(screen.getByText(/Personalized coaching/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Lesson' })).toBeInTheDocument();
  });
});
