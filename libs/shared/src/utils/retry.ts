export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  isRetryable?: (err: any) => boolean;
  logger?: { warn: (msg: string) => void };
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    delayMs = 1000,
    isRetryable = () => false,
    logger,
  } = options;

  let attempt = 0;
  let lastError: any;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries && isRetryable(err)) {
        logger?.warn?.(
          `Retryable error: ${err.code || err.message}. Retrying (${retries - attempt} left)...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        attempt++;
      } else {
        break;
      }
    }
  }
  throw lastError;
}

export function isRetryableError(error: any): boolean {
  const retryableCodes = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT'];
  const status = error?.response?.status;
  return (
    retryableCodes.includes(error.code) ||
    [429, 500, 502, 503, 504].includes(status)
  );
}
