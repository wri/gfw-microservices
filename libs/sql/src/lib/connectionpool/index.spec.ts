/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('mssql');

const mockConfig = {
  user: 'test',
  password: 'test',
  server: 'localhost',
  database: 'testdb',
};

type MssqlMock = {
  ConnectionPool: jest.Mock;
};

const getModules = () => {
  // Re-require both so the index module uses the same mssql mock reference
  const mssql = require('mssql') as MssqlMock;
  const { get } = require('./index') as {
    get: (name: string, config: unknown) => Promise<unknown>;
  };
  return { mssql, get };
};

const createMockPoolInstance = (mssql: MssqlMock, connectBehavior: () => Promise<unknown>) => {
  const pool: Record<string, unknown> = {
    close: jest.fn().mockResolvedValue(undefined),
  };
  pool.connect = jest.fn().mockImplementation(() => connectBehavior().then(() => pool));
  mssql.ConnectionPool.mockImplementation(() => pool);
  return pool;
};

describe('connectionpool get()', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should connect successfully on the first attempt', async () => {
    const { mssql, get } = getModules();
    createMockPoolInstance(mssql, () => Promise.resolve());

    const result = await get('test-pool', mockConfig);
    expect(result).toBeDefined();
    expect(mssql.ConnectionPool).toHaveBeenCalledTimes(1);
  });

  it('should retry on transient failure and succeed', async () => {
    const { mssql, get } = getModules();
    let callCount = 0;
    mssql.ConnectionPool.mockImplementation(() => {
      callCount++;
      const pool: Record<string, unknown> = {
        close: jest.fn().mockResolvedValue(undefined),
      };
      pool.connect = jest.fn().mockImplementation(() => {
        if (callCount < 2) {
          return Promise.reject(new Error('Transient failure'));
        }
        return Promise.resolve(pool);
      });
      return pool;
    });

    jest.useFakeTimers();
    const promise = get('retry-pool', mockConfig);
    await jest.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(result).toBeDefined();
    expect(mssql.ConnectionPool).toHaveBeenCalledTimes(2);
  });

  it('should share one in-flight connection for concurrent callers', async () => {
    const { mssql, get } = getModules();
    let resolveConnect: () => void;
    const connectPromise = new Promise<void>((resolve) => {
      resolveConnect = resolve;
    });
    const pool: Record<string, unknown> = {
      close: jest.fn().mockResolvedValue(undefined),
    };
    pool.connect = jest.fn().mockImplementation(() => connectPromise.then(() => pool));
    mssql.ConnectionPool.mockImplementation(() => pool);

    const firstResult = get('concurrent-pool', mockConfig);
    const secondResult = get('concurrent-pool', mockConfig);

    resolveConnect();

    const [firstPool, secondPool] = await Promise.all([firstResult, secondResult]);
    expect(firstPool).toBe(secondPool);
    expect(mssql.ConnectionPool).toHaveBeenCalledTimes(1);
  });

  it('should throw after MAX_RETRIES exhausted', async () => {
    const { mssql, get } = getModules();
    mssql.ConnectionPool.mockImplementation(() => {
      const pool: Record<string, unknown> = {
        close: jest.fn().mockResolvedValue(undefined),
      };
      pool.connect = jest.fn().mockRejectedValue(new Error('Connection refused'));
      return pool;
    });

    jest.useFakeTimers();
    // Catch early to prevent unhandled rejection
    const resultPromise = get('fail-pool', mockConfig).catch((err) => err);
    await jest.advanceTimersByTimeAsync(2000);
    await jest.advanceTimersByTimeAsync(2000);

    const error = await resultPromise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Connection refused');
    expect(mssql.ConnectionPool).toHaveBeenCalledTimes(3);
  });

  it('should close failed connections before retrying', async () => {
    const { mssql, get } = getModules();
    const closeMocks: jest.Mock[] = [];
    let callCount = 0;
    mssql.ConnectionPool.mockImplementation(() => {
      callCount++;
      const closeMock = jest.fn().mockResolvedValue(undefined);
      closeMocks.push(closeMock);
      const pool: Record<string, unknown> = { close: closeMock };
      pool.connect = jest.fn().mockImplementation(() => {
        if (callCount < 2) {
          return Promise.reject(new Error('fail'));
        }
        return Promise.resolve(pool);
      });
      return pool;
    });

    jest.useFakeTimers();
    const promise = get('close-pool', mockConfig);
    await jest.advanceTimersByTimeAsync(2000);
    await promise;

    expect(closeMocks[0]).toHaveBeenCalled();
  });

  it('should handle non-Error thrown values in log', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { mssql, get } = getModules();
    mssql.ConnectionPool.mockImplementation(() => {
      const pool: Record<string, unknown> = {
        close: jest.fn().mockResolvedValue(undefined),
      };
      pool.connect = jest.fn().mockRejectedValue('string error');
      return pool;
    });

    jest.useFakeTimers();
    // Catch early to prevent unhandled rejection
    const resultPromise = get('non-error-pool', mockConfig).catch((err) => err);
    await jest.advanceTimersByTimeAsync(2000);
    await jest.advanceTimersByTimeAsync(2000);

    const error = await resultPromise;
    expect(error).toBe('string error');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('string error'));
    warnSpy.mockRestore();
  });
});
