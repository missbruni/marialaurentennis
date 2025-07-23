import { test, expect, describe, vi } from 'vitest';
import {
  preloadAdminDashboard,
  preloadAdminAvailability,
  preloadAdminSettings,
  preloadRouteComponents,
  useAdminPreloader
} from './admin-preloader';

// Mock dynamic imports with simple objects
vi.mock('@/app/admin/page', () => ({
  default: vi.fn()
}));

vi.mock('@/app/admin/availability/page', () => ({
  default: vi.fn()
}));

vi.mock('@/app/admin/settings/page', () => ({
  default: vi.fn()
}));

vi.mock('@/app/admin/layout', () => ({
  default: vi.fn()
}));

describe('Admin Preloader', () => {
  test('preloadAdminDashboard should return a promise', async () => {
    const result = preloadAdminDashboard();
    expect(result).toBeInstanceOf(Promise);

    const loadedModule = await result;
    expect(loadedModule).toBeDefined();
  });

  test('preloadAdminAvailability should return a promise', async () => {
    const result = preloadAdminAvailability();
    expect(result).toBeInstanceOf(Promise);

    const loadedModule = await result;
    expect(loadedModule).toBeDefined();
  });

  test('preloadAdminSettings should return a promise', async () => {
    const result = preloadAdminSettings();
    expect(result).toBeInstanceOf(Promise);

    const loadedModule = await result;
    expect(loadedModule).toBeDefined();
  });

  test('preloadRouteComponents should handle different routes', () => {
    // Test that the function doesn't throw for different routes
    expect(() => preloadRouteComponents('/admin')).not.toThrow();
    expect(() => preloadRouteComponents('/admin/availability')).not.toThrow();
    expect(() => preloadRouteComponents('/admin/settings')).not.toThrow();
    expect(() => preloadRouteComponents('/admin/unknown')).not.toThrow();
  });

  test('useAdminPreloader should return all preload functions', () => {
    const preloader = useAdminPreloader();

    expect(preloader).toHaveProperty('preloadAdminDashboard');
    expect(preloader).toHaveProperty('preloadAdminAvailability');
    expect(preloader).toHaveProperty('preloadAdminSettings');
    expect(preloader).toHaveProperty('preloadRouteComponents');
    expect(preloader).toHaveProperty('preloadAllAdminComponents');

    // Test that functions are callable
    expect(typeof preloader.preloadAdminDashboard).toBe('function');
    expect(typeof preloader.preloadAdminAvailability).toBe('function');
    expect(typeof preloader.preloadAdminSettings).toBe('function');
    expect(typeof preloader.preloadRouteComponents).toBe('function');
  });
});
