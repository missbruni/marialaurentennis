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

  test('should redirect with auth params when accessing protected route without session', () => {
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
    expect(locationHeader).toContain('auth=true');
    expect(locationHeader).toContain('from=%2Fadmin%2Favailability');

    const redirectUrl = new URL(locationHeader || '');
    expect(redirectUrl.searchParams.get('from')).toBe('/admin/availability');
    expect(redirectUrl.searchParams.get('auth')).toBe('true');
  });

  test('should allow access to protected route with valid session', () => {
    mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue({ value: 'valid-session-token' })
      },
      nextUrl: {
        pathname: '/admin/availability',
        searchParams: new URLSearchParams()
      }
    } as unknown as NextRequest;

    const response = middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('should not redirect if auth param already exists', () => {
    mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue(undefined)
      },
      nextUrl: {
        pathname: '/admin/availability',
        searchParams: new URLSearchParams('auth=true')
      },
      url: 'https://example.com/admin/availability?auth=true'
    } as unknown as NextRequest;

    const response = middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('should allow access to API routes with valid session', () => {
    mockRequest = {
      cookies: {
        get: vi.fn().mockReturnValue({ value: 'valid-session-token' })
      },
      nextUrl: {
        pathname: '/api/auth/session',
        searchParams: new URLSearchParams()
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
        pathname: '/login',
        searchParams: new URLSearchParams()
      }
    } as unknown as NextRequest;

    const response = middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});
