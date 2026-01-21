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

interface QueryBuilderMock {
  select: MockedFunction<(selection: string, alias?: string) => QueryBuilderMock>;
  addSelect: MockedFunction<(selection: string, alias?: string) => QueryBuilderMock>;
  where: MockedFunction<(condition: unknown, parameters?: unknown) => QueryBuilderMock>;
  andWhere: MockedFunction<(condition: unknown, parameters?: unknown) => QueryBuilderMock>;
  setParameters: MockedFunction<
    (parameters: { ghgAnalysisType: string; ghgChargingStartDate: Date }) => QueryBuilderMock
  >;
  groupBy: MockedFunction<(group: string) => QueryBuilderMock>;
  getRawMany: MockedFunction<() => Promise<RawUsageRow[]>>;
}

type RepositoryMock = { createQueryBuilder: () => QueryBuilderMock };
type ConnectionMock = { getRepository: (entity?: unknown) => RepositoryMock };

const mockGetConnection: MockedFunction<(dbName: string) => Promise<ConnectionMock>> = jest.fn();
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
  where: jest.fn() as unknown as QueryBuilderMock['where'],
  andWhere: jest.fn() as unknown as QueryBuilderMock['andWhere'],
  setParameters: jest.fn() as unknown as QueryBuilderMock['setParameters'],
  groupBy: jest.fn() as unknown as QueryBuilderMock['groupBy'],
  getRawMany: jest.fn() as unknown as QueryBuilderMock['getRawMany'],
};

import { getAccountAnalysisUsageByAnalysisType } from './getAccountAnalysisUsageByAnalysisType';
import { ClientStoreConnection } from '../util';

describe('getAccountAnalysisUsageByAnalysisType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryBuilder.select.mockReset();
    mockQueryBuilder.addSelect.mockReset();
    mockQueryBuilder.where.mockReset();
    mockQueryBuilder.andWhere.mockReset();
    mockQueryBuilder.setParameters.mockReset();
    mockQueryBuilder.groupBy.mockReset();
    mockQueryBuilder.getRawMany.mockReset();

    mockQueryBuilder.select.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.addSelect.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.where.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.andWhere.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.setParameters.mockImplementation(() => mockQueryBuilder);
    mockQueryBuilder.groupBy.mockImplementation(() => mockQueryBuilder);

    mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockGetRepository.mockReturnValue({
      createQueryBuilder: mockCreateQueryBuilder,
    });
    mockGetConnection.mockResolvedValue({
      getRepository: mockGetRepository,
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

    const result = await getAccountAnalysisUsageByAnalysisType({
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      orgDbName: 'org_db',
    });

    expect(ClientStoreConnection).toHaveBeenCalledTimes(1);
    expect(mockGetConnection).toHaveBeenCalledWith('org_db');
    expect(mockCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(mockQueryBuilder.select.mock.calls[0][0]).toContain(
      'CASE WHEN lp.analysisType = :ghgAnalysisType'
    );
    expect(mockQueryBuilder.select.mock.calls[0][1]).toBe('total_area_analyzed');
    expect(mockQueryBuilder.setParameters).toHaveBeenCalledWith({
      ghgAnalysisType: 'GHG',
      ghgChargingStartDate: new Date('2025-11-22T00:00:00.000Z'),
    });
    expect(mockQueryBuilder.getRawMany).toHaveBeenCalledTimes(1);

    // Should return all 5 analysis types in the correct order
    expect(result).toHaveLength(5);
    expect(result).toEqual([
      {
        analysis_type: 'FCD',
        hectares_analyzed: 12.5,
        max_area_analyzed: 7.3,
        lists_analyzed: 2,
        locations_analyzed: 15,
      },
      {
        analysis_type: 'AFI',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'ALERTS',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'ALERTS-BATCH',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'GHG',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 1,
        locations_analyzed: 0,
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

    await getAccountAnalysisUsageByAnalysisType({
      startDate: '2024-12-31',
      endDate: '2025-01-31',
      orgDbName: 'another_db',
    });

    const whereCall = mockQueryBuilder.where.mock.calls[0];
    expect(whereCall[0]).toBe('lp.analysisEndTime >= :startDateTime');
    const whereParams = whereCall[1] as { startDateTime: Date };
    expect(whereParams.startDateTime).toEqual(new Date('2024-12-31T00:00:00.000Z'));

    const secondAndWhere = mockQueryBuilder.andWhere.mock.calls[0];
    expect(secondAndWhere[0]).toBe('lp.analysisEndTime <= :endDateTime');
    const secondAndWhereParams = secondAndWhere[1] as { endDateTime: Date };
    expect(secondAndWhereParams.endDateTime).toEqual(new Date('2025-01-31T23:59:59.997Z'));

    expect(mockQueryBuilder.andWhere.mock.calls[1][0]).toBeInstanceOf(Brackets);

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
      },
      {
        analysis_type: 'AFI',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'ALERTS',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'ALERTS-BATCH',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'GHG',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
    ]);
  });

  it('maintains correct order of analysis types regardless of query results', async () => {
    // Return results in random order
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
    });
    expect(result[1]).toEqual({
      analysis_type: 'AFI',
      hectares_analyzed: 10.0,
      max_area_analyzed: 10.0,
      lists_analyzed: 2,
      locations_analyzed: 5,
    });
    expect(result[3]).toEqual({
      analysis_type: 'ALERTS-BATCH',
      hectares_analyzed: 15.0,
      max_area_analyzed: 15.0,
      lists_analyzed: 3,
      locations_analyzed: 8,
    });
    expect(result[4]).toEqual({
      analysis_type: 'GHG',
      hectares_analyzed: 5.0,
      max_area_analyzed: 5.0,
      lists_analyzed: 1,
      locations_analyzed: 3,
    });
  });

  it('returns all analysis types with zeros when query returns no results', async () => {
    mockQueryBuilder.getRawMany.mockResolvedValue([]);

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
      },
      {
        analysis_type: 'AFI',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'ALERTS',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'ALERTS-BATCH',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
      {
        analysis_type: 'GHG',
        hectares_analyzed: 0,
        max_area_analyzed: 0,
        lists_analyzed: 0,
        locations_analyzed: 0,
      },
    ]);
  });
});
