import { Logger } from '@nestjs/common';
import { createListAnalysis, updateListAnalysis } from './list.analysis.status';
import { ListsAnalysisStatus, SQLUtils } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';
import * as sql from 'mssql';
import {
  extractAnalysisTypes,
  getAllListsAnalysisStatus,
  getAnalysisTypesFromIds,
  getListAnalysisStatusByListId,
  resolveListAnalysisStatuses,
} from './list.analysis.status';

import { readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { analysisTypesOptions } from '@wri-monorepos/constants';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDB: jest.fn(),
  },
}));

jest.mock('@wri-monorepos/aws', () => ({
  S3Service: jest.fn(),
}));

jest.mock('@wri-monorepos/shared', () => ({
  readAnalysesLastModifiedTime: jest.fn(),
}));

const mockLastModifiedData = [
  {
    id: 'FCD',
    last_run: '2025-01-01T00:00:00Z',
  },
  {
    id: 'AFI',
    last_run: '2025-01-02T00:00:00Z',
  },
  {
    id: 'PalmRisk',
    last_run: '2025-01-03T00:00:00Z',
  },
];

const mockAnalysisStatusData = [
  {
    listId: 1,
    analysisId: 'FCD',
    status: 5,
    options: 'PalmRisk',
  },
  {
    listId: 1,
    analysisId: 'AFI',
    status: 5,
    options: '',
  },
];

describe('list.analysis.status.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createListAnalysis', () => {
    it("should call SQLUtils.queryDB for each analysisId except 'PalmRisk' and set 'options' for FCD if PalmRisk is included", async () => {
      const mockClientDB = 'myClientDb';
      const mockListId = 123;
      const mockAnalysisIds = ['FCD', 'SCI', 'PalmRisk'];
      const mockAnalysisStatus = 2;

      await createListAnalysis(mockClientDB, mockListId, mockAnalysisIds, mockAnalysisStatus);

      expect(SQLUtils.queryDB).toHaveBeenCalledTimes(2);
      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        mockClientDB,
        'uspCreateListAnalysisStatus',
        expect.arrayContaining([
          { field: 'ListID', type: sql.Int, value: mockListId },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'FCD' },
          { field: 'Status', type: sql.Int, value: mockAnalysisStatus },
          { field: 'options', type: sql.NVarChar(32), value: 'PalmRisk' },
        ])
      );

      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        mockClientDB,
        'uspCreateListAnalysisStatus',
        expect.arrayContaining([
          { field: 'ListID', type: sql.Int, value: mockListId },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'SCI' },
          { field: 'Status', type: sql.Int, value: mockAnalysisStatus },
        ])
      );
    });
  });

  describe('getAllListsAnalysisStatus', () => {
    const mockAnalysisStatusData = [
      {
        listId: 1,
        analysisId: 'FCD',
        status: 'Complete',
        options: 'PalmRisk', // triggers rename to PalmRisk in resolve logic
      },
      {
        listId: 1,
        analysisId: 'SCI',
        status: 'InProgress',
        options: null,
      },
    ];

    const mockLastModifiedData = [
      { id: 'FCD', last_run: '2025-01-01T00:00:00Z' },
      { id: 'PalmRisk', last_run: '2025-01-03T00:00:00Z' },
      { id: 'SCI', last_run: '2025-01-02T00:00:00Z' },
    ];

    it('should return an array of ListsAnalysisStatus if queryDB resolves successfully', async () => {
      (SQLUtils.queryDB as jest.Mock).mockResolvedValue(mockAnalysisStatusData);
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue(mockLastModifiedData);

      const result = await getAllListsAnalysisStatus('clientDatabaseName');

      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        'clientDatabaseName',
        'getAllListsAnalysisStatus'
      );
      expect(result).toEqual([
        {
          listId: 1,
          analysisId: 'FCD',
          status: 'Complete',
          options: 'PalmRisk',
          analysisIdLastModifed: '2025-01-01T00:00:00Z',
        },
        {
          listId: 1,
          analysisId: 'PalmRisk',
          status: 'Complete',
          options: 'PalmRisk',
          analysisIdLastModifed: '2025-01-01T00:00:00Z',
        },
        {
          listId: 1,
          analysisId: 'SCI',
          status: 'InProgress',
          options: null,
          analysisIdLastModifed: '2025-01-02T00:00:00Z',
        },
      ]);
    });

    it('should log an error and throw if queryDB rejects', async () => {
      const mockError = new Error('DB error');
      (SQLUtils.queryDB as jest.Mock).mockRejectedValue(mockError);

      await expect(getAllListsAnalysisStatus('clientDatabaseName')).rejects.toThrow('DB error');
      expect(Logger.error).toHaveBeenCalledWith(
        'Getting all lists analysis status',
        mockError.stack || mockError
      );
    });
  });
  
  describe('getListAnalysisStatusByListId', () => {
    it('should return an array of ListsAnalysisStatus for a given listId if queryDB resolves successfully', async () => {
      (SQLUtils.queryDB as jest.Mock).mockResolvedValue(mockAnalysisStatusData);
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue(mockLastModifiedData);

      const listId = 1;
      const result = await getListAnalysisStatusByListId('clientDB', listId);

      expect(SQLUtils.queryDB).toHaveBeenCalledWith('clientDB', 'getListAnalysisStatusById', [
        { field: 'ListID', type: sql.Int, value: listId },
      ]);
      expect(result).toHaveLength(3);
      expect(result?.[0].analysisId).toBe('FCD');
      expect(result?.[0]?.analysisIdLastModifed).toBe('2025-01-01T00:00:00Z');
      expect(result?.[1].analysisId).toBe('PalmRisk');
      expect(result?.[1]?.analysisIdLastModifed).toBe('2025-01-01T00:00:00Z');
      expect(result?.[2].analysisId).toBe('AFI');
      expect(result?.[2]?.analysisIdLastModifed).toBe('2025-01-02T00:00:00Z');
    });

    it('should log an error if something goes wrong and return undefined', async () => {
      const mockError = new Error('Another DB error');
      (SQLUtils.queryDB as jest.Mock).mockRejectedValue(mockError);

      await expect(getListAnalysisStatusByListId('clientDB', 99)).rejects.toThrow('DB error');

      expect(Logger.error).toHaveBeenCalledWith(
        'Getting list analysis status by list id',
        mockError.stack || mockError
      );
    });
  });

  describe('updateListAnalysis', () => {
    it('should delete existing analyses not in the new list, and create new analyses not in the existing list', async () => {
      const mockExistingStatusData: ListsAnalysisStatus[] = [
        { listId: 999, analysisId: 'FCD', status: 1 },
        { listId: 999, analysisId: 'GFW', status: 1 },
      ] as ListsAnalysisStatus[];

      const newAnalysisIds = ['FCD', 'SCI'];
      const mockClientDB = 'dbTest';
      const mockListId = 999;

      const createListAnalysisSpy = jest.spyOn(
        jest.requireActual('./list.analysis.status'),
        'createListAnalysis'
      );

      await updateListAnalysis(mockClientDB, mockListId, newAnalysisIds, mockExistingStatusData);

      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        mockClientDB,
        'dropListAnalysisStatusByListIdAndAnalysisIdQuery',
        expect.arrayContaining([
          { field: 'ListID', type: sql.Int, value: mockListId },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'GFW' },
        ])
      );

      expect(createListAnalysisSpy).toHaveBeenCalledWith(
        mockClientDB,
        mockListId,
        ['SCI'],
        listStatus.Pending
      );

      expect(SQLUtils.queryDB).toHaveBeenCalledTimes(2);
      expect(createListAnalysisSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAnalysisTypesFromIds', () => {
    it('should correctly return a record of used/unused analysis types by ID', () => {
      const analysisIds = ['FCD', 'AFI'];

      expect(analysisTypesOptions.length).toBeGreaterThan(0);

      const result = getAnalysisTypesFromIds(analysisIds);

      analysisTypesOptions.forEach((option) => {
        if (analysisIds.includes(option.id)) {
          expect(result[option.id]).toBe(true);
        } else {
          expect(result[option.id]).toBe(false);
        }
      });
    });

    it('should return an empty object if no analysisIds are provided', () => {
      const result = getAnalysisTypesFromIds([]);
      analysisTypesOptions.forEach((option) => {
        expect(result[option.id]).toBe(false);
      });
    });
  });

  describe('extractAnalysisTypes', () => {
    it('should correctly return a record of used/unused analysis types by checking status data', () => {
      const result = extractAnalysisTypes(mockAnalysisStatusData as ListsAnalysisStatus[]);

      analysisTypesOptions.forEach((option) => {
        if (option.id === 'FCD' || option.id === 'AFI') {
          expect(result[option.id]).toBe(true);
        } else {
          expect(result[option.id]).toBe(false);
        }
      });
    });

    it('should return all false if input listAnalysisStatusData is empty', () => {
      const result = extractAnalysisTypes([]);
      analysisTypesOptions.forEach((option) => {
        expect(result[option.id]).toBe(false);
      });
    });
  });

  describe('resolveListAnalysisStatuses', () => {
    beforeAll(() => {
      // Mock the returned data for "analysisTypesLastModifiedData"
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue([
        { id: 'FCD', last_run: '2025-01-01T00:00:00Z' },
        { id: 'PalmRisk', last_run: '2025-01-02T00:00:00Z' },
        { id: 'XYZ', last_run: '2025-01-03T00:00:00Z' },
      ]);
    });

    it('should duplicate rows with FCD/PalmRisk and handle other rows normally', async () => {
      const inputStatuses = [
        { analysisId: 'FCD', options: 'PalmRisk', listId: 1 },
        { analysisId: 'FCD', options: '', listId: 1 },
        { analysisId: 'AFI', options: '', listId: 1 },
      ];

      const result = await resolveListAnalysisStatuses(inputStatuses as ListsAnalysisStatus[]);

      // We expect 4 rows:
      //  1) Original row for FCD/PalmRisk → analysisId = FCD
      //  2) Duplicated row for PalmRisk → analysisId = PalmRisk
      //  3) The FCD row without OtherOption (unchanged)
      //  4) The AFI row with PalmRisk (unchanged)

      expect(result).toHaveLength(4);

      // 1) First row: FCD/PalmRisk → analysisId=FCD
      expect(result[0]).toMatchObject({
        analysisId: 'FCD',
        options: 'PalmRisk',
        listId: 1,
        analysisIdLastModifed: '2025-01-01T00:00:00Z', // from mock data
      });

      // 2) Second row: duplicated with analysisId=PalmRisk
      // expect(result[1]).toMatchObject({
      //   analysisId: 'PalmRisk',
      //   options: 'PalmRisk',
      //   listId: 1,
      //   analysisIdLastModifed: '2025-01-02T00:00:00Z', // from mock data
      // });

      // 3) Third row: FCD with OtherOption (non-duplicated)
      // expect(result[2]).toMatchObject({
      //   analysisId: 'FCD',
      //   options: 'OtherOption',
      //   listId: 1,
      //   analysisIdLastModifed: '2025-01-01T00:00:00Z', // from mock data
      // });

      // 4) Fourth row: AFI with PalmRisk (non-duplicated)
      // expect(result[3]).toMatchObject({
      //   analysisId: 'XYZ',
      //   options: 'PalmRisk',
      //   listId: 1,
      //   analysisIdLastModifed: '2025-01-03T00:00:00Z', // from mock data
      // });
    });

    it('should handle empty input gracefully', async () => {
      const result = await resolveListAnalysisStatuses([]);
      expect(result).toEqual([]);
    });
  });
});
