import { Brackets } from 'typeorm';
import { expect, describe, it, beforeEach, jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';

type RawValue = string | number | null | undefined;
type RawUsageRow = {
  total_area_analyzed: RawValue;
  max_area_analyzed: RawValue;
  total_lists_analyzed: RawValue;
  total_locations_analyzed: RawValue;
  analysis_type: string;
};

// Tokenization result type from raw SQL query
type TokenizationRow = {
  analysis_type: string;
  total_area_analyzed: RawValue;
  total_location_tokens: RawValue;
  total_list_tokens: RawValue;
  location_rate: RawValue;
  list_rate: RawValue;
  effective_rate_date: Date | null;
};

interface QueryBuilderMock {
  select: MockedFunction<(selection: string, alias?: string) => QueryBuilderMock>;
  addSelect: MockedFunction<(selection: string, alias?: string) => QueryBuilderMock>;
  leftJoin: MockedFunction<
    (entityOrProperty: string, alias: string, condition?: string) => QueryBuilderMock
  >;
  where: MockedFunction<(condition: unknown, parameters?: unknown) => QueryBuilderMock>;
  andWhere: MockedFunction<(condition: unknown, parameters?: unknown) => QueryBuilderMock>;
  setParameters: MockedFunction<
    (parameters: { ghgAnalysisType: string; ghgChargingStartDate: Date }) => QueryBuilderMock
  >;
  groupBy: MockedFunction<(group: string) => QueryBuilderMock>;
  getRawMany: MockedFunction<() => Promise<(RawUsageRow | TokenizationRow)[]>>;
}

type RepositoryMock = { createQueryBuilder: () => QueryBuilderMock };
type ConnectionMock = {
  getRepository: (entity?: unknown) => RepositoryMock;
  query: MockedFunction<(sql: string, params?: unknown[]) => Promise<TokenizationRow[]>>;
};

const mockQuery: MockedFunction<(sql: string, params?: unknown[]) => Promise<TokenizationRow[]>> =
  jest.fn();
const mockGetConnection: MockedFunction<
  (dbName: string, entities?: unknown) => Promise<ConnectionMock>
> = jest.fn();
const mockGetRepository: MockedFunction<(entity?: unknown) => RepositoryMock> = jest.fn();
const mockCreateQueryBuilder: MockedFunction<() => QueryBuilderMock> = jest.fn();

jest.mock('../util', () => {
  const actual = jest.requireActual('../util') as Record<string, unknown>;
  return {
    ...actual,
    ClientStoreConnection: jest.fn().mockImplementation(() => ({
      getConnection: mockGetConnection,
    })),
  };
});

const mockQueryBuilder: QueryBuilderMock = {
  select: jest.fn() as unknown as QueryBuilderMock['select'],
  addSelect: jest.fn() as unknown as QueryBuilderMock['addSelect'],
  leftJoin: jest.fn() as unknown as QueryBuilderMock['leftJoin'],
  where: jest.fn() as unknown as QueryBuilderMock['where'],
  andWhere: jest.fn() as unknown as QueryBuilderMock['andWhere'],
  setParameters: jest.fn() as unknown as QueryBuilderMock['setParameters'],
  groupBy: jest.fn() as unknown as QueryBuilderMock['groupBy'],
  getRawMany: jest.fn() as unknown as QueryBuilderMock['getRawMany'],
};

import { getAccountAnalysisUsageByAnalysisType } from './getAccountAnalysisUsageByAnalysisType';
import { ClientStoreConnection } from '../util';

// Default tokenization fields for expected results
const defaultTokenFields = {
  location_rate: null,
  list_rate: null,
  total_location_tokens: 0,
  total_list_tokens: 0,
  total_tokens: 0,
  effective_rate_date: null,
};

describe('getAccountAnalysisUsageByAnalysisType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryBuilder.select.mockReset();
    mockQueryBuilder.addSelect.mockReset();
    mockQueryBuilder.leftJoin.mockReset();
    mockQueryBuilder.where.mockReset();
    mockQueryBuilder.andWhere.mockReset();
    mockQueryBuilder.setParameters.mockReset();
    mockQueryBuilder.groupBy.mockReset();
    mockQueryBuilder.getRawMany.mockReset();
    mockQuery.mockReset();

    mockQueryBuilder.select.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.addSelect.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.leftJoin.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.where.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.andWhere.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.setParameters.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.groupBy.mockImplementation(() => mockQueryBuilder);
    // Default: return empty array for getRawMany (can be overridden in tests)
    mockQueryBuilder.getRawMany.mockResolvedValue([]);

    mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockGetRepository.mockReturnValue({
      createQueryBuilder: mockCreateQueryBuilder,
    });

    // Default: return empty tokenization results
    mockQuery.mockResolvedValue([]);

    mockGetConnection.mockResolvedValue({
      getRepository: mockGetRepository,
      query: mockQuery,
    });
  });

  it('returns all analysis types with actual usage data and zeros for missing types', async () => {
    mockQueryBuilder.getRawMany.mockResolvedValue([
      {
        total_area_analyzed: '12.5',
        max_area_analyzed: '7.3',
        total_lists_analyzed: '2',
        total_locations_analyzed: '15',
        analysis_type: 'FCD',
      },
      {
        total_area_analyzed: '0',
        max_area_analyzed: '0',
        total_lists_analyzed: '1',
        total_locations_analyzed: '0',
        analysis_type: 'GHG',
      },
    ]);
    mockQuery.mockResolvedValue([]); // No tokenization data

    const result = await getAccountAnalysisUsageByAnalysisType({
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      orgDbName: 'org_db',
    });

    expect(ClientStoreConnection).toHaveBeenCalledTimes(2); // Once in main function, once in calculateTokenUsage
    expect(mockGetConnection).toHaveBeenCalledWith('org_db');
    expect(mockCreateQueryBuilder).toHaveBeenCalledTimes(1); // Basic query uses query builder; tokenization uses raw SQL
    expect(mockQueryBuilder.select.mock.calls[0][0]).toContain(
      'CASE WHEN lp.analysisType = :ghgAnalysisType'
    );
    expect(mockQueryBuilder.select.mock.calls[0][1]).toBe('total_area_analyzed');
    // Each list should be charged separately, so the count must NOT use DISTINCT
    expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
      'COUNT(lp.listId)',
      'total_lists_analyzed'
    );
    expect(mockQueryBuilder.addSelect).not.toHaveBeenCalledWith(
      'COUNT(DISTINCT lp.listId)',
      'total_lists_analyzed'
    );
    expect(mockQueryBuilder.setParameters).toHaveBeenCalledWith({
      ghgAnalysisType: 'GHG',
      ghgChargingStartDate: new Date('2025-11-22T00:00:00.000Z'),
      alertsBatchAnalysisType: 'ALERTS-BATCH',
      alertsBatchChargingStartDate: new Date('2026-04-18T00:00:00.000Z'),
    });
    expect(mockQueryBuilder.getRawMany).toHaveBeenCalledTimes(1); // Basic query only; tokenization uses connection.query

    // Should return all 5 analysis types in the correct order with tokenization fields
    expect(result).toHaveLength(5);
    expect(result).toEqual([
      {
        analysis_type: 'FCD',
        hectares_analyzed: 12.5,
        max_area_analyzed: 7.3,
        lists_analyzed: 2,
        locations_analyzed: 15,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'AFI',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'ALERTS',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'ALERTS-BATCH',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'GHG',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 1,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
    ]);
  });

  it('filters by date, ensures user attribution, and returns all analysis types with defaults', async () => {
    mockQueryBuilder.getRawMany.mockResolvedValue([
      {
        total_area_analyzed: null,
        max_area_analyzed: undefined,
        total_lists_analyzed: null,
        total_locations_analyzed: undefined,
        analysis_type: 'ALERTS',
      },
    ]);
    mockQuery.mockResolvedValue([]); // No tokenization data

    await getAccountAnalysisUsageByAnalysisType({
      startDate: '2024-12-31',
      endDate: '2025-01-31',
      orgDbName: 'another_db',
    });

    const whereCall = mockQueryBuilder.where.mock.calls[0];
    expect(whereCall[0]).toBe('lp.analysisEndTime >= :startDateTime');
    const whereParams = whereCall[1] as { startDateTime: Date };
    expect(whereParams.startDateTime).toEqual(new Date('2024-12-31T00:00:00.000Z'));

    // First andWhere is 'lp.analysisEndTime <= :endDateTime'
    const firstAndWhere = mockQueryBuilder.andWhere.mock.calls[0];
    expect(firstAndWhere[0]).toBe('lp.analysisEndTime <= :endDateTime');
    const firstAndWhereParams = firstAndWhere[1] as { endDateTime: Date };
    expect(firstAndWhereParams.endDateTime).toEqual(new Date('2025-01-31T23:59:59.997Z'));

    // Second andWhere is the Brackets condition for GHG (user_id filter removed to include ALERTS-BATCH)
    expect(mockQueryBuilder.andWhere.mock.calls[1][0]).toBeInstanceOf(Brackets);

    // Third andWhere is the Brackets condition for ALERTS-BATCH
    expect(mockQueryBuilder.andWhere.mock.calls[2][0]).toBeInstanceOf(Brackets);

    const result = await getAccountAnalysisUsageByAnalysisType({
      startDate: '2024-12-31',
      endDate: '2025-01-31',
      orgDbName: 'another_db',
    });

    // Should return all 5 analysis types, with ALERTS having null/undefined converted to 0
    expect(result).toHaveLength(5);
    expect(result).toEqual([
      {
        analysis_type: 'FCD',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'AFI',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'ALERTS',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'ALERTS-BATCH',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'GHG',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
    ]);
  });

  it('maintains correct order of analysis types regardless of query results', async () => {
    mockQueryBuilder.getRawMany.mockResolvedValue([
      {
        total_area_analyzed: '5.0',
        max_area_analyzed: '5.0',
        total_lists_analyzed: '1',
        total_locations_analyzed: '3',
        analysis_type: 'GHG',
      },
      {
        total_area_analyzed: '10.0',
        max_area_analyzed: '10.0',
        total_lists_analyzed: '2',
        total_locations_analyzed: '5',
        analysis_type: 'AFI',
      },
      {
        total_area_analyzed: '15.0',
        max_area_analyzed: '15.0',
        total_lists_analyzed: '3',
        total_locations_analyzed: '8',
        analysis_type: 'ALERTS-BATCH',
      },
    ]);
    mockQuery.mockResolvedValue([]); // No tokenization data

    const result = await getAccountAnalysisUsageByAnalysisType({
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      orgDbName: 'org_db',
    });

    // Should maintain the defined order: FCD, AFI, ALERTS, ALERTS-BATCH, GHG
    expect(result.map((r) => r.analysis_type)).toEqual([
      'FCD',
      'AFI',
      'ALERTS',
      'ALERTS-BATCH',
      'GHG',
    ]);

    // Verify the values are correctly mapped
    expect(result[0]).toEqual({
      analysis_type: 'FCD',
      hectares_analyzed: 0,
      max_area_analyzed: 0,
      lists_analyzed: 0,
      locations_analyzed: 0,
      ...defaultTokenFields,
    });
    expect(result[1]).toEqual({
      analysis_type: 'AFI',
      hectares_analyzed: 10.0,
      max_area_analyzed: 10.0,
      lists_analyzed: 2,
      locations_analyzed: 5,
      ...defaultTokenFields,
    });
    expect(result[3]).toEqual({
      analysis_type: 'ALERTS-BATCH',
      hectares_analyzed: 15.0,
      max_area_analyzed: 15.0,
      lists_analyzed: 3,
      locations_analyzed: 8,
      ...defaultTokenFields,
    });
    expect(result[4]).toEqual({
      analysis_type: 'GHG',
      hectares_analyzed: 5.0,
      max_area_analyzed: 5.0,
      lists_analyzed: 1,
      locations_analyzed: 3,
      ...defaultTokenFields,
    });
  });

  it('returns all analysis types with zeros when query returns no results', async () => {
    mockQueryBuilder.getRawMany.mockResolvedValue([]);
    mockQuery.mockResolvedValue([]); // No tokenization data

    const result = await getAccountAnalysisUsageByAnalysisType({
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      orgDbName: 'org_db',
    });

    // Should still return all 5 analysis types with zero values
    expect(result).toHaveLength(5);
    expect(result).toEqual([
      {
        analysis_type: 'FCD',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'AFI',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'ALERTS',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'ALERTS-BATCH',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
      {
        analysis_type: 'GHG',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
        ...defaultTokenFields,
      },
    ]);
  });

  // Tokenization tests (GPV-5226)
  describe('tokenization calculations', () => {
    it('includes tokenization data when ChargeRate records exist', async () => {
      const effectiveDate = new Date('2025-11-24T00:00:00.000Z');

      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          total_area_analyzed: '100.0',
          max_area_analyzed: '50.0',
          total_lists_analyzed: '2',
          total_locations_analyzed: '10',
          analysis_type: 'AFI',
        },
      ]);
      mockQuery.mockResolvedValue([
        {
          analysis_type: 'AFI',
          total_area_analyzed: '100.0',
          total_location_tokens: '3.2', // 10 locations * 0.32 rate
          total_list_tokens: '2.0', // 2 lists * 1.0 rate
          location_rate: '0.32',
          list_rate: '1.0',
          effective_rate_date: effectiveDate,
        },
      ]);

      const result = await getAccountAnalysisUsageByAnalysisType({
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        orgDbName: 'org_db',
      });

      const afiResult = result.find((r) => r.analysis_type === 'AFI');
      expect(afiResult).toBeDefined();
      expect(afiResult?.location_rate).toBe(0.32);
      expect(afiResult?.list_rate).toBe(1.0);
      expect(afiResult?.total_location_tokens).toBe(3.2);
      expect(afiResult?.total_list_tokens).toBe(2.0);
      expect(afiResult?.total_tokens).toBe(5.2); // 3.2 + 2.0
      expect(afiResult?.effective_rate_date).toEqual(effectiveDate);
    });

    it('returns 0 token fields when no ChargeRate records exist for analysis type', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          total_area_analyzed: '50.0',
          max_area_analyzed: '25.0',
          total_lists_analyzed: '1',
          total_locations_analyzed: '5',
          analysis_type: 'FCD',
        },
      ]);
      mockQuery.mockResolvedValue([]); // No tokenization data returned

      const result = await getAccountAnalysisUsageByAnalysisType({
        startDate: '2025-10-01', // Before tokenization effective date
        endDate: '2025-10-31',
        orgDbName: 'org_db',
      });

      const fcdResult = result.find((r) => r.analysis_type === 'FCD');
      expect(fcdResult).toBeDefined();
      expect(fcdResult?.location_rate).toBeNull();
      expect(fcdResult?.list_rate).toBeNull();
      expect(fcdResult?.total_location_tokens).toBe(0);
      expect(fcdResult?.total_list_tokens).toBe(0);
      expect(fcdResult?.total_tokens).toBe(0);
      expect(fcdResult?.effective_rate_date).toBeNull();
    });

    it('calculates token usage for multiple analysis types with different rates', async () => {
      const afiEffectiveDate = new Date('2025-11-24T00:00:00.000Z');
      const ghgEffectiveDate = new Date('2025-11-24T00:00:00.000Z');

      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          total_area_analyzed: '100.0',
          max_area_analyzed: '100.0',
          total_lists_analyzed: '1',
          total_locations_analyzed: '10',
          analysis_type: 'AFI',
        },
        {
          total_area_analyzed: '200.0',
          max_area_analyzed: '200.0',
          total_lists_analyzed: '2',
          total_locations_analyzed: '20',
          analysis_type: 'GHG',
        },
      ]);
      mockQuery.mockResolvedValue([
        {
          analysis_type: 'AFI',
          total_area_analyzed: '100.0',
          total_location_tokens: '3.2', // 10 * 0.32
          total_list_tokens: '1.0',
          location_rate: '0.32',
          list_rate: '1.0',
          effective_rate_date: afiEffectiveDate,
        },
        {
          analysis_type: 'GHG',
          total_area_analyzed: '200.0',
          total_location_tokens: '3.0', // 20 * 0.15
          total_list_tokens: '2.0',
          location_rate: '0.15',
          list_rate: '1.0',
          effective_rate_date: ghgEffectiveDate,
        },
      ]);

      const result = await getAccountAnalysisUsageByAnalysisType({
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        orgDbName: 'org_db',
      });

      const afiResult = result.find((r) => r.analysis_type === 'AFI');
      expect(afiResult?.location_rate).toBe(0.32);
      expect(afiResult?.total_tokens).toBe(4.2); // 3.2 + 1.0

      const ghgResult = result.find((r) => r.analysis_type === 'GHG');
      expect(ghgResult?.location_rate).toBe(0.15);
      expect(ghgResult?.total_tokens).toBe(5.0); // 3.0 + 2.0
    });

    it('handles zero locations correctly in token calculations', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          total_area_analyzed: '0',
          max_area_analyzed: '0',
          total_lists_analyzed: '1',
          total_locations_analyzed: '0',
          analysis_type: 'AFI',
        },
      ]);
      mockQuery.mockResolvedValue([
        {
          analysis_type: 'AFI',
          total_area_analyzed: '0',
          total_location_tokens: '0', // 0 locations * rate
          total_list_tokens: '1.0', // still charges list rate
          location_rate: '0.32',
          list_rate: '1.0',
          effective_rate_date: new Date('2025-11-24T00:00:00.000Z'),
        },
      ]);

      const result = await getAccountAnalysisUsageByAnalysisType({
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        orgDbName: 'org_db',
      });

      const afiResult = result.find((r) => r.analysis_type === 'AFI');
      expect(afiResult?.total_location_tokens).toBe(0);
      expect(afiResult?.total_list_tokens).toBe(1.0);
      expect(afiResult?.total_tokens).toBe(1.0);
    });

    it('executes tokenization raw SQL query with correct date parameters', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      mockQuery.mockResolvedValue([]);

      await getAccountAnalysisUsageByAnalysisType({
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        orgDbName: 'test_org_db',
      });

      // Verify raw query was called with date parameters for tokenization
      expect(mockQuery).toHaveBeenCalledTimes(1);
      const queryCall = mockQuery.mock.calls[0];
      expect(queryCall[0]).toContain('ChargeRate');
      expect(queryCall[0]).toContain('ListsProcessing');
      expect(queryCall[1]).toEqual([
        new Date('2025-12-01T00:00:00.000Z'),
        new Date('2025-12-31T23:59:59.997Z'),
      ]);
    });
  });

  // ALERTS-BATCH hectare charging tests (GPV-5336)
  describe('ALERTS-BATCH hectare charging start date (2026-04-18)', () => {
    it('excludes ALERTS-BATCH from WHERE clause before 2026-04-18 via andWhere bracket', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      mockQuery.mockResolvedValue([]);

      await getAccountAnalysisUsageByAnalysisType({
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        orgDbName: 'org_db',
      });

      // Third andWhere (index 2) should be the ALERTS-BATCH bracket
      const alertsBatchBracket = mockQueryBuilder.andWhere.mock.calls[2][0];
      expect(alertsBatchBracket).toBeInstanceOf(Brackets);
    });

    it('passes ALERTS-BATCH charging start date in setParameters', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      mockQuery.mockResolvedValue([]);

      await getAccountAnalysisUsageByAnalysisType({
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        orgDbName: 'org_db',
      });

      expect(mockQueryBuilder.setParameters).toHaveBeenCalledWith(
        expect.objectContaining({
          alertsBatchAnalysisType: 'ALERTS-BATCH',
          alertsBatchChargingStartDate: new Date('2026-04-18T00:00:00.000Z'),
        })
      );
    });

    it('includes ALERTS-BATCH hectares after 2026-04-18 in CASE expression', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          total_area_analyzed: '500.0',
          max_area_analyzed: '500.0',
          total_lists_analyzed: '2',
          total_locations_analyzed: '10',
          analysis_type: 'ALERTS-BATCH',
        },
      ]);
      mockQuery.mockResolvedValue([]);

      const result = await getAccountAnalysisUsageByAnalysisType({
        startDate: '2026-04-18',
        endDate: '2026-04-30',
        orgDbName: 'org_db',
      });

      const alertsBatchResult = result.find((r) => r.analysis_type === 'ALERTS-BATCH');
      expect(alertsBatchResult?.hectares_analyzed).toBe(500);

      // Verify the CASE expression for ALERTS-BATCH is in the SELECT
      expect(mockQueryBuilder.select.mock.calls[0][0]).toContain(
        'lp.analysisType = :alertsBatchAnalysisType'
      );
    });
  });
});
