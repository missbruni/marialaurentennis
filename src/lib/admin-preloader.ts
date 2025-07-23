export function preloadAdminDashboard(): Promise<unknown> {
  return import('@/app/admin/page');
}

export function preloadAdminAvailability(): Promise<unknown> {
  return import('@/app/admin/availability/page');
}

export function preloadAdminSettings(): Promise<unknown> {
  return import('@/app/admin/settings/page');
}

export function preloadAdminLayout(): Promise<unknown> {
  return import('@/app/admin/layout');
}

export function preloadAllAdminComponents(): void {
  preloadAdminLayout();

  preloadAdminDashboard();
  preloadAdminAvailability();
  preloadAdminSettings();
}

export function preloadRouteComponents(route: string): void {
  switch (route) {
    case '/admin':
      preloadAdminDashboard();
      break;
    case '/admin/availability':
      preloadAdminAvailability();
      break;
    case '/admin/settings':
      preloadAdminSettings();
      break;
    default:
      // Preload all for unknown routes
      preloadAllAdminComponents();
  }
}

export function useAdminPreloader() {
  return {
    preloadAdminDashboard,
    preloadAdminAvailability,
    preloadAdminSettings,
    preloadAdminLayout,
    preloadAllAdminComponents,
    preloadRouteComponents
  };
}
