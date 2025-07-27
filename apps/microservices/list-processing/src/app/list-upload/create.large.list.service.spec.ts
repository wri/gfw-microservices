import { Test, TestingModule } from '@nestjs/testing';
import { CreateLargeListService } from './create.large.list.service';
import { CreateListResult } from '@wri-monorepos/geo';
import { SQLUtils } from '@wri-monorepos/sql';
import { ConvertCommodityToMapSpamCode } from './chain/convert.commodity.mapspam';
import { ListSchemaName } from './chain/list.schema.name';
import { CreateListLevelData } from './chain/create.list.level.data';
import { CreateLocationSchema } from './chain/create.location.schema';
import { AbstractHandler, ChainType, RequestNewList } from './chain/types';

// Mock the dependencies
jest.mock('@wri-monorepos/sql');
jest.mock('./chain/convert.commodity.mapspam');
jest.mock('./chain/list.schema.name');
jest.mock('./chain/create.list.level.data');
jest.mock('./chain/create.location.schema');

describe('CreateLargeListService', () => {
  let service: CreateLargeListService;
  let mockSQLUtils: jest.Mocked<SQLUtils>;
  let mockConvertCommodityToMapSpamCode: jest.Mocked<Partial<ConvertCommodityToMapSpamCode>>;
  let mockListSchemaName: jest.Mocked<Partial<ListSchemaName>>;
  let mockCreateListLevelData: jest.Mocked<Partial<CreateListLevelData>>;
  let mockCreateLocationSchema: jest.Mocked<Partial<CreateLocationSchema>>;

  beforeEach(async () => {
    // Setup mocks
    mockSQLUtils = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      config: {} as never,
      connection: {} as never,
      databaseName: 'test_db',
      runRawSingleQuery: jest.fn(),
      executeQuery: jest.fn(),
    } as jest.Mocked<SQLUtils>;

    mockConvertCommodityToMapSpamCode = {
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn(),
    } as jest.Mocked<Partial<ConvertCommodityToMapSpamCode>>;

    mockListSchemaName = {
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn(),
    } as jest.Mocked<Partial<ListSchemaName>>;

    mockCreateListLevelData = {
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn(),
      insertListInListTable: jest.fn(),
      addListToAnalysesTable: jest.fn(),
    } as jest.Mocked<Partial<CreateListLevelData>>;

    mockCreateLocationSchema = {
      setNext: jest.fn().mockReturnThis(),
      handle: jest.fn(),
      createListTableInDatabase: jest.fn(),
      createAnalysisTableInDatabase: jest.fn(),
    } as jest.Mocked<Partial<CreateLocationSchema>>;

    // Mock the constructor calls
    (SQLUtils as unknown as jest.Mock).mockImplementation(() => mockSQLUtils);
    (ConvertCommodityToMapSpamCode as unknown as jest.Mock).mockImplementation(
      () => mockConvertCommodityToMapSpamCode
    );
    (ListSchemaName as unknown as jest.Mock).mockImplementation(() => mockListSchemaName);
    (CreateListLevelData as unknown as jest.Mock).mockImplementation(() => mockCreateListLevelData);
    (CreateLocationSchema as unknown as jest.Mock).mockImplementation(
      () => mockCreateLocationSchema
    );

    // Setup chain mocking
    mockConvertCommodityToMapSpamCode.setNext!.mockReturnValue(mockListSchemaName as never);
    mockListSchemaName.setNext!.mockReturnValue(mockCreateListLevelData as never);
    mockCreateListLevelData.setNext!.mockReturnValue(mockCreateLocationSchema as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateLargeListService],
    }).compile();

    service = module.get<CreateLargeListService>(CreateLargeListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    const baseParams = {
      listName: 'Test List',
      userId: 123,
      clientDatabase: 'test_db',
      analysisIds: ['1', '2', '3'],
    };

    const mockChainResult: ChainType = {
      request: {
        list_name: 'Test List',
        organization_database: 'test_db',
        listTable: 'Test List',
        gfwListId: null,
        user_id: 123,
        template_id: 0,
        analysisIds: ['1', '2', '3'],
        commodity: 'Unknown',
        saveAsDraft: false,
        list_id: 456,
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        hasUnanalyzableError: false,
        path: '/test/path',
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    beforeEach(() => {
      // Mock AbstractHandler.runFullChain
      jest.spyOn(AbstractHandler, 'runFullChain').mockResolvedValue(mockChainResult);
    });

    it('should successfully create a large list with default parameters', async () => {
      const result: CreateListResult = await service.run(baseParams);

      expect(mockSQLUtils.connect).toHaveBeenCalledWith('test_db');
      expect(mockSQLUtils.disconnect).toHaveBeenCalled();
      expect(ConvertCommodityToMapSpamCode).toHaveBeenCalled();
      expect(ListSchemaName).toHaveBeenCalled();
      expect(CreateListLevelData).toHaveBeenCalled();
      expect(CreateLocationSchema).toHaveBeenCalledWith(mockSQLUtils);

      expect(mockConvertCommodityToMapSpamCode.setNext!).toHaveBeenCalledWith(mockListSchemaName);
      expect(mockListSchemaName.setNext!).toHaveBeenCalledWith(mockCreateListLevelData);
      expect(mockCreateListLevelData.setNext!).toHaveBeenCalledWith(mockCreateLocationSchema);

      expect(AbstractHandler.runFullChain).toHaveBeenCalledWith(
        mockConvertCommodityToMapSpamCode,
        expect.objectContaining({
          request: expect.objectContaining({
            list_name: 'Test List',
            organization_database: 'test_db',
            listTable: 'Test List',
            gfwListId: null,
            user_id: 123,
            analysisIds: ['1', '2', '3'],
            commodity: 'Unknown',
            saveAsDraft: false,
          }),
          geojson: {
            type: 'FeatureCollection',
            features: [],
          },
        })
      );

      expect(result).toEqual({ list_id: 456 });
    });

    it('should successfully create a large list with all parameters provided', async () => {
      const fullParams = {
        ...baseParams,
        gfwListId: 789,
        commodity: 'Palm Oil',
        saveAsDraft: true,
      };

      const result: CreateListResult = await service.run(fullParams);

      expect(AbstractHandler.runFullChain).toHaveBeenCalledWith(
        mockConvertCommodityToMapSpamCode,
        expect.objectContaining({
          request: expect.objectContaining({
            list_name: 'Test List',
            organization_database: 'test_db',
            listTable: 'Test List',
            gfwListId: 789,
            user_id: 123,
            analysisIds: ['1', '2', '3'],
            commodity: 'Palm Oil',
            saveAsDraft: true,
          }),
        })
      );

      expect(result).toEqual({ list_id: 456 });
    });

    it('should handle null gfwListId explicitly', async () => {
      const paramsWithNullGfwListId = {
        ...baseParams,
        gfwListId: null as number | null,
      };

      await service.run(paramsWithNullGfwListId);

      expect(AbstractHandler.runFullChain).toHaveBeenCalledWith(
        mockConvertCommodityToMapSpamCode,
        expect.objectContaining({
          request: expect.objectContaining({
            gfwListId: null,
          }),
        })
      );
    });

    it('should handle database connection failure', async () => {
      const connectionError = new Error('Database connection failed');
      mockSQLUtils.connect.mockRejectedValue(connectionError);

      await expect(service.run(baseParams)).rejects.toThrow('Database connection failed');

      expect(mockSQLUtils.connect).toHaveBeenCalledWith('test_db');
      expect(AbstractHandler.runFullChain).not.toHaveBeenCalled();
    });

    it('should handle chain execution failure', async () => {
      const chainError = new Error('Chain execution failed');
      jest.spyOn(AbstractHandler, 'runFullChain').mockRejectedValue(chainError);

      await expect(service.run(baseParams)).rejects.toThrow('Chain execution failed');

      expect(mockSQLUtils.connect).toHaveBeenCalledWith('test_db');
      expect(AbstractHandler.runFullChain).toHaveBeenCalled();
      // Note: disconnect is not called when chain execution fails due to service implementation
      expect(mockSQLUtils.disconnect).not.toHaveBeenCalled();
    });

    it('should handle database disconnection failure gracefully', async () => {
      const disconnectError = new Error('Disconnect failed');
      mockSQLUtils.disconnect.mockRejectedValue(disconnectError);

      await expect(service.run(baseParams)).rejects.toThrow('Disconnect failed');

      expect(mockSQLUtils.connect).toHaveBeenCalledWith('test_db');
      expect(AbstractHandler.runFullChain).toHaveBeenCalled();
      expect(mockSQLUtils.disconnect).toHaveBeenCalled();
    });

    it('should return undefined list_id when chain result request is undefined', async () => {
      const mockChainResultWithUndefinedRequest: ChainType = {
        request: undefined as any,
        geojson: {
          type: 'FeatureCollection',
          features: [],
        },
      };

      jest
        .spyOn(AbstractHandler, 'runFullChain')
        .mockResolvedValue(mockChainResultWithUndefinedRequest);

      const result: CreateListResult = await service.run(baseParams);

      expect(result).toEqual({ list_id: undefined });
    });

    it('should return undefined list_id when chain result request lacks list_id', async () => {
      const mockChainResultWithoutListId: ChainType = {
        request: {
          list_name: 'Test List',
          organization_database: 'test_db',
          isExternalAPIProcess: false,
          organization_id: 1,
          subscription_status_id: 1,
          hasUnanalyzableError: false,
          path: '/test/path',
          // list_id is missing
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [],
        },
      };

      jest.spyOn(AbstractHandler, 'runFullChain').mockResolvedValue(mockChainResultWithoutListId);

      const result: CreateListResult = await service.run(baseParams);

      expect(result).toEqual({ list_id: undefined });
    });

    it('should pass correct parameters to CreateLocationSchema constructor', async () => {
      await service.run(baseParams);

      expect(CreateLocationSchema).toHaveBeenCalledWith(mockSQLUtils);
    });

    it('should create correct initial chain type structure', async () => {
      await service.run(baseParams);

      expect(AbstractHandler.runFullChain).toHaveBeenCalledWith(
        mockConvertCommodityToMapSpamCode,
        expect.objectContaining({
          request: expect.objectContaining({
            list_name: 'Test List',
            organization_database: 'test_db',
            listTable: 'Test List',
          }),
          geojson: expect.objectContaining({
            type: 'FeatureCollection',
            features: expect.arrayContaining([]),
          }),
        })
      );
    });
  });
});
