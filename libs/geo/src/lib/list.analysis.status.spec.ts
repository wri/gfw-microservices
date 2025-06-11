import { Logger } from '@nestjs/common';
import {
  extractAnalysisTypes,
  getAllListsAnalysisStatus,
  getAnalysisTypesFromIds,
  getListAnalysisStatusByListId,
  handleCreateAnalysis,
  resolveListAnalysisStatuses,
  setSelectedAnalyses,
  updateListAnalysis,
} from './list.analysis.status';
import * as LAS from './list.analysis.status';
import {
  ClientStoreConnection,
  ListsAnalysisStatus,
  SQLUtils,
  updateListsAnalysisStatus,
  upgradeListSchema,
} from '@wri-monorepos/sql';
import { checkProcessingLimits, readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { analysisTypesOptionsNewNames, listStatus } from '@wri-monorepos/constants';
import * as sql from 'mssql';
import * as LU from '../utils/list.utils';
const getListAnalysisStatus = LU.getListAnalysisStatus;
import axios from 'axios';

jest.mock('axios', () => ({
  post: jest.fn(),
}));

jest.mock('../utils/list.utils', () => ({
  getListAnalysisStatus: jest.fn(),
  setListAnalysisStatus: jest.fn(),
  setListAnalysisStatusByTypes: jest.fn(),
}));

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
    queryDBFirstRow: jest.fn().mockResolvedValue(true),
  },
  ClientStoreConnection: jest.fn(),
  updateListsAnalysisStatus: jest.fn().mockResolvedValue(true),
  upgradeListSchema: jest.fn().mockResolvedValue(true),
}));

jest.mock('@wri-monorepos/aws', () => ({
  S3Service: jest.fn(),
}));

jest.mock('@wri-monorepos/shared', () => ({
  readAnalysesLastModifiedTime: jest.fn(),
  checkProcessingLimits: jest.fn(),
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
    jest.restoreAllMocks();
  });

  describe('getAllListsAnalysisStatus', () => {
    it('should return an array of ListsAnalysisStatus if queryDB resolves successfully', async () => {
      (SQLUtils.queryDB as jest.Mock).mockResolvedValue(mockAnalysisStatusData);
      (readAnalysesLastModifiedTime as jest.Mock).mockResolvedValue(mockLastModifiedData);

      const result = await getAllListsAnalysisStatus('clientDatabaseName');

      expect(SQLUtils.queryDB).toHaveBeenCalledWith('clientDatabaseName', undefined, [
        { field: 'listId', type: sql.Int, value: null },
      ]);
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

  describe('setSelectedAnalyses', () => {
    const fakeClientDatabase = 'mockClientDB';
    const fakeListId = 123;
    const fakeAnalysisIds = ['PalmRisk', 'FCD'];
    const fakeAnalysisStatus = listStatus.Pending;

    it('should call createListAnalysis if no data exists on getListAnalysisStatusByListId', async () => {
      jest.spyOn(LAS, 'getListAnalysisStatusByListId').mockResolvedValueOnce([]);

      const setListAnalysisStatus = jest
        .spyOn(LU, 'setListAnalysisStatus')
        .mockResolvedValueOnce(undefined);

      const updateListAnalysisSpy = jest
        .spyOn(jest.requireActual('./list.analysis.status'), 'updateListAnalysis')
        .mockResolvedValueOnce(undefined);

      await setSelectedAnalyses(
        fakeClientDatabase,
        fakeListId,
        fakeAnalysisIds,
        fakeAnalysisStatus
      );

      expect(getListAnalysisStatusByListId).toHaveBeenCalledWith(fakeClientDatabase, fakeListId);
      expect(setListAnalysisStatus).toHaveBeenCalledWith(
        fakeClientDatabase,
        fakeListId,
        fakeAnalysisIds,
        fakeAnalysisStatus
      );
      expect(updateListAnalysisSpy).not.toHaveBeenCalled();
    });
    it('should call updateListAnalysis if data exists on getListAnalysisStatusByListId', async () => {
      const mockExistingStatusData = [
        { analysisId: 'PalmRisk', status: listStatus.Pending /* or some numeric value */ },
        { analysisId: 'FCD', status: listStatus.Pending },
      ];

      jest
        .spyOn(jest.requireActual('./list.analysis.status'), 'getListAnalysisStatusByListId')
        .mockResolvedValueOnce(mockExistingStatusData);

      const setListAnalysisStatus = jest
        .spyOn(LU, 'setListAnalysisStatus')
        .mockResolvedValueOnce(undefined);

      const updateListAnalysisSpy = jest
        .spyOn(jest.requireActual('./list.analysis.status'), 'updateListAnalysis')
        .mockResolvedValueOnce(undefined);

      await setSelectedAnalyses(
        fakeClientDatabase,
        fakeListId,
        fakeAnalysisIds,
        fakeAnalysisStatus
      );

      expect(getListAnalysisStatusByListId).toHaveBeenCalledWith(fakeClientDatabase, fakeListId);
      expect(updateListAnalysisSpy).toHaveBeenCalledWith(
        fakeClientDatabase,
        fakeListId,
        fakeAnalysisIds
      );
      expect(setListAnalysisStatus).not.toHaveBeenCalled();
    });
  });

  describe('updateListAnalysis', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('should create analysis IDs in analysisIds but not in analysisStatusData', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;

      const analysisIds = ['PalmRisk', 'FCDOption1'];

      const deleteSpy = jest
        .spyOn(jest.requireActual('./list.analysis.status'), 'deleteListAnalysisStatusBy')
        .mockResolvedValue(undefined);
      const setListAnalysisStatus = jest
        .spyOn(LU, 'setListAnalysisStatus')
        .mockResolvedValue(undefined);

      await updateListAnalysis(fakeClientDatabase, fakeListId, analysisIds);

      // FCDOption1 is not in analysisStatusData, so it should be created
      expect(setListAnalysisStatus).toHaveBeenCalledTimes(1);
      expect(setListAnalysisStatus).toHaveBeenCalledWith(
        fakeClientDatabase,
        fakeListId,
        ['PalmRisk', 'FCDOption1'],
        listStatus.Pending
      );
      // No analysis to delete
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should delete missing IDs and create new IDs in a mixed scenario', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;

      const analysisIds = ['CommonAnalysis', 'NewAnalysis'];
      const setListAnalysisStatus = jest
        .spyOn(LU, 'setListAnalysisStatus')
        .mockResolvedValue(undefined);

      await updateListAnalysis(fakeClientDatabase, fakeListId, analysisIds);

      expect(setListAnalysisStatus).toHaveBeenCalledTimes(1);
      expect(setListAnalysisStatus).toHaveBeenCalledWith(
        fakeClientDatabase,
        fakeListId,
        ['CommonAnalysis', 'NewAnalysis'],
        listStatus.Pending
      );
    });
  });

  describe('getAnalysisTypesFromIds', () => {
    it('should correctly return a record of used/unused analysis types by ID', () => {
      const analysisIds = ['FCD', 'AFI'];

      expect(analysisTypesOptionsNewNames.length).toBeGreaterThan(0);

      const result = getAnalysisTypesFromIds(analysisIds);

      analysisTypesOptionsNewNames.forEach((option) => {
        if (analysisIds.includes(option.id)) {
          expect(result[option.id]).toBe(true);
        } else {
          expect(result[option.id]).toBe(false);
        }
      });
    });

    it('should return an empty object if no analysisIds are provided', () => {
      const result = getAnalysisTypesFromIds([]);
      analysisTypesOptionsNewNames.forEach((option) => {
        expect(result[option.id]).toBe(false);
      });
    });
  });

  describe('extractAnalysisTypes', () => {
    it('should correctly return a record of used/unused analysis types by checking status data', () => {
      const result = extractAnalysisTypes(mockAnalysisStatusData as ListsAnalysisStatus[]);

      analysisTypesOptionsNewNames.forEach((option) => {
        if (option.id === 'FCD' || option.id === 'AFI') {
          expect(result[option.id]).toBe(true);
        } else {
          expect(result[option.id]).toBe(false);
        }
      });
    });

    it('should return all false if input listAnalysisStatusData is empty', () => {
      const result = extractAnalysisTypes([]);
      analysisTypesOptionsNewNames.forEach((option) => {
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
  describe('handleCreateAnalysis', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create analysis correctly', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'FCD',
          status: 5,
          options: 'PalmRisk',
        },
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      (updateListsAnalysisStatus as jest.Mock).mockResolvedValue(true);
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue([true]),
              findOne: jest.fn().mockResolvedValue({ listName: 'test' }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      jest.spyOn(LAS, 'isGHGCommodityValid').mockResolvedValueOnce(true);

      (axios.post as jest.Mock).mockResolvedValue({ statusText: 'Ok' });
      const result = await handleCreateAnalysis(
        fakeAnalysisIds,
        fakeListId,
        123,
        fakeClientDatabase,
        false,
        234,
        99,
        false
      );
      expect(result).toEqual('Ok');
    });

    it('should not create analysis when has only GHG analysis and isGHGCommodityValid check fails', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue([true]),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      jest
        .spyOn(LAS, 'isGHGCommodityValid')
        .mockRejectedValue(new Error('GHG commodity not valid'));

      await expect(
        handleCreateAnalysis(
          fakeAnalysisIds,
          fakeListId,
          123,
          fakeClientDatabase,
          false,
          234,
          99,
          false
        )
      ).rejects.toBeInstanceOf(Error);
    });

    it('should not create analysis when has only GHG analysis and isGHGCommodityValid check fails', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
        {
          listId: 1,
          analysisId: 'FCD',
          status: 5,
          options: '',
        },
      ]);
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue([true]),
              findOne: jest.fn().mockResolvedValue({ listName: 'test' }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      jest
        .spyOn(LAS, 'isGHGCommodityValid')
        .mockRejectedValue(new Error('GHG commodity not valid'));

      (axios.post as jest.Mock).mockResolvedValueOnce({ statusText: 'Ok' });
      const result = await handleCreateAnalysis(
        fakeAnalysisIds,
        fakeListId,
        123,
        fakeClientDatabase,
        false,
        234,
        99,
        false
      );
      expect(result).toEqual('Ok');
    });

    it('should throw error "Missing Yield Values" when has only GHG analysis and commodity is defined as non MapSpam Commodity  but has no yield for all locations', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      const fakeLocation = [
        {
          locationName: 'fake_location_1',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 1,
          attributes:
            '{"analysisArea":"314.1592653589793","analysisRadius":"1","country":"Brazil","latitude":"-8.9001","locationClassification":"Property","locationName":"Brazil1","longitude":"-67","state":"Amazonas","subState":"Lábrea"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_2',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 2,
          attributes:
            '{"analysisArea":"1","analysisRadius":"0.05641895835477563","country":"Brazil","latitude":"-8.7001","locationClassification":"Property","locationName":"brazil2","longitude":"-66.8","state":"Amazonas","subState":"Lábrea"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_3',
          commodity: 'GFWP_fake_commodity',
          gadmid: 'ARG.21.19',
          locationId: 3,
          attributes:
            '{"analysisArea":"1727.5696541906611","analysisRadius":"2.345","country":"Argentina","latitude":"-29.8001","locationClassification":"Property","locationName":"arg3 landmark","longitude":"-60.2","state":"Santa Fe","subState":"Vera"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_4',
          commodity: 'GFWP_fake_commodity',
          country: 'Argentina',
          state: 'Tucumán',
          subState: 'Monteros',
          gadmid: 'ARG.24.11',
          locationId: 4,
          attributes:
            '{"analysisArea":"3.14159","analysisRadius":"0.09999995776679782","country":"Argentina","latitude":"-27.0401","locationClassification":"Property","locationName":"arg4 wdpa","longitude":"-65.85","state":"Tucumán","subState":"Monteros"}',
          errorDetails: null,
        },
      ];
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue(fakeLocation),
              findOne: jest.fn().mockResolvedValue({
                listName: 'test',
                Commodity: 'GFWP_fake_commodity',
                version: 2,
              }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      (axios.post as jest.Mock).mockResolvedValue({ statusText: 'Ok' });
      expect(
        handleCreateAnalysis(
          fakeAnalysisIds,
          fakeListId,
          123,
          fakeClientDatabase,
          false,
          234,
          99,
          false
        )
      ).rejects.toThrow('Missing Yield Values');
    });

    it('should throw error "Missing Yield Values" when has only GHG analysis and commodity is defined as non MapSpam Commodity but some locations has no yield', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      const fakeLocation = [
        {
          locationName: 'fake_location_1',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 1,
          attributes:
            '{"analysisArea":"314.1592653589793","analysisRadius":"1","country":"Brazil","latitude":"-8.9001","locationClassification":"Property","locationName":"Brazil1","longitude":"-67","state":"Amazonas","subState":"Lábrea","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_2',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 2,
          attributes:
            '{"analysisArea":"1","analysisRadius":"0.05641895835477563","country":"Brazil","latitude":"-8.7001","locationClassification":"Property","locationName":"brazil2","longitude":"-66.8","state":"Amazonas","subState":"Lábrea"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_3',
          commodity: 'GFWP_fake_commodity',
          gadmid: 'ARG.21.19',
          locationId: 3,
          attributes:
            '{"analysisArea":"1727.5696541906611","analysisRadius":"2.345","country":"Argentina","latitude":"-29.8001","locationClassification":"Property","locationName":"arg3 landmark","longitude":"-60.2","state":"Santa Fe","subState":"Vera","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_4',
          commodity: 'GFWP_fake_commodity',
          country: 'Argentina',
          state: 'Tucumán',
          subState: 'Monteros',
          gadmid: 'ARG.24.11',
          locationId: 4,
          attributes:
            '{"analysisArea":"3.14159","analysisRadius":"0.09999995776679782","country":"Argentina","latitude":"-27.0401","locationClassification":"Property","locationName":"arg4 wdpa","longitude":"-65.85","state":"Tucumán","subState":"Monteros","yield":"10"}',
          errorDetails: null,
        },
      ];
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue(fakeLocation),
              findOne: jest.fn().mockResolvedValue({
                listName: 'test',
                Commodity: 'GFWP_fake_commodity',
                version: 2,
              }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      (axios.post as jest.Mock).mockResolvedValue({ statusText: 'Ok' });
      expect(
        handleCreateAnalysis(
          fakeAnalysisIds,
          fakeListId,
          123,
          fakeClientDatabase,
          false,
          234,
          99,
          false
        )
      ).rejects.toThrow('Missing Yield Values');
    });

    it('should throw error "Non-numeric yield values" when has only GHG analysis and commodity is defined as non MapSpam Commodity but has non-numeric value for some locations', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      const fakeLocation = [
        {
          locationName: 'fake_location_1',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 1,
          attributes:
            '{"analysisArea":"314.1592653589793","analysisRadius":"1","country":"Brazil","latitude":"-8.9001","locationClassification":"Property","locationName":"Brazil1","longitude":"-67","state":"Amazonas","subState":"Lábrea","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_2',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 2,
          attributes:
            '{"analysisArea":"1","analysisRadius":"0.05641895835477563","country":"Brazil","latitude":"-8.7001","locationClassification":"Property","locationName":"brazil2","longitude":"-66.8","state":"Amazonas","subState":"Lábrea","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_3',
          commodity: 'GFWP_fake_commodity',
          gadmid: 'ARG.21.19',
          locationId: 3,
          attributes:
            '{"analysisArea":"1727.5696541906611","analysisRadius":"2.345","country":"Argentina","latitude":"-29.8001","locationClassification":"Property","locationName":"arg3 landmark","longitude":"-60.2","state":"Santa Fe","subState":"Vera","yield":"vera"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_4',
          commodity: 'GFWP_fake_commodity',
          country: 'Argentina',
          state: 'Tucumán',
          subState: 'Monteros',
          gadmid: 'ARG.24.11',
          locationId: 4,
          attributes:
            '{"analysisArea":"3.14159","analysisRadius":"0.09999995776679782","country":"Argentina","latitude":"-27.0401","locationClassification":"Property","locationName":"arg4 wdpa","longitude":"-65.85","state":"Tucumán","subState":"Monteros","yield":"10"}',
          errorDetails: null,
        },
      ];
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue(fakeLocation),
              findOne: jest.fn().mockResolvedValue({
                listName: 'test',
                Commodity: 'GFWP_fake_commodity',
                version: 2,
              }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      (axios.post as jest.Mock).mockResolvedValue({ statusText: 'Ok' });
      expect(
        handleCreateAnalysis(
          fakeAnalysisIds,
          fakeListId,
          123,
          fakeClientDatabase,
          false,
          234,
          99,
          false
        )
      ).rejects.toThrow('Non-numeric yield values');
    });
    it('should throw error "Non-numeric yield values" when has only GHG analysis and commodity is defined as Other but has non-numeric value for some locations', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      const fakeLocation = [
        {
          locationName: 'fake_location_1',
          commodity: 'Other',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 1,
          attributes:
            '{"analysisArea":"314.1592653589793","analysisRadius":"1","country":"Brazil","latitude":"-8.9001","locationClassification":"Property","locationName":"Brazil1","longitude":"-67","state":"Amazonas","subState":"Lábrea","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_2',
          commodity: 'Other',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 2,
          attributes:
            '{"analysisArea":"1","analysisRadius":"0.05641895835477563","country":"Brazil","latitude":"-8.7001","locationClassification":"Property","locationName":"brazil2","longitude":"-66.8","state":"Amazonas","subState":"Lábrea","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_3',
          commodity: 'Other',
          gadmid: 'ARG.21.19',
          locationId: 3,
          attributes:
            '{"analysisArea":"1727.5696541906611","analysisRadius":"2.345","country":"Argentina","latitude":"-29.8001","locationClassification":"Property","locationName":"arg3 landmark","longitude":"-60.2","state":"Santa Fe","subState":"Vera","yield":"vera"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_4',
          commodity: 'Other',
          country: 'Argentina',
          state: 'Tucumán',
          subState: 'Monteros',
          gadmid: 'ARG.24.11',
          locationId: 4,
          attributes:
            '{"analysisArea":"3.14159","analysisRadius":"0.09999995776679782","country":"Argentina","latitude":"-27.0401","locationClassification":"Property","locationName":"arg4 wdpa","longitude":"-65.85","state":"Tucumán","subState":"Monteros","yield":"10"}',
          errorDetails: null,
        },
      ];
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue(fakeLocation),
              findOne: jest.fn().mockResolvedValue({
                listName: 'test',
                Commodity: 'Other',
                version: 2,
              }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      (axios.post as jest.Mock).mockResolvedValue({ statusText: 'Ok' });
      expect(
        handleCreateAnalysis(
          fakeAnalysisIds,
          fakeListId,
          123,
          fakeClientDatabase,
          false,
          234,
          99,
          false
        )
      ).rejects.toThrow('Non-numeric yield values');
    });
    it('should create analysis when has only GHG analysis and commodity is defined as non MapSpam Commodity  and has yield for all locations', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      const fakeLocation = [
        {
          locationName: 'fake_location_1',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 1,
          attributes:
            '{"analysisArea":"314.1592653589793","analysisRadius":"1","country":"Brazil","latitude":"-8.9001","locationClassification":"Property","locationName":"Brazil1","longitude":"-67","state":"Amazonas","subState":"Lábrea","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_2',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 2,
          attributes:
            '{"analysisArea":"1","analysisRadius":"0.05641895835477563","country":"Brazil","latitude":"-8.7001","locationClassification":"Property","locationName":"brazil2","longitude":"-66.8","state":"Amazonas","subState":"Lábrea","yield":"10.7"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_3',
          commodity: 'GFWP_fake_commodity',
          gadmid: 'ARG.21.19',
          locationId: 3,
          attributes:
            '{"analysisArea":"1727.5696541906611","analysisRadius":"2.345","country":"Argentina","latitude":"-29.8001","locationClassification":"Property","locationName":"arg3 landmark","longitude":"-60.2","state":"Santa Fe","subState":"Vera","yield":"2.45"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_4',
          commodity: 'GFWP_fake_commodity',
          country: 'Argentina',
          state: 'Tucumán',
          subState: 'Monteros',
          gadmid: 'ARG.24.11',
          locationId: 4,
          attributes:
            '{"analysisArea":"3.14159","analysisRadius":"0.09999995776679782","country":"Argentina","latitude":"-27.0401","locationClassification":"Property","locationName":"arg4 wdpa","longitude":"-65.85","state":"Tucumán","subState":"Monteros","yield":"3.45"}',
          errorDetails: null,
        },
      ];
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue(fakeLocation),
              findOne: jest.fn().mockResolvedValue({
                listName: 'test',
                Commodity: 'GFWP_fake_commodity',
                version: 2,
              }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      (axios.post as jest.Mock).mockResolvedValue({ statusText: 'Ok' });
      const result = await handleCreateAnalysis(
        fakeAnalysisIds,
        fakeListId,
        123,
        fakeClientDatabase,
        false,
        234,
        99,
        false
      );
      expect(result).toEqual('Ok');
    });
    it('should upgrade list version and generate GHG Analysis', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      const fakeLocation = [
        {
          locationName: 'fake_location_1',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 1,
          attributes:
            '{"analysisArea":"314.1592653589793","analysisRadius":"1","country":"Brazil","latitude":"-8.9001","locationClassification":"Property","locationName":"Brazil1","longitude":"-67","state":"Amazonas","subState":"Lábrea","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_2',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 2,
          attributes:
            '{"analysisArea":"1","analysisRadius":"0.05641895835477563","country":"Brazil","latitude":"-8.7001","locationClassification":"Property","locationName":"brazil2","longitude":"-66.8","state":"Amazonas","subState":"Lábrea","yield":"10.7"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_3',
          commodity: 'GFWP_fake_commodity',
          gadmid: 'ARG.21.19',
          locationId: 3,
          attributes:
            '{"analysisArea":"1727.5696541906611","analysisRadius":"2.345","country":"Argentina","latitude":"-29.8001","locationClassification":"Property","locationName":"arg3 landmark","longitude":"-60.2","state":"Santa Fe","subState":"Vera","yield":"2.45"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_4',
          commodity: 'GFWP_fake_commodity',
          country: 'Argentina',
          state: 'Tucumán',
          subState: 'Monteros',
          gadmid: 'ARG.24.11',
          locationId: 4,
          attributes:
            '{"analysisArea":"3.14159","analysisRadius":"0.09999995776679782","country":"Argentina","latitude":"-27.0401","locationClassification":"Property","locationName":"arg4 wdpa","longitude":"-65.85","state":"Tucumán","subState":"Monteros","yield":"3.45"}',
          errorDetails: null,
        },
      ];
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue(fakeLocation),
              findOne: jest.fn().mockResolvedValue({
                listName: 'test',
                Commodity: 'GFWP_fake_commodity',
                version: 1,
              }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      (axios.post as jest.Mock).mockResolvedValue({ statusText: 'Ok' });
      (upgradeListSchema as jest.Mock).mockResolvedValue(true);

      const result = await handleCreateAnalysis(
        fakeAnalysisIds,
        fakeListId,
        123,
        fakeClientDatabase,
        false,
        234,
        99,
        false
      );
      expect(result).toEqual('Ok');
    });
    it('should  fail to upgrade list version and throw error', async () => {
      const fakeClientDatabase = 'mockClientDB';
      const fakeListId = 123;
      const fakeAnalysisIds = 'GHG,FCD';

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      (getListAnalysisStatus as jest.Mock).mockResolvedValue([
        {
          listId: 1,
          analysisId: 'GHG',
          status: 5,
          options: '',
        },
      ]);
      const fakeLocation = [
        {
          locationName: 'fake_location_1',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 1,
          attributes:
            '{"analysisArea":"314.1592653589793","analysisRadius":"1","country":"Brazil","latitude":"-8.9001","locationClassification":"Property","locationName":"Brazil1","longitude":"-67","state":"Amazonas","subState":"Lábrea","yield":"10"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_2',
          commodity: 'GFWP_fake_commodity',
          country: 'Brazil',
          state: 'Amazonas',
          subState: 'Lábrea',
          gadmid: 'BRA.4.34',
          locationId: 2,
          attributes:
            '{"analysisArea":"1","analysisRadius":"0.05641895835477563","country":"Brazil","latitude":"-8.7001","locationClassification":"Property","locationName":"brazil2","longitude":"-66.8","state":"Amazonas","subState":"Lábrea","yield":"10.7"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_3',
          commodity: 'GFWP_fake_commodity',
          gadmid: 'ARG.21.19',
          locationId: 3,
          attributes:
            '{"analysisArea":"1727.5696541906611","analysisRadius":"2.345","country":"Argentina","latitude":"-29.8001","locationClassification":"Property","locationName":"arg3 landmark","longitude":"-60.2","state":"Santa Fe","subState":"Vera","yield":"2.45"}',
          errorDetails: null,
        },
        {
          locationName: 'fake_location_4',
          commodity: 'GFWP_fake_commodity',
          country: 'Argentina',
          state: 'Tucumán',
          subState: 'Monteros',
          gadmid: 'ARG.24.11',
          locationId: 4,
          attributes:
            '{"analysisArea":"3.14159","analysisRadius":"0.09999995776679782","country":"Argentina","latitude":"-27.0401","locationClassification":"Property","locationName":"arg4 wdpa","longitude":"-65.85","state":"Tucumán","subState":"Monteros","yield":"3.45"}',
          errorDetails: null,
        },
      ];
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
        return {
          getConnection: jest.fn().mockResolvedValue({
            getRepository: jest.fn().mockReturnValue({
              findBy: jest.fn().mockResolvedValue(fakeLocation),
              findOne: jest.fn().mockResolvedValue({
                listName: 'test',
                Commodity: 'GFWP_fake_commodity',
                version: 1,
              }),
              update: jest.fn(),
              save: jest.fn(),
            }),
          }),
        };
      });

      (axios.post as jest.Mock).mockResolvedValue({ statusText: 'Ok' });
      (upgradeListSchema as jest.Mock).mockRejectedValue(
        new Error('Failed to upgrade list schema')
      );
      expect(
        handleCreateAnalysis(
          fakeAnalysisIds,
          fakeListId,
          123,
          fakeClientDatabase,
          false,
          234,
          99,
          false
        )
      ).rejects.toThrow('Failed to upgrade list schema');
    });
  });
});
