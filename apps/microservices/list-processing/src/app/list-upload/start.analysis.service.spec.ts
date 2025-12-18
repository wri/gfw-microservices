import { Test, TestingModule } from '@nestjs/testing';
import { StartAnalysisService } from './start.analysis.service';
import { S3Service, EmailService } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { RequestLargeListProcess } from '../../models';
import { CommodityService } from '../list/commodity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import sinon from 'sinon';
import { AbstractHandler } from './chain/types';
import { DataSource } from 'typeorm';
import { checkListSizeLimit } from '../common/check.listSizelimit';
import { ListSizeLimitException } from '../common/listSizeLimit.exception';
import { MAX_LOCATIONS_PER_LIST } from '../common/constants';
import { ListTemplate, updateListsAnalysisStatus } from '@wri-monorepos/sql';
import { traceContext } from '@wri-monorepos/shared';
import { ServerConfigType } from '../../validators/server-config';

// Mock ConvertPoint2Polygon to avoid dynamic import requirements
jest.mock('./chain/convert.point.2.polygon', () => {
  const { AbstractHandler } = jest.requireActual('./chain/types');
  return {
    ConvertPoint2Polygon: class extends AbstractHandler<any> {},
  };
});

// Mock the SQLUtils module
jest.mock('@wri-monorepos/sql', () => {
  const originalModule = jest.requireActual('@wri-monorepos/sql');
  const updateRepoMock = jest.fn().mockResolvedValue(undefined);
  const getRepositoryMock = jest.fn().mockReturnValue({ update: updateRepoMock });
  const getConnectionMock = jest.fn().mockResolvedValue({ getRepository: getRepositoryMock });
  const ClientStoreConnection = jest.fn().mockImplementation(() => ({
    getConnection: getConnectionMock,
  }));
  return {
    ...originalModule,
    SQLUtils: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    })),
    upgradeListSchema: jest.fn().mockResolvedValue(undefined),
    updateListsAnalysisStatus: jest.fn().mockResolvedValue(undefined),
    ClientStoreConnection,
    Lists: class Lists {},
    __testSqlMocks: {
      updateRepoMock,
      getRepositoryMock,
      getConnectionMock,
      ClientStoreConnection,
    },
  };
});

jest.mock('../common/check.listSizelimit');

// Mock the fastq module to actually execute the provided worker
jest.mock('fastq', () => {
  return jest.fn().mockImplementation((workerFn: any) => ({
    push: jest.fn().mockImplementation((data: any, callback?: (err: Error | null) => void) => {
      // Execute the worker synchronously so tests can observe side effects immediately
      try {
        workerFn(data, (err?: Error) => (callback ? callback(err || null) : undefined));
      } catch (err) {
        if (callback) {
          callback(err as Error);
        }
      }
      return Promise.resolve();
    }),
    unshift: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    running: jest.fn().mockReturnValue(0),
    idle: jest.fn(),
    length: jest.fn().mockReturnValue(0),
    getQueue: jest.fn(),
    kill: jest.fn(),
    killAndDrain: jest.fn(),
    error: jest.fn(),
    concurrency: 1,
    drain: jest.fn(),
    empty: jest.fn(),
    saturated: jest.fn(),
  }));
});

describe('StartAnalysisService', () => {
  let service: StartAnalysisService;
  let commodityService: CommodityService;
  let sandbox: sinon.SinonSandbox;
  let s3Service: S3Service;
  let emailService: EmailService;
  let configService: ConfigService;
  let listTemplateRepository: unknown;
  let mockDataSource: DataSource;
  let uploadStatusSpy: jest.SpyInstance;
  let runFullChainSpy: jest.SpyInstance;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    (checkListSizeLimit as jest.MockedFunction<typeof checkListSizeLimit>).mockImplementation(
      async (clientDatabase, listId) => {
        // Default test behaviour keeps counts below limit
        if (clientDatabase === 'test-database' && listId === 1) {
          return;
        }
        throw new Error('List exceeds limit');
      }
    );

    // Create chain stubs
    const chainStub = {
      setNext: sandbox.stub().returnsThis(),
      handle: sandbox.stub().resolves({}),
    };

    // Stub all chain components
    sandbox.stub(AbstractHandler.prototype, 'setNext').returns(chainStub);
    sandbox.stub(AbstractHandler.prototype, 'handle').resolves({});
    uploadStatusSpy = jest
      .spyOn(
        AbstractHandler as unknown as { updateListsUploadStatus: any },
        'updateListsUploadStatus'
      )
      .mockResolvedValue(undefined);
    runFullChainSpy = jest
      .spyOn(AbstractHandler as unknown as { runFullChain: any }, 'runFullChain')
      .mockResolvedValue(undefined);

    // Create service stubs
    s3Service = {
      writeS3fileIntoTmp: sandbox.stub().resolves(),
    } as unknown as S3Service;

    emailService = {
      sendEmail: sandbox.stub().resolves(),
    } as unknown as EmailService;

    configService = {
      get: sandbox.stub().returns('test-value'),
    } as unknown as ConfigService;

    commodityService = {
      checkIfListExistAndCommodityIsTheSame: sandbox.stub().resolves(true),
      getCommodityFromExistingList: sandbox.stub().resolves('cocoa'),
    } as unknown as CommodityService;

    // Create mock data source with repository methods
    const mockRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({}),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({}),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    } as unknown as DataSource;

    listTemplateRepository = {
      find: sandbox.stub().resolves([]),
      findOne: sandbox.stub().resolves({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartAnalysisService,
        {
          provide: S3Service,
          useValue: s3Service,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: CommodityService,
          useValue: commodityService,
        },
        {
          provide: getRepositoryToken(ListTemplate, 'default'),
          useValue: listTemplateRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<StartAnalysisService>(StartAnalysisService);
  });

  afterEach(() => {
    sandbox.restore();
    jest.clearAllMocks();
    // Clear any trace context after each test
    // Note: traceContext doesn't have a clear method, but we ensure
    // tests run in clean state by not having active contexts
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when list ID does not exist', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: 999,
      path: 'test-path',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(false);

    await expect(service.run(request)).rejects.toThrow(
      'List not found with id 999 at client store'
    );
  });

  it('should successfully process an existing list', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: 1,
      path: 's3://test-bucket/test-file.csv',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'test-commodity',
    };

    (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

    const result = await service.run(request);

    expect(result).toHaveProperty('executionArn');
    expect(result).toHaveProperty('startDate');
    expect(result.startDate).toBeDefined();
  });

  it('should handle list processing without list_id', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: null,
      path: 'test-path',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    const result = await service.run(request);

    expect(result).toHaveProperty('executionArn');
    expect(result).toHaveProperty('startDate');
    expect(result.startDate).toBeDefined();
  });

  it('should update statuses and not throw when size limit is exceeded', async () => {
    const analysisIds = ['a-1', 'a-2'];
    const request = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: 10,
      path: 's3://bucket/key.csv',
      user_id: 77,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
      analysisIds,
    } as unknown as RequestLargeListProcess;

    (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

    // Simulate the chain throwing a ListSizeLimitException
    runFullChainSpy.mockRejectedValueOnce(new ListSizeLimitException(MAX_LOCATIONS_PER_LIST));

    const result = await service.run(request);
    expect(result).toHaveProperty('startDate');

    // allow worker microtasks to flush
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    // Upload status should be updated
    expect(uploadStatusSpy).toHaveBeenCalled();

    // Analysis status should be updated with provided analysis IDs
    expect(updateListsAnalysisStatus as unknown as jest.Mock).toHaveBeenCalled();
    const calls = (updateListsAnalysisStatus as unknown as jest.Mock).mock.calls;
    const lastArgs = calls[calls.length - 1][1];
    expect(lastArgs.analysisIds).toEqual(analysisIds);
  });

  it('should swallow analysis status update failures when size limit is exceeded', async () => {
    const request = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: 11,
      path: 's3://bucket/key.csv',
      user_id: 77,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
      analysisIds: ['x-1'],
    } as unknown as RequestLargeListProcess;

    (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

    runFullChainSpy.mockRejectedValueOnce(new ListSizeLimitException(MAX_LOCATIONS_PER_LIST));

    // Force analysis status update to fail
    (updateListsAnalysisStatus as unknown as jest.Mock).mockRejectedValueOnce(
      new Error('update failed')
    );

    await expect(service.run(request)).resolves.toBeDefined();
    // allow worker microtasks to flush
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(uploadStatusSpy).toHaveBeenCalled();
  });

  describe('Trace ID preservation', () => {
    it('should preserve trace ID when queuing request', async () => {
      const testTraceId = 'test-trace-id-preservation';
      const request: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 1,
        path: 's3://test-bucket/test-file.csv',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'test-commodity',
      };

      (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

      // Get the queue push mock to inspect what was passed
      const queuePushSpy = jest.spyOn((service as any).queue, 'push');

      // Run within a trace context
      await traceContext.run(testTraceId, async () => {
        await service.run(request);
      });

      // Verify that trace ID was passed to the queue
      expect(queuePushSpy).toHaveBeenCalled();
      const queuedData = queuePushSpy.mock.calls[0][0] as {
        traceId?: string;
        request: RequestLargeListProcess;
        config: ConfigService<ServerConfigType, true>;
        emailService: EmailService;
      };
      expect(queuedData.traceId).toBe(testTraceId);
      expect(queuedData.request).toEqual(request);
    });

    it('should generate new trace ID if none exists when queuing', async () => {
      const request: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 1,
        path: 's3://test-bucket/test-file.csv',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'test-commodity',
      };

      (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

      const queuePushSpy = jest.spyOn((service as any).queue, 'push');
      const generateTraceIdSpy = jest.spyOn(traceContext, 'generateTraceId');

      // Run without trace context
      await service.run(request);

      // Should generate a new trace ID
      expect(generateTraceIdSpy).toHaveBeenCalled();
      expect(queuePushSpy).toHaveBeenCalled();
      const queuedData = queuePushSpy.mock.calls[0][0] as {
        traceId?: string;
        request: RequestLargeListProcess;
        config: ConfigService<ServerConfigType, true>;
        emailService: EmailService;
      };
      expect(queuedData.traceId).toBeDefined();
      expect(queuedData.traceId).not.toBe('');
    });

    it('should maintain correct trace ID in worker for different concurrent requests', async () => {
      // Simulate the bug scenario: two concurrent requests with different trace IDs
      const traceId1 = 'test_multi_upload_1_11_11__08_49';
      const traceId2 = 'test_multi_upload_2_11_11__08_49';

      const request1: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 1,
        path: 's3://test-bucket/test-file-1.csv',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'test-commodity',
      };

      const request2: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 2,
        path: 's3://test-bucket/test-file-2.csv',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'test-commodity',
      };

      (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

      const capturedTraceIds: string[] = [];

      // Mock the worker to capture trace IDs
      const originalPush = (service as any).queue.push;
      (service as any).queue.push = jest.fn((data: any) => {
        // Simulate worker execution with trace context
        return traceContext.run(data.traceId, async () => {
          capturedTraceIds.push(traceContext.getTraceId());
          return originalPush.call((service as any).queue, data);
        });
      });

      // Process both requests concurrently
      await Promise.all([
        traceContext.run(traceId1, async () => {
          await service.run(request1);
        }),
        traceContext.run(traceId2, async () => {
          await service.run(request2);
        }),
      ]);

      // Verify each request maintained its correct trace ID
      expect(capturedTraceIds).toHaveLength(2);
      expect(capturedTraceIds).toContain(traceId1);
      expect(capturedTraceIds).toContain(traceId2);
      expect(capturedTraceIds[0]).not.toBe(capturedTraceIds[1]);
    });

    it('should preserve trace ID through async worker execution', async () => {
      const testTraceId = 'test-trace-id-worker';
      const request: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 1,
        path: 's3://test-bucket/test-file.csv',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'test-commodity',
      };

      (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

      let traceIdInWorker = '';

      // Mock the worker to capture trace ID during execution
      const originalPush = (service as any).queue.push;
      (service as any).queue.push = jest.fn((data: any) => {
        return traceContext.run(data.traceId, async () => {
          // Simulate async work in worker
          await new Promise((resolve) => setTimeout(resolve, 10));
          traceIdInWorker = traceContext.getTraceId();
          return originalPush.call((service as any).queue, data);
        });
      });

      await traceContext.run(testTraceId, async () => {
        await service.run(request);
      });

      // Allow async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify trace ID was preserved in worker
      expect(traceIdInWorker).toBe(testTraceId);
    });
  });
});
