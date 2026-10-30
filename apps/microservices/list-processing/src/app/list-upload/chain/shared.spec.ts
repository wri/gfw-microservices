import { isConnectionClosedError, logExecutionTime, runBatchedInsertWithKeepAlive } from './shared';
import { performance } from 'perf_hooks';
import { Logger } from '@nestjs/common';

jest.mock('perf_hooks', () => ({
  performance: {
    now: jest.fn(),
  },
}));

describe('logExecutionTime', () => {
  let loggerLogSpy;

  beforeEach(() => {
    loggerLogSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(jest.fn());
    (performance.now as jest.Mock).mockClear();
  });

  afterEach(() => {
    loggerLogSpy.mockRestore();
  });

  it('should log the execution time of an async method using NestJS Logger', async () => {
    // Mock performance.now to simulate execution time
    (performance.now as jest.Mock)
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(2000); // end time

    class TestClass {
      @logExecutionTime('TestClass')
      async testMethod() {
        return 'result';
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
    expect(loggerLogSpy).toHaveBeenCalledWith('TestClass.testMethod executed in 1.00s');
  });

  it('should handle negative execution time gracefully using NestJS Logger', async () => {
    // Mock performance.now to simulate negative execution time
    (performance.now as jest.Mock)
      .mockReturnValueOnce(2000) // start time
      .mockReturnValueOnce(1000); // end time

    class TestClass {
      @logExecutionTime('TestClass')
      async testMethod() {
        return 'result';
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
    expect(loggerLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('executed in'));
    expect(loggerLogSpy).toHaveBeenCalledWith(
      'Error: Negative execution time detected for TestClass.testMethod'
    );
  });

  it('should log the execution time of 100ms using NestJS Logger', async () => {
    // Mock performance.now to simulate 100ms execution time
    (performance.now as jest.Mock)
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(1100); // end time

    class TestClass {
      @logExecutionTime('TestClass')
      async testMethod() {
        return 'result';
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
    expect(loggerLogSpy).toHaveBeenCalledWith('TestClass.testMethod executed in 100.00ms');
  });

  it('should log the execution time of 1 minute using NestJS Logger', async () => {
    // Mock performance.now to simulate 1 minute execution time
    (performance.now as jest.Mock)
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(61000); // end time

    class TestClass {
      @logExecutionTime('TestClass')
      async testMethod() {
        return 'result';
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
    expect(loggerLogSpy).toHaveBeenCalledWith('TestClass.testMethod executed in 1.00min');
  });
});

describe('isConnectionClosedError', () => {
  it.each([
    'Failed to insert batch: QueryFailedError: ConnectionError: Connection is closed.',
    'Connection lost',
    'read ECONNRESET',
    'socket hang up',
  ])('detects closed-connection error: %s', (message) => {
    expect(isConnectionClosedError(new Error(message))).toBe(true);
  });

  it.each([
    'Violation of PRIMARY KEY constraint',
    'Invalid column name',
    'Timeout: Request failed to complete in 15000ms',
  ])('does not treat other errors as closed-connection: %s', (message) => {
    expect(isConnectionClosedError(new Error(message))).toBe(false);
  });

  it('handles non-Error values', () => {
    expect(isConnectionClosedError('Connection is closed')).toBe(true);
    expect(isConnectionClosedError(undefined)).toBe(false);
  });
});

describe('runBatchedInsertWithKeepAlive', () => {
  const entity = { name: 'list_test_table' } as never;
  const organizationDatabase = 'test-org-db';

  const createConnection = () => {
    const connection = { id: 'conn' };
    return {
      getConnection: jest.fn().mockResolvedValue(connection),
      refreshConnection: jest.fn().mockResolvedValue(true),
      invalidateConnection: jest.fn().mockResolvedValue(undefined),
    };
  };

  it('refreshes the cached connection before every batch', async () => {
    const clientStoreConnection = createConnection();
    const insertBatch = jest.fn().mockResolvedValue(undefined);

    await runBatchedInsertWithKeepAlive({
      clientStoreConnection: clientStoreConnection as never,
      organizationDatabase,
      entity,
      batches: [[1], [2], [3]],
      insertBatch,
    });

    expect(clientStoreConnection.refreshConnection).toHaveBeenCalledTimes(3);
    expect(insertBatch).toHaveBeenCalledTimes(3);
    expect(clientStoreConnection.invalidateConnection).not.toHaveBeenCalled();
  });

  it('re-acquires the connection and retries the batch when it is closed', async () => {
    const clientStoreConnection = createConnection();
    const insertBatch = jest
      .fn()
      .mockRejectedValueOnce(new Error('ConnectionError: Connection is closed.'))
      .mockResolvedValue(undefined);

    await runBatchedInsertWithKeepAlive({
      clientStoreConnection: clientStoreConnection as never,
      organizationDatabase,
      entity,
      batches: [[1]],
      insertBatch,
    });

    expect(clientStoreConnection.invalidateConnection).toHaveBeenCalledTimes(1);
    // initial acquire + re-acquire after invalidation
    expect(clientStoreConnection.getConnection).toHaveBeenCalledTimes(2);
    expect(insertBatch).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-connection errors', async () => {
    const clientStoreConnection = createConnection();
    const insertBatch = jest
      .fn()
      .mockRejectedValue(new Error('Violation of PRIMARY KEY constraint'));

    await expect(
      runBatchedInsertWithKeepAlive({
        clientStoreConnection: clientStoreConnection as never,
        organizationDatabase,
        entity,
        batches: [[1]],
        insertBatch,
      })
    ).rejects.toThrow('Violation of PRIMARY KEY constraint');

    expect(clientStoreConnection.invalidateConnection).not.toHaveBeenCalled();
    expect(insertBatch).toHaveBeenCalledTimes(1);
  });

  it('gives up after maxAttempts and rethrows', async () => {
    const clientStoreConnection = createConnection();
    const insertBatch = jest
      .fn()
      .mockRejectedValue(new Error('ConnectionError: Connection is closed.'));

    await expect(
      runBatchedInsertWithKeepAlive({
        clientStoreConnection: clientStoreConnection as never,
        organizationDatabase,
        entity,
        batches: [[1]],
        insertBatch,
        maxAttempts: 2,
      })
    ).rejects.toThrow('Connection is closed');

    expect(insertBatch).toHaveBeenCalledTimes(2);
  });

  it('invokes onBatchComplete after each successful batch', async () => {
    const clientStoreConnection = createConnection();
    const onBatchComplete = jest.fn().mockResolvedValue(undefined);

    await runBatchedInsertWithKeepAlive({
      clientStoreConnection: clientStoreConnection as never,
      organizationDatabase,
      entity,
      batches: [[1], [2]],
      insertBatch: jest.fn().mockResolvedValue(undefined),
      onBatchComplete,
    });

    expect(onBatchComplete).toHaveBeenCalledTimes(2);
  });
});
