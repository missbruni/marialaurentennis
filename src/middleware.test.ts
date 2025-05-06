import { beforeEach, describe, expect, test, vi } from 'vitest';
import { middleware } from './middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

describe('middleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    // mockNextResponse methods
    vi.spyOn(NextResponse, 'redirect').mockImplementation((url) => {
      return new NextResponse(null, { status: 302, headers: { Location: url.toString() } });
    });

    vi.spyOn(NextResponse, 'next').mockImplementation(() => {
      return new NextResponse(null, { status: 200 });
    });
  });

  test('should redirect to login when accessing protected route without session', () => {
    mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue(undefined)
      },
      nextUrl: {
        pathname: '/admin/availability',
        searchParams: new URLSearchParams()
      },
      url: 'https://example.com/admin/availability'
    } as unknown as NextRequest;

    const response = middleware(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(response.status).toBe(302);

    const locationHeader = response.headers.get('Location');
    expect(locationHeader).toContain('/login');

    const redirectUrl = new URL(locationHeader || '');
    expect(redirectUrl.searchParams.get('from')).toBe('/admin/availability');
  });

  test('should allow access to protected route with valid session', () => {
    mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue({ value: 'valid-session-token' })
      },
      nextUrl: {
        pathname: '/admin/availability'
      }
    } as unknown as NextRequest;

    const response = middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('should return 401 for API routes without session', () => {
    const mockJsonResponse = new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: { 'content-type': 'application/json' }
      }
    );

    const originalNextResponse = NextResponse;
    (global as any).NextResponse = vi.fn().mockImplementation(() => {
      return mockJsonResponse;
    }) as any;

    mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue(undefined)
      },
      nextUrl: {
        pathname: '/api/auth/session'
      }
    } as unknown as NextRequest;

    const response = middleware(mockRequest);

    expect(response.status).toBe(401);

    return response.text().then((text) => {
      const responseBody = JSON.parse(text);
      expect(responseBody).toEqual({ error: 'Authentication required' });

      (global as any).NextResponse = originalNextResponse;
    });
  });

  test('should allow access to API routes with valid session', () => {
    mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue({ value: 'valid-session-token' })
      },
      nextUrl: {
        pathname: '/api/auth/session'
      }
    } as unknown as NextRequest;

    const response = middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('should allow access to public routes without session', () => {
    mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue(undefined)
      },
      nextUrl: {
        pathname: '/login'
      }
    } as unknown as NextRequest;

    const response = middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});
