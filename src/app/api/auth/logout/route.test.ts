import { NextResponse } from 'next/server';
import { POST } from './route';
import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import { COOKIE_NAME } from '@/lib/auth';

describe('POST /api/auth/logout', () => {
  let mockJsonResponse: NextResponse;
  let mockCookies: { set: Mock };
  let mockRequest: { headers: { get: Mock } };

  beforeEach(() => {
    mockCookies = { set: vi.fn() };
    mockRequest = {
      headers: {
        get: vi.fn().mockReturnValue('https://example.com/some/path')
      }
    };

    mockJsonResponse = { cookies: mockCookies } as unknown as NextResponse;
    vi.spyOn(NextResponse, 'json').mockReturnValue(mockJsonResponse);
  });

  test('should return success response and clear session cookie', async () => {
    const response = await POST(mockRequest as any);

    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
      isProtected: false
    });

    expect(mockCookies.set).toHaveBeenCalledWith(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expect.any(Date),
      path: '/'
    });

    const cookieOptions = mockCookies.set.mock.calls[0][2];
    expect(cookieOptions.expires.getTime()).toBe(0);

    expect(response).toBe(mockJsonResponse);
  });

  test('should identify protected routes correctly', async () => {
    // Mock a protected route referer
    mockRequest.headers.get.mockReturnValue('https://example.com/admin/dashboard');

    const response = await POST(mockRequest as any);

    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
      isProtected: true
    });

    expect(mockCookies.set).toHaveBeenCalled();
    expect(response).toBe(mockJsonResponse);
  });
});
