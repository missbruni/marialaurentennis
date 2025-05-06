import { describe, expect, vi, beforeEach, test } from 'vitest';

import AppBar from './AppBar';
import { screen, render } from '@/lib/test-utils';
import * as useSectionRefModule from '@/hooks/useSectionRef';
import userEvent from '@testing-library/user-event';

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
  const mockScrollToContact = vi.fn();

  beforeEach(() => {
    mockScrollToBookingForm.mockReset();
    vi.spyOn(useSectionRefModule, 'useSectionRef').mockReturnValue({
      scrollToBookingForm: mockScrollToBookingForm,
      bookingFormRef: { current: null },
      contactRef: { current: null },
      scrollToContact: mockScrollToContact
    });
  });

  test('renders correctly', () => {
    render(<AppBar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
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
    render(<AppBar />);
    const user = userEvent.setup();

    const menuButton = screen.getByLabelText('Toggle menu');
    await user.click(menuButton);
  });
});
