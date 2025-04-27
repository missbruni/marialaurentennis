import React from 'react';
import { describe, expect, vi, test } from 'vitest';
import { render } from '@testing-library/react';
import TennisBall from './TennisBall';

describe('TennisBall', () => {
  test('renders correctly', () => {
    const { container } = render(<TennisBall />);

    const tennisBallElement = container.querySelector('div');
    expect(tennisBallElement).toBeInTheDocument();
    expect(tennisBallElement).toHaveStyle({
      backgroundImage: "url('/tennis-ball.png')"
    });
  });

  test('updates position on scroll', () => {
    const scrollY = 100;
    Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true });

    const useEffectSpy = vi.spyOn(React, 'useEffect');
    const setScrollYMock = vi.fn();
    vi.spyOn(React, 'useState').mockImplementation(() => [scrollY, setScrollYMock]);

    render(<TennisBall />);

    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);

    expect(useEffectSpy).toHaveBeenCalled();

    useEffectSpy.mockRestore();
  });
});
