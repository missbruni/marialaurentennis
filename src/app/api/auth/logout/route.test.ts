import { NextResponse } from 'next/server';
import { POST } from './route';
import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';

describe('POST /api/auth/logout', () => {
  let mockJsonResponse: NextResponse;
  let mockCookies: { set: Mock };

  beforeEach(() => {
    mockCookies = { set: vi.fn() };

    mockJsonResponse = { cookies: mockCookies } as unknown as NextResponse;
    vi.spyOn(NextResponse, 'json').mockReturnValue(mockJsonResponse);
  });

  test('should return success response and clear session cookie', async () => {
    const response = await POST();

    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    expect(mockCookies.set).toHaveBeenCalledWith('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expect.any(Date),
      path: '/'
    });

    const cookieOptions = mockCookies.set.mock.calls[0][2];
    expect(cookieOptions.expires.getTime()).toBe(0);

    expect(response).toBe(mockJsonResponse);
  });
});
