import { calculateBackoffDelay, retryWithDelay, isRetryableError } from './retry';

describe('calculateBackoffDelay', () => {
  describe('fixed strategy', () => {
    it('returns the same delay for every attempt', () => {
      const options = { delayMs: 1000, backoff: 'fixed' as const };

      expect(calculateBackoffDelay(1, options)).toBe(1000);
      expect(calculateBackoffDelay(2, options)).toBe(1000);
      expect(calculateBackoffDelay(3, options)).toBe(1000);
    });
  });

  describe('exponential strategy', () => {
    it('doubles the delay after each attempt', () => {
      const options = { delayMs: 1000, backoff: 'exponential' as const };

      expect(calculateBackoffDelay(1, options)).toBe(1000);
      expect(calculateBackoffDelay(2, options)).toBe(2000);
      expect(calculateBackoffDelay(3, options)).toBe(4000);
      expect(calculateBackoffDelay(4, options)).toBe(8000);
    });

    it('respects maxDelayMs as a ceiling', () => {
      const options = { delayMs: 1000, backoff: 'exponential' as const, maxDelayMs: 3000 };

      expect(calculateBackoffDelay(1, options)).toBe(1000);
      expect(calculateBackoffDelay(2, options)).toBe(2000);
      expect(calculateBackoffDelay(3, options)).toBe(3000);
      expect(calculateBackoffDelay(4, options)).toBe(3000);
    });
  });
});

describe('retryWithDelay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the result on the first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    await expect(retryWithDelay(fn, { retries: 3 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries with a fixed delay by default', async () => {
    const error = Object.assign(new Error('boom'), { response: { status: 502 } });
    const fn = jest.fn().mockRejectedValueOnce(error).mockResolvedValue('ok');

    const promise = retryWithDelay(fn, { retries: 3, isRetryable: isRetryableError });

    await jest.advanceTimersByTimeAsync(999);
    expect(fn).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('waits exponentially between attempts', async () => {
    const error = Object.assign(new Error('boom'), { response: { status: 502 } });
    const fn = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('ok');

    const promise = retryWithDelay(fn, {
      retries: 3,
      delayMs: 1000,
      backoff: 'exponential',
      isRetryable: isRetryableError,
    });

    // First retry waits 1000ms
    await jest.advanceTimersByTimeAsync(999);
    expect(fn).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(2);

    // Second retry waits 2000ms
    await jest.advanceTimersByTimeAsync(1999);
    expect(fn).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(1);

    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry when the error is not retryable', async () => {
    const error = Object.assign(new Error('bad request'), { response: { status: 400 } });
    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithDelay(fn, { retries: 3, isRetryable: isRetryableError })).rejects.toThrow(
      'bad request'
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws the last error after exhausting all attempts', async () => {
    const error = Object.assign(new Error('boom'), { response: { status: 502 } });
    const fn = jest.fn().mockRejectedValue(error);

    const promise = retryWithDelay(fn, {
      retries: 3,
      delayMs: 1000,
      backoff: 'exponential',
      isRetryable: isRetryableError,
    });
    const assertion = expect(promise).rejects.toThrow('boom');

    await jest.advanceTimersByTimeAsync(1000 + 2000);
    await assertion;

    expect(fn).toHaveBeenCalledTimes(3);
  });
});
