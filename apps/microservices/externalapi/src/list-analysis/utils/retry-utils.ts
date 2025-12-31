import { HttpStatus } from '@nestjs/common';
import * as axiosRetry from 'axios-retry';

const DEFAULT_DELAY = 1000; // 1 second

const retryableHttpStatusCodes = [
  HttpStatus.TOO_MANY_REQUESTS,
  HttpStatus.INTERNAL_SERVER_ERROR,
  HttpStatus.BAD_GATEWAY,
  HttpStatus.SERVICE_UNAVAILABLE,
  HttpStatus.GATEWAY_TIMEOUT,
];

export const isRetryableError = (error: any): boolean => {
  // Retry on network errors, timeouts, and specific HTTP status codes
  const isNetworkError = !error.response && !!error.code;
  const statusCode = error.response?.status || error.code;
  const isTimeout =
    error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET';
  const isRetryableStatus = statusCode && retryableHttpStatusCodes.includes(statusCode);
  return Boolean(
    axiosRetry.isRetryableError(error) || isNetworkError || isTimeout || isRetryableStatus
  );
};

export { DEFAULT_DELAY };
