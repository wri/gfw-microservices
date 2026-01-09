import * as axiosRetry from 'axios-retry';

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  isRetryable?: (err: any) => boolean;
  logger?: { warn: (msg: string) => void };
}

/**
 * Executes an async function with retry logic and fixed delay between attempts.
 * This function uses a FIXED delay between retries
 *
 * @template T - The return type of the function being retried
 * @param fn - The async function to execute with retry logic
 * @param options - Configuration options for retry behavior
 * @param options.retries - Total number of attempts (including the initial attempt). Default: 3
 * @param options.delayMs - Fixed delay in milliseconds between retry attempts. Default: 1000ms
 * @param options.isRetryable - Function to determine if an error should trigger a retry.
 *                              If not provided or returns false, the error is thrown immediately.
 *                              Default: () => false (no retries on error)
 * @param options.logger - Optional logger with a warn method for logging retry attempts
 *
 * @returns Promise that resolves with the result of the function if successful
 * @throws The last error encountered if all retry attempts fail or if the error is not retryable
 */
export async function retryWithDelay<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { retries = 3, delayMs = 1000, isRetryable = () => false, logger } = options;

  let attempt = 0;
  let lastError: any;

  while (attempt < retries) {
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

/**
 * Determines if an error should be retried based on error codes and HTTP status codes.
 *
 * This function combines multiple retry detection strategies:
 * 1. Axios-retry's built-in retry detection (handles network errors, ENOTFOUND, etc.)
 * 2. Network errors (errors without a response but with an error code)
 * 3. Specific error codes (ECONNRESET, ECONNABORTED, ETIMEDOUT)
 * 4. HTTP status codes indicating temporary failures
 *
 * @param error - The error object to evaluate
 * @returns true if the error is retryable, false otherwise
 *
 * Retryable conditions:
 * - Axios-retry detectable errors (network errors, DNS errors, etc.)
 * - Network errors: No response and an error code is present
 * - Error codes: ECONNRESET, ECONNABORTED, ETIMEDOUT (connection/timeout errors)
 * - HTTP status codes: 429 (Too Many Requests), 500 (Internal Server Error),
 *   502 (Bad Gateway), 503 (Service Unavailable), 504 (Gateway Timeout)
 */
export function isRetryableError(error: any): boolean {
  // Check if axios-retry considers this error retryable
  const isAxiosRetryable = axiosRetry.isRetryableError(error);

  // Check for network errors (no response but has an error code)
  const isNetworkError = !error.response && !!error?.code;

  // Check for specific error codes
  const retryableCodes = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT'];
  const hasRetryableCode = retryableCodes.includes(error?.code);

  // Check for retryable HTTP status codes
  const status = error?.response?.status;
  const hasRetryableStatus = [429, 500, 502, 503, 504].includes(status);

  return Boolean(isAxiosRetryable || isNetworkError || hasRetryableCode || hasRetryableStatus);
}
