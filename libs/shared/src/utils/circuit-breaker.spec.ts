import { createCircuitBreaker, isBreakerOpenError } from './circuit-breaker';

describe('createCircuitBreaker', () => {
  const flushEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

  it('opens after repeated failures and fails fast', async () => {
    const action = jest.fn().mockRejectedValue(new Error('boom'));
    const breaker = createCircuitBreaker(action, {
      name: 'test',
      volumeThreshold: 2,
      errorThresholdPercentage: 50,
      resetTimeout: 10_000,
    });

    await expect(breaker.fire()).rejects.toThrow('boom');
    await expect(breaker.fire()).rejects.toThrow('boom');
    await flushEventLoop();
    expect(breaker.opened).toBe(true);

    const err = await breaker.fire().catch((e) => e);
    expect(isBreakerOpenError(err)).toBe(true);
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('closes again after a successful half-open probe', async () => {
    let shouldFail = true;
    const action = jest.fn(async () => {
      if (shouldFail) {
        throw new Error('boom');
      }
      return 'ok';
    });
    const breaker = createCircuitBreaker(action, {
      name: 'test',
      volumeThreshold: 2,
      errorThresholdPercentage: 50,
      resetTimeout: 20,
    });

    for (let i = 0; i < 3; i++) {
      await breaker.fire().catch(() => undefined);
    }
    await flushEventLoop();
    expect(breaker.opened).toBe(true);

    shouldFail = false;
    await new Promise((resolve) => setTimeout(resolve, 30));

    await expect(breaker.fire()).resolves.toBe('ok');
    expect(breaker.closed).toBe(true);
  });

  it('does not count non-failure errors toward opening the circuit', async () => {
    const clientError = Object.assign(new Error('bad request'), { status: 400 });
    const action = jest.fn().mockRejectedValue(clientError);
    const breaker = createCircuitBreaker(action, {
      name: 'test',
      volumeThreshold: 2,
      errorThresholdPercentage: 50,
      resetTimeout: 10_000,
      isNonFailure: (err) => (err as { status?: number }).status === 400,
    });

    for (let i = 0; i < 5; i++) {
      await expect(breaker.fire()).rejects.toBe(clientError);
    }
    await flushEventLoop();
    expect(breaker.opened).toBe(false);
  });

  it('emits open/halfOpen/close to the logger', async () => {
    const logger = { warn: jest.fn(), log: jest.fn() };
    let shouldFail = true;
    const action = jest.fn(async () => {
      if (shouldFail) {
        throw new Error('boom');
      }
      return 'ok';
    });
    const breaker = createCircuitBreaker(action, {
      name: 'named-breaker',
      volumeThreshold: 2,
      errorThresholdPercentage: 50,
      resetTimeout: 20,
      logger,
    });

    for (let i = 0; i < 3; i++) {
      await breaker.fire().catch(() => undefined);
    }
    await flushEventLoop();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('opened'));

    shouldFail = false;
    await new Promise((resolve) => setTimeout(resolve, 30));
    await breaker.fire();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('half-open'));
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('closed'));
  });
});
