/**
 * @jest-environment node
 */

/* eslint-disable global-require */

// Prefix with `mock` so jest.mock hoisting accepts the reference.
let mockNextPool;

const mockFakeRequest = {
  input: jest.fn().mockReturnThis(),
  query: jest.fn().mockResolvedValue({ recordsets: [[{ ok: 1 }]] }),
  execute: jest.fn().mockResolvedValue({ recordsets: [[]] }),
};

jest.mock('mssql', () => ({
  ConnectionPool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockImplementation(async () => mockNextPool),
  })),
  Request: jest.fn().mockImplementation(() => mockFakeRequest),
  Table: jest.fn(),
  NVarChar: jest.fn(() => ({ type: 'nvarchar' })),
  Int: { type: 'int' },
  BigInt: { type: 'bigint' },
  Variant: { type: 'variant' },
  MAX: 'MAX',
}));

jest.mock('sqlite3', () => ({ Database: jest.fn() }));
jest.mock('sqlite', () => ({ open: jest.fn() }));

jest.mock('@wri-monorepos/sql', () => ({
  getQueryStr: jest.fn(() => 'SELECT 1'),
}));

jest.mock('../config', () => ({
  __esModule: true,
  default: {
    SQLConnection: {
      host: 'localhost',
      port: '1433',
      database: 'gfwpro',
      username: 'u',
      password: 'p',
    },
  },
}));

jest.mock('winston', () => {
  const logger = {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  return {
    createLogger: jest.fn(() => logger),
    transports: { Console: jest.fn() },
  };
});

const makeFakePool = () => ({
  close: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
});

// Ensure we're not in 'test' env (which uses sqlite and bypasses mssql pool).
process.env.NODE_ENV = 'qa';
process.env.MSSQL_DATABASE = 'gfwpro';

describe('sql.utils closeAllPools', () => {
  let sqlUtils;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockNextPool = makeFakePool();
    sqlUtils = require('./sql.utils');
  });

  it('is exported', () => {
    expect(typeof sqlUtils.closeAllPools).toBe('function');
  });

  it('is a no-op when no pools are cached', async () => {
    await expect(sqlUtils.closeAllPools()).resolves.toBeUndefined();
  });

  it('closes every cached pool after a query populates the cache', async () => {
    await sqlUtils.executeSystemQuery('SELECT 1', []);
    const firstPool = mockNextPool;
    expect(firstPool.close).not.toHaveBeenCalled();

    await sqlUtils.closeAllPools();
    expect(firstPool.close).toHaveBeenCalledTimes(1);

    mockNextPool = makeFakePool();
    const secondPool = mockNextPool;
    await sqlUtils.executeSystemQuery('SELECT 1', []);
    expect(secondPool.close).not.toHaveBeenCalled();
    await sqlUtils.closeAllPools();
    expect(secondPool.close).toHaveBeenCalledTimes(1);
  });

  it('swallows errors thrown by pool.close() and drains the cache', async () => {
    mockNextPool.close.mockRejectedValueOnce(new Error('close failed'));
    const badPool = mockNextPool;

    await sqlUtils.executeSystemQuery('SELECT 1', []);
    await expect(sqlUtils.closeAllPools()).resolves.toBeUndefined();
    expect(badPool.close).toHaveBeenCalled();

    mockNextPool = makeFakePool();
    const freshPool = mockNextPool;
    await sqlUtils.executeSystemQuery('SELECT 1', []);
    expect(freshPool.close).not.toHaveBeenCalled();
  });
});
