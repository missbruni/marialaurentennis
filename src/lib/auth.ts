export const COOKIE_NAME = 'mlt_session';
export const PROTECTED_ROUTES = {
  ADMIN: /^\/admin/,
  BOOKINGS: /^\/bookings/
  // API_AUTH: /^\/api\/auth\//
};

/**
 * Checks if a given path is a protected route
 */
export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.ADMIN.test(path) || PROTECTED_ROUTES.BOOKINGS.test(path);
}
