import { expect, describe, it, beforeEach, jest, afterEach } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';

// Mock row type from raw SQL query
type UsageExportRow = {
  Username: string;
  'List ID': number | string;
  'Analysis Types': string;
  Hectares: number | string;
  Locations: number | string;
  'Date/Timestamp': string;
  'UI/API': string;
  'Location Rate': number | string | null;
  'List Rate': number | string | null;
  'Token Usage (Locations)': number | string | null;
  'Token Usage (Lists)': number | string | null;
  'Total Tokens': number | string | null;
  'Effective Rate Date': string | null;
};

type ConnectionMock = {
  query: MockedFunction<(sql: string, params?: unknown[]) => Promise<UsageExportRow[]>>;
};

const mockQuery: MockedFunction<(sql: string, params?: unknown[]) => Promise<UsageExportRow[]>> =
  jest.fn();
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

import { getAccountUsersAnalysisUsageExportWithTokenization } from './getAccountUsersAnalysisUsageExportWithTokenization';
import { ClientStoreConnection } from '../util';

describe('getAccountUsersAnalysisUsageExportWithTokenization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();

    // Default: return empty results
    mockQuery.mockResolvedValue([]);

    mockGetConnection.mockResolvedValue({
      query: mockQuery,
    });

    // Set environment variable for system database
    process.env = { ...originalEnv, MSSQL_DATABASE: 'gfwpro' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('basic functionality', () => {
    it('calls ClientStoreConnection with correct database name', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('clientstore-testOrg', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(ClientStoreConnection).toHaveBeenCalledTimes(1);
      expect(mockGetConnection).toHaveBeenCalledWith('clientstore-testOrg');
    });

    it('executes raw SQL query with correct date parameters', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const queryCall = mockQuery.mock.calls[0];

      // Verify date parameters
      expect(queryCall[1]).toEqual([
        new Date('2025-12-01T00:00:00.000Z'),
        new Date('2025-12-31T23:59:59.997Z'),
      ]);
    });

    it('includes ChargeRate join in SQL query', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const queryCall = mockQuery.mock.calls[0];
      const sqlQuery = queryCall[0] as string;

      expect(sqlQuery).toContain('ChargeRate');
      expect(sqlQuery).toContain('ListsProcessing');
      expect(sqlQuery).toContain('location_rate');
      expect(sqlQuery).toContain('list_rate');
      expect(sqlQuery).toContain('Token Usage (Locations)');
      expect(sqlQuery).toContain('Token Usage (Lists)');
      expect(sqlQuery).toContain('Total Tokens');
      expect(sqlQuery).toContain('Effective Rate Date');
    });

    it('uses system database name from environment variable', async () => {
      process.env.MSSQL_DATABASE = 'custom_gfwpro_db';

      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const queryCall = mockQuery.mock.calls[0];
      const sqlQuery = queryCall[0] as string;

      expect(sqlQuery).toContain('[custom_gfwpro_db].[dbo].[ChargeRate]');
    });

    it('defaults to gfwpro when MSSQL_DATABASE is not set', async () => {
      delete process.env.MSSQL_DATABASE;

      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const queryCall = mockQuery.mock.calls[0];
      const sqlQuery = queryCall[0] as string;

      expect(sqlQuery).toContain('[gfwpro].[dbo].[ChargeRate]');
    });

    it('returns empty array when no results', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result).toEqual([]);
    });
  });

  describe('data mapping', () => {
    it('correctly maps basic usage data from query results', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 123,
          'Analysis Types': 'AFI,FCD',
          Hectares: '1500.50',
          Locations: '25',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '8.0',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '9.0',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        Username: 'user@example.com',
        'List ID': '123',
        'Analysis Types': 'AFI,FCD',
        Hectares: 1500.5,
        Locations: 25,
        'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
        'UI/API': 'UI',
        'Location Rate': 0.32,
        'List Rate': 1.0,
        'Token Usage (Locations)': 8.0,
        'Token Usage (Lists)': 1.0,
        'Total Tokens': 9.0,
        'Effective Rate Date': '24 Nov 2025',
      });
    });

    it('handles null tokenization fields correctly', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 456,
          'Analysis Types': 'FCD',
          Hectares: '500.0',
          Locations: '10',
          'Date/Timestamp': '15 Oct 2025 14:00:00 GMT',
          'UI/API': 'API',
          'Location Rate': null,
          'List Rate': null,
          'Token Usage (Locations)': null,
          'Token Usage (Lists)': null,
          'Total Tokens': null,
          'Effective Rate Date': null,
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-10-01',
        endDate: '2025-10-31',
      });

      expect(result[0]['Location Rate']).toBeNull();
      expect(result[0]['List Rate']).toBeNull();
      expect(result[0]['Token Usage (Locations)']).toBeNull();
      expect(result[0]['Token Usage (Lists)']).toBeNull();
      expect(result[0]['Total Tokens']).toBeNull();
      expect(result[0]['Effective Rate Date']).toBeNull();
    });

    it('handles zero values correctly', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 789,
          'Analysis Types': 'AFI',
          Hectares: '0',
          Locations: '0',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '0',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '1.0',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0].Hectares).toBe(0);
      expect(result[0].Locations).toBe(0);
      expect(result[0]['Token Usage (Locations)']).toBe(0);
      expect(result[0]['Token Usage (Lists)']).toBe(1.0);
      expect(result[0]['Total Tokens']).toBe(1.0);
    });

    it('converts List ID to string', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 999,
          'Analysis Types': 'AFI',
          Hectares: '100',
          Locations: '5',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '1.6',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '2.6',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(typeof result[0]['List ID']).toBe('string');
      expect(result[0]['List ID']).toBe('999');
    });

    it('parses numeric string values correctly', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': '123',
          'Analysis Types': 'GHG',
          Hectares: '1234.5678',
          Locations: '42',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.15',
          'List Rate': '1.00',
          'Token Usage (Locations)': '6.30',
          'Token Usage (Lists)': '1.00',
          'Total Tokens': '7.30',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0].Hectares).toBe(1234.5678);
      expect(result[0].Locations).toBe(42);
      expect(result[0]['Location Rate']).toBe(0.15);
      expect(result[0]['List Rate']).toBe(1.0);
      expect(result[0]['Token Usage (Locations)']).toBe(6.3);
      expect(result[0]['Token Usage (Lists)']).toBe(1.0);
      expect(result[0]['Total Tokens']).toBe(7.3);
    });
  });

  describe('multiple records', () => {
    it('returns multiple records correctly', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user1@example.com',
          'List ID': 100,
          'Analysis Types': 'AFI',
          Hectares: '500',
          Locations: '10',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '3.2',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '4.2',
          'Effective Rate Date': '24 Nov 2025',
        },
        {
          Username: 'user2@example.com',
          'List ID': 200,
          'Analysis Types': 'FCD,ALERTS',
          Hectares: '1000',
          Locations: '20',
          'Date/Timestamp': '02 Dec 2025 14:00:00 GMT',
          'UI/API': 'API',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '6.4',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '7.4',
          'Effective Rate Date': '24 Nov 2025',
        },
        {
          Username: 'user1@example.com',
          'List ID': 300,
          'Analysis Types': 'GHG',
          Hectares: '750',
          Locations: '15',
          'Date/Timestamp': '03 Dec 2025 09:00:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.15',
          'List Rate': '1.0',
          'Token Usage (Locations)': '2.25',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '3.25',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result).toHaveLength(3);
      expect(result[0].Username).toBe('user1@example.com');
      expect(result[1].Username).toBe('user2@example.com');
      expect(result[2].Username).toBe('user1@example.com');
      expect(result[0]['Total Tokens']).toBe(4.2);
      expect(result[1]['Total Tokens']).toBe(7.4);
      expect(result[2]['Total Tokens']).toBe(3.25);
    });

    it('handles mixed records with and without tokenization data', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user1@example.com',
          'List ID': 100,
          'Analysis Types': 'AFI',
          Hectares: '500',
          Locations: '10',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '3.2',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '4.2',
          'Effective Rate Date': '24 Nov 2025',
        },
        {
          Username: 'user2@example.com',
          'List ID': 200,
          'Analysis Types': 'CUSTOM', // No ChargeRate for this type
          Hectares: '300',
          Locations: '5',
          'Date/Timestamp': '15 Oct 2025 14:00:00 GMT',
          'UI/API': 'API',
          'Location Rate': null,
          'List Rate': null,
          'Token Usage (Locations)': null,
          'Token Usage (Lists)': null,
          'Total Tokens': null,
          'Effective Rate Date': null,
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-10-01',
        endDate: '2025-12-31',
      });

      expect(result).toHaveLength(2);

      // First record has tokenization data
      expect(result[0]['Location Rate']).toBe(0.32);
      expect(result[0]['Total Tokens']).toBe(4.2);

      // Second record has no tokenization data
      expect(result[1]['Location Rate']).toBeNull();
      expect(result[1]['Total Tokens']).toBeNull();
    });
  });

  describe('different analysis types', () => {
    it('handles AFI analysis type with correct rates', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 100,
          'Analysis Types': 'AFI',
          Hectares: '1000',
          Locations: '50',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '16.0', // 50 * 0.32
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '17.0',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0]['Location Rate']).toBe(0.32);
      expect(result[0]['Token Usage (Locations)']).toBe(16.0);
    });

    it('handles GHG analysis type with different rates', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 100,
          'Analysis Types': 'GHG',
          Hectares: '500',
          Locations: '20',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.15',
          'List Rate': '1.0',
          'Token Usage (Locations)': '3.0', // 20 * 0.15
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '4.0',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0]['Location Rate']).toBe(0.15);
      expect(result[0]['Token Usage (Locations)']).toBe(3.0);
    });

    it('handles WEEKLY_ALERTS with zero list rate', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 100,
          'Analysis Types': 'WEEKLY_ALERTS',
          Hectares: '200',
          Locations: '100',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.02',
          'List Rate': '0',
          'Token Usage (Locations)': '2.0', // 100 * 0.02
          'Token Usage (Lists)': '0',
          'Total Tokens': '2.0',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0]['Location Rate']).toBe(0.02);
      expect(result[0]['List Rate']).toBe(0);
      expect(result[0]['Token Usage (Lists)']).toBe(0);
      expect(result[0]['Total Tokens']).toBe(2.0);
    });
  });

  describe('date boundary handling', () => {
    it('uses correct start of day for startDate', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-06-15',
        endDate: '2025-06-30',
      });

      const queryCall = mockQuery.mock.calls[0];
      const params = queryCall[1] as Date[];

      expect(params[0]).toEqual(new Date('2025-06-15T00:00:00.000Z'));
    });

    it('uses correct end of day for endDate', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-06-15',
        endDate: '2025-06-30',
      });

      const queryCall = mockQuery.mock.calls[0];
      const params = queryCall[1] as Date[];

      expect(params[1]).toEqual(new Date('2025-06-30T23:59:59.997Z'));
    });
  });

  describe('SQL query structure', () => {
    it('includes all required joins in SQL query', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const queryCall = mockQuery.mock.calls[0];
      const sqlQuery = queryCall[0] as string;

      expect(sqlQuery).toContain('JOIN dbo.Users u ON lp.user_id = u.id');
      expect(sqlQuery).toContain('LEFT JOIN dbo.LargeLists ll ON lp.list_id = ll.list_id');
      expect(sqlQuery).toContain('LEFT JOIN dbo.ExternalUploads eu');
      expect(sqlQuery).toContain('LEFT JOIN [gfwpro].[dbo].[ChargeRate] cr');
    });

    it('includes correlated subquery for finding applicable rate', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const queryCall = mockQuery.mock.calls[0];
      const sqlQuery = queryCall[0] as string;

      expect(sqlQuery).toContain('SELECT MAX(cr2.effective_date)');
      expect(sqlQuery).toContain('WHERE cr2.analysis_type = lp.analysis_type');
      expect(sqlQuery).toContain('cr2.effective_date <= lp.analysis_end_time');
    });

    it('includes user_id NOT NULL filter', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const queryCall = mockQuery.mock.calls[0];
      const sqlQuery = queryCall[0] as string;

      expect(sqlQuery).toContain('lp.user_id IS NOT NULL');
    });

    it('orders results by analysis_start_time DESC', async () => {
      await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      const queryCall = mockQuery.mock.calls[0];
      const sqlQuery = queryCall[0] as string;

      expect(sqlQuery).toContain('ORDER BY lp.analysis_start_time DESC');
    });
  });

  describe('UI/API distinction', () => {
    it('correctly identifies UI usage', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 100,
          'Analysis Types': 'AFI',
          Hectares: '500',
          Locations: '10',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '3.2',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '4.2',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0]['UI/API']).toBe('UI');
    });

    it('correctly identifies API usage', async () => {
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 100,
          'Analysis Types': 'AFI',
          Hectares: '500',
          Locations: '10',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'API',
          'Location Rate': '0.32',
          'List Rate': '1.0',
          'Token Usage (Locations)': '3.2',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '4.2',
          'Effective Rate Date': '24 Nov 2025',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(result[0]['UI/API']).toBe('API');
    });
  });

  describe('rate evolution handling', () => {
    it('applies different rates based on effective date', async () => {
      // This tests that the correlated subquery finds the correct rate
      // based on when the analysis was performed
      mockQuery.mockResolvedValue([
        {
          Username: 'user@example.com',
          'List ID': 100,
          'Analysis Types': 'AFI',
          Hectares: '500',
          Locations: '10',
          'Date/Timestamp': '01 Dec 2025 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.32', // Old rate effective 2025-11-24
          'List Rate': '1.0',
          'Token Usage (Locations)': '3.2',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '4.2',
          'Effective Rate Date': '24 Nov 2025',
        },
        {
          Username: 'user@example.com',
          'List ID': 200,
          'Analysis Types': 'AFI',
          Hectares: '500',
          Locations: '10',
          'Date/Timestamp': '15 Jan 2027 10:30:00 GMT',
          'UI/API': 'UI',
          'Location Rate': '0.16', // New rate effective 2027-01-01
          'List Rate': '1.0',
          'Token Usage (Locations)': '1.6',
          'Token Usage (Lists)': '1.0',
          'Total Tokens': '2.6',
          'Effective Rate Date': '01 Jan 2027',
        },
      ]);

      const result = await getAccountUsersAnalysisUsageExportWithTokenization('org_db', {
        startDate: '2025-11-01',
        endDate: '2027-02-28',
      });

      expect(result).toHaveLength(2);
      expect(result[0]['Location Rate']).toBe(0.32);
      expect(result[0]['Effective Rate Date']).toBe('24 Nov 2025');
      expect(result[1]['Location Rate']).toBe(0.16);
      expect(result[1]['Effective Rate Date']).toBe('01 Jan 2027');
    });
  });
});
