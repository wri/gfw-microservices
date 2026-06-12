import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { SQLUtils } from './sql.utils';

describe('SQLUtils', () => {
  const databaseName = 'clientstore';
  const queryName = 'SELECT 1';

  const spyOnWait = () =>
    jest
      .spyOn(SQLUtils as unknown as { wait: (ms: number) => Promise<void> }, 'wait')
      .mockImplementation(async () => undefined);

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('disconnect resolves when no connection has been initialized', async () => {
    const sqlUtils = new SQLUtils();

    await expect(sqlUtils.disconnect()).resolves.toBeUndefined();
  });

  it('returns query results on the first attempt', async () => {
    const results = [{ id: 1 }];
    const connectSpy = jest.spyOn(SQLUtils.prototype, 'connect').mockResolvedValue(undefined);
    const runRawSingleQuerySpy = jest
      .spyOn(SQLUtils.prototype, 'runRawSingleQuery')
      .mockResolvedValue(results as never);
    const disconnectSpy = jest.spyOn(SQLUtils.prototype, 'disconnect').mockResolvedValue(undefined);
    const waitSpy = spyOnWait();

    await expect(SQLUtils.queryDB(databaseName, queryName)).resolves.toEqual(results);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(runRawSingleQuerySpy).toHaveBeenCalledTimes(1);
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(waitSpy).not.toHaveBeenCalled();
  });

  it('retries once on transient Error failures and then succeeds', async () => {
    const transientError = new Error('Failed to connect to 10.100.43.54:1433 in 25000ms');
    const results = [{ id: 2 }];
    const connectSpy = jest.spyOn(SQLUtils.prototype, 'connect').mockResolvedValue(undefined);
    const runRawSingleQuerySpy = jest
      .spyOn(SQLUtils.prototype, 'runRawSingleQuery')
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce(results as never);
    const disconnectSpy = jest.spyOn(SQLUtils.prototype, 'disconnect').mockResolvedValue(undefined);
    const waitSpy = spyOnWait();

    await expect(SQLUtils.queryDB(databaseName, queryName)).resolves.toEqual(results);

    expect(connectSpy).toHaveBeenCalledTimes(2);
    expect(runRawSingleQuerySpy).toHaveBeenCalledTimes(2);
    expect(disconnectSpy).toHaveBeenCalledTimes(2);
    expect(waitSpy).toHaveBeenCalledTimes(1);
    expect(waitSpy).toHaveBeenCalledWith(250);
  });

  it('retries once on transient string failures and then succeeds', async () => {
    const results = [{ id: 3 }];
    jest.spyOn(SQLUtils.prototype, 'connect').mockResolvedValue(undefined);
    const runRawSingleQuerySpy = jest
      .spyOn(SQLUtils.prototype, 'runRawSingleQuery')
      .mockRejectedValueOnce('ECONNRESET')
      .mockResolvedValueOnce(results as never);
    jest.spyOn(SQLUtils.prototype, 'disconnect').mockResolvedValue(undefined);
    const waitSpy = spyOnWait();

    await expect(SQLUtils.queryDB(databaseName, queryName)).resolves.toEqual(results);

    expect(runRawSingleQuerySpy).toHaveBeenCalledTimes(2);
    expect(waitSpy).toHaveBeenCalledWith(250);
  });

  it('throws after exhausting retries for transient failures', async () => {
    const transientError = new Error('ETIMEDOUT while connecting');
    jest.spyOn(SQLUtils.prototype, 'connect').mockResolvedValue(undefined);
    const runRawSingleQuerySpy = jest
      .spyOn(SQLUtils.prototype, 'runRawSingleQuery')
      .mockRejectedValue(transientError);
    const disconnectSpy = jest.spyOn(SQLUtils.prototype, 'disconnect').mockResolvedValue(undefined);
    const waitSpy = spyOnWait();

    await expect(SQLUtils.queryDB(databaseName, queryName)).rejects.toBe(transientError);

    expect(runRawSingleQuerySpy).toHaveBeenCalledTimes(2);
    expect(disconnectSpy).toHaveBeenCalledTimes(2);
    expect(waitSpy).toHaveBeenCalledTimes(1);
  });

  it('fails immediately for non-retryable errors', async () => {
    const nonRetryableError = new Error('syntax error near FROM');
    const connectSpy = jest.spyOn(SQLUtils.prototype, 'connect').mockResolvedValue(undefined);
    const runRawSingleQuerySpy = jest
      .spyOn(SQLUtils.prototype, 'runRawSingleQuery')
      .mockRejectedValueOnce(nonRetryableError);
    const disconnectSpy = jest.spyOn(SQLUtils.prototype, 'disconnect').mockResolvedValue(undefined);
    const waitSpy = spyOnWait();

    await expect(SQLUtils.queryDB(databaseName, queryName)).rejects.toBe(nonRetryableError);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(runRawSingleQuerySpy).toHaveBeenCalledTimes(1);
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(waitSpy).not.toHaveBeenCalled();
  });
});
