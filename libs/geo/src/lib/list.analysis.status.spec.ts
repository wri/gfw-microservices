import { Logger } from '@nestjs/common';
import {
  extractAnalysisTypes,
  getAllListsAnalysisStatus,
  getAnalysisTypesFromIds,
  getListAnalysisStatusByListId,
  resolveListAnalysisStatuses,
  updateListAnalysis,
} from './list.analysis.status';
import { ListsAnalysisStatus, SQLUtils } from '@wri-monorepos/sql';
import { readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { analysisTypesOptions, listStatus } from '@wri-monorepos/constants';
import * as sql from 'mssql';

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

describe('list.analysis.status.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getAllListsAnalysisStatus', () => {
    it('should return an array of ListsAnalysisStatus if queryDB resolves successfully', async () => {
      (SQLUtils.queryDB as jest.Mock).mockResolvedValue(mockAnalysisStatusData);
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue(mockLastModifiedData);

      const result = await getAllListsAnalysisStatus('clientDatabaseName');

      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        'clientDatabaseName',
        'getAllListsAnalysisStatus'
      );
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            listId: 1,
            analysisId: 'FCD',
            status: 5,
            options: 'PalmRisk',
            analysisIdLastModifed: '2025-01-01T00:00:00Z',
          }),
          expect.objectContaining({
            listId: 1,
            analysisId: 'PalmRisk',
            status: 5,
            options: 'PalmRisk',
            analysisIdLastModifed: '2025-01-01T00:00:00Z',
          }),
          expect.objectContaining({
            listId: 1,
            analysisId: 'AFI',
            status: 5,
            options: '',
            analysisIdLastModifed: '2025-01-02T00:00:00Z',
          }),
        ])
      );
    });

    it('should log an error if something goes wrong and throw an error', async () => {
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

    it('should log an error if something goes wrong and throw an error', async () => {
      const mockError = new Error('DB error');
      (SQLUtils.queryDB as jest.Mock).mockRejectedValue(mockError);

      await expect(getListAnalysisStatusByListId('clientDB', 99)).rejects.toThrow('DB error');

      expect(Logger.error).toHaveBeenCalledWith(
        'Getting list analysis status by list id',
        mockError.stack || mockError
      );
    });
  });

  describe.skip('setSelectedAnalyses', () => {
    it('should call createListAnalysis if no data exists on getListAnalysisStatusByListId', async () => {
      // const mockExistingStatusData = [] as ListsAnalysisStatus[];
      throw new Error('Not Implemented');
    });
    it('should call updateListAnalysis if data exists on getListAnalysisStatusByListId', async () => {
      // const mockExistingStatusData = [] as ListsAnalysisStatus[];
      throw new Error('Not Implemented');
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
        'deleteListAnalysisStatusBy',
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
    const mockAnalysisTypesLastModifiedData = [
      { id: 'FCD', last_run: '2025-01-01T00:00:00Z' },
      { id: 'PalmRisk', last_run: '2025-01-02T00:00:00Z' },
      { id: 'AFI', last_run: '2025-01-03T00:00:00Z' },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return an empty array if no listAnalysisStatuses are provided', async () => {
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue(
        mockAnalysisTypesLastModifiedData
      );

      const result = await resolveListAnalysisStatuses([]);
      expect(result).toEqual([]);
      expect(readAnalysesLastModifiedTime).toHaveBeenCalledTimes(1);
    });

    it('should duplicate rows if analysisId=FCD and options=PalmRisk', async () => {
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue(
        mockAnalysisTypesLastModifiedData
      );

      const input: ListsAnalysisStatus[] = [
        {
          listId: 1,
          analysisId: 'FCD',
          options: 'PalmRisk',
          status: 5,
        } as ListsAnalysisStatus,
      ];

      const result = await resolveListAnalysisStatuses(input);

      // We expect 2 rows:
      // 1) The original FCD row
      // 2) A new PalmRisk row
      expect(result).toHaveLength(2);

      // FCD row
      expect(result[0]).toMatchObject({
        listId: 1,
        analysisId: 'FCD',
        options: 'PalmRisk',
        status: 5,
        // The code uses the *original* analysisId (FCD) to look up the lastModified, so it
        // sets the same timestamp for both entries.
        analysisIdLastModifed: '2025-01-01T00:00:00Z',
      });

      // PalmRisk row
      expect(result[1]).toMatchObject({
        listId: 1,
        analysisId: 'PalmRisk',
        options: 'PalmRisk',
        status: 5,
        // Again, per the current implementation, it’s using the original FCD's last-modified timestamp.
        analysisIdLastModifed: '2025-01-01T00:00:00Z',
      });
    });

    it('should NOT duplicate rows if analysisId=FCD but options != PalmRisk', async () => {
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue(
        mockAnalysisTypesLastModifiedData
      );

      const input: ListsAnalysisStatus[] = [
        {
          listId: 2,
          analysisId: 'FCD',
          options: 'XYZ', // Not "PalmRisk"
          status: 3,
        } as ListsAnalysisStatus,
      ];

      const result = await resolveListAnalysisStatuses(input);
      // Should only yield 1 row, unmodified
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        listId: 2,
        analysisId: 'FCD',
        options: 'XYZ',
        status: 3,
        analysisIdLastModifed: '2025-01-01T00:00:00Z',
      });
    });

    it('should handle regular rows (e.g., AFI) without duplication', async () => {
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue(
        mockAnalysisTypesLastModifiedData
      );

      const input: ListsAnalysisStatus[] = [
        {
          listId: 3,
          analysisId: 'AFI',
          options: '',
          status: 1,
        } as ListsAnalysisStatus,
      ];

      const result = await resolveListAnalysisStatuses(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        listId: 3,
        analysisId: 'AFI',
        options: '',
        status: 1,
        analysisIdLastModifed: '2025-01-03T00:00:00Z', // from mock data for AFI
      });
    });

    it('should set analysisIdLastModifed to undefined if not present in the map', async () => {
      // If "XYZ" doesn't appear in the last-modified data, the code should set `analysisIdLastModifed: undefined`.
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue([
        { id: 'FCD', last_run: '2025-01-01T00:00:00Z' },
      ]);

      const input: ListsAnalysisStatus[] = [
        {
          listId: 100,
          analysisId: 'XYZ',
          options: '',
          status: 0,
        } as ListsAnalysisStatus,
      ];

      const result = await resolveListAnalysisStatuses(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        listId: 100,
        analysisId: 'XYZ',
        analysisIdLastModifed: undefined,
      });
    });

    it('should log an error and rethrow if readAnalysesLastModifiedTime fails', async () => {
      const mockError = new Error('S3 read error');
      (readAnalysesLastModifiedTime as jest.Mock).mockRejectedValue(mockError);

      const input: ListsAnalysisStatus[] = [
        { listId: 99, analysisId: 'FCD' } as ListsAnalysisStatus,
      ];

      await expect(resolveListAnalysisStatuses(input)).rejects.toThrow('S3 read error');

      // Confirm that we log it
      expect(Logger.error).toHaveBeenCalledWith(
        'Error resolving list analysis statuses',
        expect.objectContaining({
          message: 'S3 read error',
          stack: expect.any(String),
          listAnalysisStatuses: input,
        })
      );
    });
  });
});
