import { describe, expect, vi, test, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from './route';
import * as firebaseAdmin from '@/lib/firebase-admin';

vi.mock('@/lib/firebase-admin', () => ({
  createSessionCookie: vi.fn()
}));

describe('POST /api/auth/session', () => {
  let mockRequest: NextRequest;
  const mockSessionCookie = 'mock-session-cookie';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firebaseAdmin.createSessionCookie).mockResolvedValue(mockSessionCookie);

    mockRequest = {
      json: vi.fn().mockResolvedValue({ idToken: 'valid-id-token' })
    } as unknown as NextRequest;

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('should create a session cookie successfully', async () => {
    const mockCookies = {
      set: vi.fn()
    };

    const mockResponse = {
      cookies: mockCookies,
      status: 200,
      json: () => Promise.resolve({ success: true })
    };

    vi.spyOn(NextResponse, 'json').mockReturnValue(mockResponse as unknown as NextResponse);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response).toBe(mockResponse);
    expect(responseData).toEqual({ success: true });

    expect(firebaseAdmin.createSessionCookie).toHaveBeenCalledWith('valid-id-token');

    expect(mockCookies.set).toHaveBeenCalledWith('session', mockSessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/'
    });
  });

  test('should return 400 when idToken is missing', async () => {
    mockRequest.json = vi.fn().mockResolvedValue({});

    const mockResponse = {
      status: 400,
      json: () => Promise.resolve({ error: 'ID token is required' })
    };

    vi.spyOn(NextResponse, 'json').mockReturnValue(mockResponse as unknown as NextResponse);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: 'ID token is required' });
    expect(firebaseAdmin.createSessionCookie).not.toHaveBeenCalled();
  });

  test('should handle errors from createSessionCookie', async () => {
    const errorMessage = 'Invalid ID token';
    vi.mocked(firebaseAdmin.createSessionCookie).mockRejectedValueOnce(new Error(errorMessage));

    const mockResponse = {
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' })
    };

    vi.spyOn(NextResponse, 'json').mockReturnValue(mockResponse as unknown as NextResponse);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Internal server error' });

    expect(console.error).toHaveBeenCalledWith('Session creation error:', expect.any(Error));
  });
});
