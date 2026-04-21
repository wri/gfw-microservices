import CircuitBreaker = require('opossum');

export interface CircuitBreakerLogger {
  warn: (msg: string) => void;
  log?: (msg: string) => void;
}

export interface CircuitBreakerOptions {
  /** Identifier for this breaker, used in logs. */
  name: string;
  /** % of recent requests that must fail to open the circuit. Default: 50. */
  errorThresholdPercentage?: number;
  /** ms to stay open before allowing a half-open probe. Default: 30000. */
  resetTimeout?: number;
  /** Min requests in the rolling window before the breaker can trip. Default: 5. */
  volumeThreshold?: number;
  /** Size of the rolling stats window (ms). Default: 30000. */
  rollingCountTimeout?: number;
  /**
   * Return true to classify an error as a non-failure (e.g. 4xx client errors).
   * Non-failures don't count toward opening the circuit.
   */
  isNonFailure?: (err: unknown) => boolean;
  logger?: CircuitBreakerLogger;
}

/**
 * Creates a circuit breaker around an async action using opossum.
 *
 * Wire up sensible defaults for protecting downstream HTTP calls: the caller's
 * own timeout (e.g. axios) governs per-request latency, so opossum's timer is
 * disabled here. Client errors (4xx) should be excluded via `isNonFailure` so
 * they don't trip the breaker when the downstream is otherwise healthy.
 */
export function createCircuitBreaker<Args extends unknown[], R>(
  action: (...args: Args) => Promise<R>,
  options: CircuitBreakerOptions
): CircuitBreaker<Args, R> {
  const {
    name,
    errorThresholdPercentage = 50,
    resetTimeout = 30_000,
    volumeThreshold = 5,
    rollingCountTimeout = 30_000,
    isNonFailure,
    logger,
  } = options;

  const breaker = new CircuitBreaker<Args, R>(action, {
    timeout: false,
    errorThresholdPercentage,
    resetTimeout,
    volumeThreshold,
    rollingCountTimeout,
    name,
    ...(isNonFailure ? { errorFilter: isNonFailure } : {}),
  });

  if (logger) {
    breaker.on('open', () =>
      logger.warn(`Circuit breaker "${name}" opened — failing fast for ${resetTimeout}ms`)
    );
    breaker.on('halfOpen', () =>
      logger.warn(`Circuit breaker "${name}" half-open — probing downstream`)
    );
    breaker.on('close', () => {
      const msg = `Circuit breaker "${name}" closed — downstream recovered`;
      if (logger.log) {
        logger.log(msg);
      } else {
        logger.warn(msg);
      }
    });
  }

  return breaker;
}

/** Error thrown by opossum when the circuit is open and the call is rejected. */
export function isBreakerOpenError(err: unknown): boolean {
  return (err as { code?: string })?.code === 'EOPENBREAKER';
}
