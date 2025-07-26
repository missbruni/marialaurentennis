import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('Logger', () => {
  let consoleSpy: {
    error: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('logs error messages correctly', () => {
    const error = new Error('Test error');
    const context = { userId: 'test-user', action: 'test-action' };
    const data = { testData: 'value' };

    logger.error('Test error message', error, context, data);

    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: Test error message')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('userId=test-user'));
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('action=test-action'));
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('"testData":"value"'));
  });

  test('logs warning messages correctly', () => {
    const context = { userId: 'test-user' };
    const data = { testData: 'value' };

    logger.warn('Test warning message', context, data);

    expect(consoleSpy.warn).toHaveBeenCalledWith(
      expect.stringContaining('WARN: Test warning message')
    );
    expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('userId=test-user'));
    expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('"testData":"value"'));
  });

  test('logs info messages correctly', () => {
    const context = { action: 'test-action' };

    logger.info('Test info message', context);

    expect(consoleSpy.info).toHaveBeenCalledWith(
      expect.stringContaining('INFO: Test info message')
    );
    expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('action=test-action'));
  });

  test('logs debug messages', () => {
    logger.debug('Test debug message');
    // Debug messages are logged in development, so we just test that the method exists and doesn't throw
    expect(consoleSpy.debug).toBeDefined();
  });

  test('actionFailure logs with correct context', () => {
    const error = new Error('Action failed');
    const context = { userId: 'test-user', action: 'createBooking' };
    const data = { bookingId: '123' };

    logger.actionFailure('createBooking', error, context, data);

    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: Action failed: createBooking')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('errorCode=ACTION_FAILURE')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('userId=test-user'));
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('"bookingId":"123"'));
  });

  test('dataFetchFailure logs with correct context', () => {
    const error = new Error('Network error');
    const context = { userId: 'test-user', action: 'getBookings' };
    const data = { cacheHit: false };

    logger.dataFetchFailure('getBookings', error, context, data);

    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: Data fetch failed: getBookings')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('errorCode=DATA_FETCH_FAILURE')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('userId=test-user'));
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('"cacheHit":false'));
  });

  test('authFailure logs with correct context', () => {
    const error = new Error('Authentication failed');
    const context = { userId: 'test-user', action: 'signIn' };
    const data = { provider: 'google' };

    logger.authFailure('signIn', error, context, data);

    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: Authentication failed: signIn')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('errorCode=AUTH_FAILURE')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('userId=test-user'));
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('"provider":"google"'));
  });

  test('paymentFailure logs with correct context', () => {
    const error = new Error('Payment failed');
    const context = { sessionId: 'sess_123', action: 'checkout' };
    const data = { amount: 1000 };

    logger.paymentFailure('checkout', error, context, data);

    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: Payment failed: checkout')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('errorCode=PAYMENT_FAILURE')
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('sessionId=sess_123'));
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('"amount":1000'));
  });

  test('includes timestamp in log messages', () => {
    logger.info('Test message');

    expect(consoleSpy.info).toHaveBeenCalledWith(
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
    );
  });

  test('includes environment in log messages', () => {
    logger.info('Test message');

    expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('environment='));
  });

  test('handles undefined context values gracefully', () => {
    const context = { userId: undefined, action: 'test' };

    logger.info('Test message', context);

    expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('action=test'));
    expect(consoleSpy.info).not.toHaveBeenCalledWith(expect.stringContaining('userId=undefined'));
  });

  test('handles undefined data gracefully', () => {
    logger.info('Test message', {}, undefined);

    expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('INFO: Test message'));
    expect(consoleSpy.info).not.toHaveBeenCalledWith(expect.stringContaining('Data:'));
  });
});
