import { describe, expect, vi, beforeEach, test } from 'vitest';

import AppBar from './AppBar';
import { screen, render } from '../lib/test-utils';
import * as useBookingFormModule from './hooks/useBookingForm';

vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children, className, onClick }: any) => {
      return (
        <a href={href} className={className} onClick={onClick}>
          {children}
        </a>
      );
    }
  };
});

describe('AppBar', () => {
  const mockScrollToBookingForm = vi.fn();

  beforeEach(() => {
    mockScrollToBookingForm.mockReset();
    vi.spyOn(useBookingFormModule, 'useBookingForm').mockReturnValue({
      scrollToBookingForm: mockScrollToBookingForm,
      bookingFormRef: { current: null }
    });
  });

  test('renders correctly', () => {
    render(<AppBar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Coaches')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  test('calls scrollToBookingForm when Book Now button is clicked', async () => {
    const { user } = render(<AppBar />);

    const bookNowButton = screen.getByText('Book Now');
    await user.click(bookNowButton);

    expect(mockScrollToBookingForm).toHaveBeenCalledTimes(1);
  });

  test('calls scrollToBookingForm when lessons button is clicked', async () => {
    const { user } = render(<AppBar />);

    const bookNowButton = screen.getByText('Lessons');
    await user.click(bookNowButton);

    expect(mockScrollToBookingForm).toHaveBeenCalledTimes(1);
  });

  test('toggles mobile menu when menu button is clicked', async () => {
    const { user } = render(<AppBar />);

    expect(screen.queryByText('Camps')).not.toBeInTheDocument();

    const menuButton = screen.getByLabelText('Toggle menu');
    await user.click(menuButton);

    expect(screen.getByText('Camps')).toBeInTheDocument();

    await user.click(menuButton);

    expect(screen.queryByText('Camps')).not.toBeInTheDocument();
  });
});
