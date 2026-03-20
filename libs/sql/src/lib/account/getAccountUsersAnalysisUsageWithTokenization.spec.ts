import { expect, describe, it, beforeEach, jest, afterEach } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';

type UsageWithTokenizationRow = {
  user_id: number | string;
  first_name: string;
  last_name: string;
  total_area_analyzed: number | string;
  total_locations_analyzed: number | string;
  total_tokens: number | string;
};

type ConnectionMock = {
  query: MockedFunction<(sql: string, params?: unknown[]) => Promise<UsageWithTokenizationRow[]>>;
};

const mockQuery: MockedFunction<
  (sql: string, params?: unknown[]) => Promise<UsageWithTokenizationRow[]>
> = jest.fn();
const mockGetConnection: MockedFunction<(dbName: string) => Promise<ConnectionMock>> = jest.fn();

jest.mock('../util', () => {
  const actual = jest.requireActual('../util') as Record<string, unknown>;
  return {
    ...actual,
    ClientStoreConnection: jest.fn().mockImplementation(() => ({
      getConnection: mockGetConnection,
    })),
  };
});

import { getAccountUsersAnalysisUsageWithTokenization } from './getAccountUsersAnalysisUsage';
import { ClientStoreConnection } from '../util';

describe('getAccountUsersAnalysisUsageWithTokenization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
    mockQuery.mockResolvedValue([]);
    mockGetConnection.mockResolvedValue({ query: mockQuery });
    process.env = { ...originalEnv, MSSQL_DATABASE: 'gfwpro' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('basic functionality', () => {
    it('calls ClientStoreConnection with the correct org database name', async () => {
      await getAccountUsersAnalysisUsageWithTokenization('clientstore-testOrg', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(ClientStoreConnection).toHaveBeenCalledTimes(1);
      expect(mockGetConnection).toHaveBeenCalledWith('clientstore-testOrg');
    });

    it('executes the SQL query with correct date bound parameters', async () => {
      await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [, params] = mockQuery.mock.calls[0];
      expect(params).toEqual([
        new Date('2025-12-01T00:00:00.000Z'),
        new Date('2025-12-31T23:59:59.997Z'),
      ]);
    });

    it('groups by user and includes the ChargeRate cross-db join in the SQL', async () => {
      await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const [sqlQuery] = mockQuery.mock.calls[0];
      expect(sqlQuery).toContain('ChargeRate');
      expect(sqlQuery).toContain('ListsProcessing');
      expect(sqlQuery).toContain('total_tokens');
      expect(sqlQuery).toContain('GROUP BY lp.user_id, u.first_name, u.last_name');
    });

    it('uses the system database name from MSSQL_DATABASE env var', async () => {
      process.env.MSSQL_DATABASE = 'custom_gfwpro';

      await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const [sqlQuery] = mockQuery.mock.calls[0];
      expect(sqlQuery).toContain('[custom_gfwpro].[dbo].[ChargeRate]');
    });

    it('defaults system database to gfwpro when MSSQL_DATABASE is not set', async () => {
      delete process.env.MSSQL_DATABASE;

      await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const [sqlQuery] = mockQuery.mock.calls[0];
      expect(sqlQuery).toContain('[gfwpro].[dbo].[ChargeRate]');
    });

    it('returns an empty array when the query returns no rows', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result).toEqual([]);
    });
  });

  describe('data mapping', () => {
    it('correctly maps a fully-populated row to the output shape', async () => {
      mockQuery.mockResolvedValue([
        {
          user_id: 42,
          first_name: 'Alice',
          last_name: 'Smith',
          total_area_analyzed: '1500.75',
          total_locations_analyzed: '30',
          total_tokens: '12.5',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        user_id: 42,
        first_name: 'Alice',
        last_name: 'Smith',
        total_area_analyzed: 1500.75,
        total_locations_analyzed: 30,
        total_tokens: 12.5,
      });
    });

    it('maps multiple users independently', async () => {
      mockQuery.mockResolvedValue([
        {
          user_id: 1,
          first_name: 'Alice',
          last_name: 'Smith',
          total_area_analyzed: '500.0',
          total_locations_analyzed: '10',
          total_tokens: '5.0',
        },
        {
          user_id: 2,
          first_name: 'Bob',
          last_name: 'Jones',
          total_area_analyzed: '1000.0',
          total_locations_analyzed: '20',
          total_tokens: '7.5',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(1);
      expect(result[1].user_id).toBe(2);
    });

    it('coerces numeric string values to numbers', async () => {
      mockQuery.mockResolvedValue([
        {
          user_id: '7',
          first_name: 'Jane',
          last_name: 'Doe',
          total_area_analyzed: '250.33',
          total_locations_analyzed: '15',
          total_tokens: '3.2',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0].user_id).toBe(7);
      expect(result[0].total_area_analyzed).toBe(250.33);
      expect(result[0].total_locations_analyzed).toBe(15);
      expect(result[0].total_tokens).toBe(3.2);
    });

    it('returns 0 for numeric fields when SQL returns null/zero (no charge rates matched)', async () => {
      mockQuery.mockResolvedValue([
        {
          user_id: 9,
          first_name: 'No',
          last_name: 'Rates',
          total_area_analyzed: '0',
          total_locations_analyzed: '5',
          total_tokens: '0',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0].total_tokens).toBe(0);
      expect(result[0].total_area_analyzed).toBe(0);
    });

    it('token math: total_tokens aggregates location + list tokens across analysis types', async () => {
      // Simulate DB returning the summed total directly (as the SQL SUM does)
      // 10 locations * 0.5/loc = 5.0 location tokens; list_rate = 2.0; total = 7.0
      mockQuery.mockResolvedValue([
        {
          user_id: 3,
          first_name: 'Token',
          last_name: 'User',
          total_area_analyzed: '100.0',
          total_locations_analyzed: '10',
          total_tokens: '7',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0].total_tokens).toBe(7);
    });
  });
});
