import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { HttpStatus } from '@nestjs/common';
import axiosRetry from 'axios-retry';
import type { DataSource } from 'typeorm';
import type { ClientStoreConnection } from '@wri-monorepos/sql';

export function logExecutionTime(className) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    const logger = new Logger(className);

    descriptor.value = async function (...args) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      const durationMs = end - start;

      // Check for negative duration
      if (durationMs < 0) {
        logger.debug(`Error: Negative execution time detected for ${className}.${propertyKey}`);
        return result;
      }

      // Convert duration to seconds and minutes if needed
      let durationStr;
      if (durationMs < 1000) {
        durationStr = `${durationMs.toFixed(2)}ms`;
      } else if (durationMs < 60000) {
        const durationSec = durationMs / 1000;
        durationStr = `${durationSec.toFixed(2)}s`;
      } else {
        const durationMin = durationMs / 60000;
        durationStr = `${durationMin.toFixed(2)}min`;
      }

      logger.debug(`${className}.${propertyKey} executed in ${durationStr}`);
      return result;
    };

    return descriptor;
  };
}

export async function yieldIfLong(
  lastYieldTimestamp: number,
  options: { thresholdMs?: number; delayMs?: number } = {}
): Promise<number> {
  const { thresholdMs = 1000, delayMs = 100 } = options;
  const now = Date.now();

  if (now - lastYieldTimestamp > thresholdMs) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return Date.now();
  }

  return lastYieldTimestamp;
}

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

const CONNECTION_CLOSED_ERROR =
  /connection is closed|connection lost|ECONNRESET|ECONNCLOSED|socket hang up/i;

/**
 * True when the error indicates the underlying SQL connection was closed
 * (e.g. by the connection cache TTL or by the SQL server) rather than a
 * problem with the statement itself.
 */
export function isConnectionClosedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return CONNECTION_CLOSED_ERROR.test(message);
}

export interface BatchedInsertOptions<TEntity, TBatch> {
  /** Connection cache owner, used for keep-alive and recovery. */
  clientStoreConnection: ClientStoreConnection;
  /** Database the connection belongs to (used to re-acquire it on retry). */
  organizationDatabase: string;
  /** Entity schema used to look up the cached connection. */
  entity: TEntity;
  /** Rows to insert, already split into batches. */
  batches: TBatch[];
  /** Performs the actual insert for one batch using the supplied connection. */
  insertBatch: (connection: DataSource, batch: TBatch) => Promise<void>;
  /** Called after each batch is inserted (e.g. to yield to the event loop). */
  onBatchComplete?: () => Promise<void>;
  /** Maximum attempts per batch when recovering from a closed connection. */
  maxAttempts?: number;
  /** Optional logger for retry warnings. */
  logger?: Logger;
}

/**
 * Runs a batched insert loop while keeping the cached TypeORM connection alive.
 *
 * `ClientStoreConnection` caches dynamic (per-list-table) DataSources with a
 * 30s TTL that is only refreshed by `getConnection` calls. A loop that acquires
 * a connection once and then inserts for longer than the TTL can therefore have
 * its DataSource destroyed mid-flight, surfacing as
 * `QueryFailedError: ConnectionError: Connection is closed`.
 *
 * This helper refreshes the cache entry before every batch and, if a batch
 * still fails because the connection was closed, invalidates the cached
 * DataSource, re-acquires a fresh one and retries that batch.
 */
export async function runBatchedInsertWithKeepAlive<TEntity, TBatch>({
  clientStoreConnection,
  organizationDatabase,
  entity,
  batches,
  insertBatch,
  onBatchComplete,
  maxAttempts = 3,
  logger,
}: BatchedInsertOptions<TEntity, TBatch>): Promise<void> {
  const entities = [entity] as never;
  let connection = await clientStoreConnection.getConnection(organizationDatabase, entities);

  for (const batch of batches) {
    // Keep the cached connection alive so the TTL cannot expire mid-loop.
    await clientStoreConnection.refreshConnection(organizationDatabase, entities);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await insertBatch(connection, batch);
        await onBatchComplete?.();
        break;
      } catch (error) {
        if (attempt === maxAttempts || !isConnectionClosedError(error)) {
          throw error;
        }

        logger?.warn(
          `Insert batch attempt ${attempt}/${maxAttempts} failed with a closed connection; ` +
            `re-acquiring connection for ${organizationDatabase} and retrying`
        );

        await clientStoreConnection.invalidateConnection(organizationDatabase, entities);
        connection = await clientStoreConnection.getConnection(organizationDatabase, entities);
      }
    }
  }
}
