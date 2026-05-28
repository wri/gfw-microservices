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
import { EmptyDataFileException } from '../common/emptyDataFile.exception';
import { ListTemplate, updateListsAnalysisStatus } from '@wri-monorepos/sql';
import { traceContext } from '@wri-monorepos/shared';
import { ServerConfigType } from '../../validators/server-config';
import { RedisQueueService } from './redis-queue.service';

// Mock ConvertPoint2Polygon to avoid dynamic import requirements
jest.mock('./chain/convert.point.2.polygon', () => {
  const { AbstractHandler } = jest.requireActual('./chain/types');
  return {
    ConvertPoint2Polygon: class extends AbstractHandler<unknown> {},
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

// Mock RedisQueueService to execute worker synchronously for tests
type WorkerFunction = (
  input: {
    request: RequestLargeListProcess;
    config: ConfigService<ServerConfigType, true>;
    emailService: EmailService;
    traceId?: string;
  },
  cb: (error: Error | null) => void
) => void | Promise<void>;

let workerFn: WorkerFunction | null = null;

jest.mock('./redis-queue.service', () => {
  return {
    RedisQueueService: class {
      setWorker = jest.fn().mockImplementation((fn: WorkerFunction) => {
        workerFn = fn;
      });
      setEmailService = jest.fn();
      push = jest
        .fn()
        .mockImplementation(
          async (data: {
            request: RequestLargeListProcess;
            config: ConfigService<ServerConfigType, true>;
            emailService: EmailService;
            traceId?: string;
          }) => {
            // Execute the worker and wait for it to complete
            if (workerFn) {
              // The worker function is async and uses a callback pattern
              // We need to wait for the callback to be invoked
              return new Promise((resolve, reject) => {
                let callbackInvoked = false;

                const callback = (err?: Error) => {
                  callbackInvoked = true;
                  if (err) {
                    reject(err);
                  } else {
                    // Resolve after a microtask to ensure all async operations complete
                    Promise.resolve().then(() => {
                      resolve(undefined);
                    });
                  }
                };

                try {
                  // Call the worker (which is async)
                  const workerPromise = workerFn(data, callback);

                  // The worker is async, so it returns a promise
                  // But the callback is what signals completion
                  // We wait for the callback, but also handle promise rejections
                  if (workerPromise && typeof workerPromise.then === 'function') {
                    workerPromise.catch((err) => {
                      if (!callbackInvoked) {
                        reject(err);
                      }
                    });
                  }
                } catch (err) {
                  if (!callbackInvoked) {
                    reject(err);
                  }
                }
              });
            }
            return Promise.resolve(undefined);
          }
        );
      length = jest.fn().mockResolvedValue(0);
      runningCount = jest.fn().mockReturnValue(0);
      getConcurrency = jest.fn().mockReturnValue(1);
    },
  };
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
  let redisQueueService: RedisQueueService;
  let mockRedisQueueService: {
    setWorker: jest.Mock;
    setEmailService: jest.Mock;
    push: jest.Mock;
    length: jest.Mock;
    runningCount: jest.Mock;
    getConcurrency: jest.Mock;
  };

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
        AbstractHandler as unknown as {
          updateListsUploadStatus: (
            chainType: unknown,
            status: string,
            errorMessage: string
          ) => Promise<void>;
        },
        'updateListsUploadStatus'
      )
      .mockResolvedValue(undefined);
    runFullChainSpy = jest
      .spyOn(
        AbstractHandler as unknown as {
          runFullChain: (handler: unknown, chainType: unknown) => Promise<unknown>;
        },
        'runFullChain'
      )
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

    // Create mock Redis queue service
    mockRedisQueueService = {
      setWorker: jest.fn().mockImplementation((fn: WorkerFunction) => {
        workerFn = fn;
      }),
      setEmailService: jest.fn(),
      push: jest
        .fn()
        .mockImplementation(
          async (data: {
            request: RequestLargeListProcess;
            config: ConfigService<ServerConfigType, true>;
            emailService: EmailService;
            traceId?: string;
            organizationId?: number;
            userId?: number;
          }) => {
            // Execute the worker and wait for it to complete
            if (workerFn) {
              return new Promise((resolve, reject) => {
                let callbackInvoked = false;

                const callback = (err?: Error) => {
                  callbackInvoked = true;
                  if (err) {
                    reject(err);
                  } else {
                    // Resolve after ensuring all microtasks complete
                    // Use setTimeout instead of setImmediate for better compatibility
                    setTimeout(() => {
                      resolve(undefined);
                    }, 0);
                  }
                };

                try {
                  // Call the worker (which is async)
                  const workerPromise = workerFn(data, callback);

                  // Await the worker promise to ensure all async operations complete
                  // The callback will be called during the worker's execution
                  if (workerPromise && typeof workerPromise.then === 'function') {
                    workerPromise
                      .then(() => {
                        // Give the callback a chance to be invoked if it hasn't been yet
                        if (!callbackInvoked) {
                          // Wait a bit more for the callback
                          setTimeout(() => {
                            if (!callbackInvoked) {
                              // Callback should have been called by now
                              resolve(undefined);
                            }
                          }, 10);
                        }
                      })
                      .catch((err) => {
                        if (!callbackInvoked) {
                          reject(err);
                        }
                      });
                  } else if (!callbackInvoked) {
                    // If no promise, wait a bit for callback
                    setTimeout(() => {
                      if (!callbackInvoked) {
                        resolve(undefined);
                      }
                    }, 10);
                  }
                } catch (err) {
                  if (!callbackInvoked) {
                    reject(err);
                  }
                }
              });
            }
            return Promise.resolve(undefined);
          }
        ),
      length: jest.fn().mockResolvedValue(0),
      runningCount: jest.fn().mockReturnValue(0),
      getConcurrency: jest.fn().mockReturnValue(1),
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
        {
          provide: RedisQueueService,
          useValue: mockRedisQueueService,
        },
      ],
    }).compile();

    service = module.get<StartAnalysisService>(StartAnalysisService);
    redisQueueService = module.get<RedisQueueService>(RedisQueueService);

    // The service constructor calls setWorker, which should set workerFn
    // Verify that setWorker was called
    expect(redisQueueService.setWorker).toHaveBeenCalled();

    // Get the worker function that was set
    const setWorkerCalls = (redisQueueService.setWorker as jest.Mock).mock.calls;
    if (setWorkerCalls.length > 0) {
      workerFn = setWorkerCalls[0][0]; // First argument is the worker function
    }
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

    // Wait for the worker to complete - the push mock should have awaited it
    // But give it a bit more time for all async operations to complete
    await new Promise((r) => setTimeout(r, 100));

    // Verify runFullChain was called (which means worker executed)
    expect(runFullChainSpy).toHaveBeenCalled();

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
    // Wait for the worker to complete
    await new Promise((r) => setTimeout(r, 100));

    // Verify runFullChain was called (which means worker executed)
    expect(runFullChainSpy).toHaveBeenCalled();

    expect(uploadStatusSpy).toHaveBeenCalled();
  });

  it('should update statuses and not throw when empty data file is detected', async () => {
    const analysisIds = ['e-1', 'e-2'];
    const request = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: 12,
      path: 's3://bucket/empty.csv',
      user_id: 77,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
      analysisIds,
    } as unknown as RequestLargeListProcess;

    (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

    // Simulate the chain throwing an EmptyDataFileException
    runFullChainSpy.mockRejectedValueOnce(new EmptyDataFileException());

    await expect(service.run(request)).resolves.toBeDefined();
    await new Promise((r) => setTimeout(r, 100));

    expect(runFullChainSpy).toHaveBeenCalled();
    expect(uploadStatusSpy).toHaveBeenCalledWith(
      expect.anything(),
      'Empty data file',
      expect.stringContaining('Validation errors found in the data')
    );

    expect(updateListsAnalysisStatus as unknown as jest.Mock).toHaveBeenCalled();
    const calls = (updateListsAnalysisStatus as unknown as jest.Mock).mock.calls;
    const lastArgs = calls[calls.length - 1][1];
    expect(lastArgs.analysisIds).toEqual(analysisIds);
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

      // Get the redisQueue push mock to inspect what was passed
      const queuePushSpy = jest.spyOn(redisQueueService, 'push');

      // Run within a trace context
      await traceContext.run(testTraceId, async () => {
        await service.run(request);
      });

      // Verify that trace ID was passed to the queue
      expect(queuePushSpy).toHaveBeenCalled();
      const queuedData = queuePushSpy.mock.calls[0][0] as {
        traceId?: string;
        organizationId?: number;
        userId?: number;
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

      const queuePushSpy = jest.spyOn(redisQueueService, 'push');
      const generateTraceIdSpy = jest.spyOn(traceContext, 'generateTraceId');

      // Run without trace context
      await service.run(request);

      // Should generate a new trace ID
      expect(generateTraceIdSpy).toHaveBeenCalled();
      expect(queuePushSpy).toHaveBeenCalled();
      const queuedData = queuePushSpy.mock.calls[0][0] as {
        traceId?: string;
        organizationId?: number;
        userId?: number;
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
      const originalPush = (service as any).redisQueue.push;
      (service as any).redisQueue.push = jest.fn((data: any) => {
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
      const originalPush = (service as any).redisQueue.push;
      (service as any).redisQueue.push = jest.fn((data: any) => {
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

    it('should preserve organizationId and userId when queuing request', async () => {
      const testTraceId = 'test-trace-id-org-user';
      const testOrgId = 123;
      const testUserId = 456;
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

      const queuePushSpy = mockRedisQueueService.push;

      // Run within a trace context with organization and user IDs
      await traceContext.run(
        testTraceId,
        async () => {
          await service.run(request);
        },
        testOrgId,
        testUserId
      );

      // Verify that organization ID and user ID were passed to the queue
      expect(queuePushSpy).toHaveBeenCalled();
      const queuedData = queuePushSpy.mock.calls[0][0] as {
        traceId?: string;
        organizationId?: number;
        userId?: number;
        request: RequestLargeListProcess;
        config: ConfigService<ServerConfigType, true>;
        emailService: EmailService;
      };
      expect(queuedData.traceId).toBe(testTraceId);
      expect(queuedData.organizationId).toBe(testOrgId);
      expect(queuedData.userId).toBe(testUserId);
    });

    it('should preserve organizationId and userId in background worker execution', async () => {
      const testTraceId = 'test-trace-id-worker-org-user';
      const testOrgId = 789;
      const testUserId = 101112;
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

      let orgIdInWorker: number | undefined;
      let userIdInWorker: number | undefined;

      // Mock the worker to capture organization and user IDs
      const originalPush = mockRedisQueueService.push;
      mockRedisQueueService.push = jest.fn((data: any) => {
        return traceContext.run(
          data.traceId,
          async () => {
            // Simulate async work in worker
            await new Promise((resolve) => setTimeout(resolve, 10));
            orgIdInWorker = traceContext.getOrganizationId();
            userIdInWorker = traceContext.getUserId();
            return originalPush.call(mockRedisQueueService, data);
          },
          data.organizationId,
          data.userId
        );
      }) as any;

      await traceContext.run(
        testTraceId,
        async () => {
          await service.run(request);
        },
        testOrgId,
        testUserId
      );

      // Allow async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify organization and user IDs were preserved in worker
      expect(orgIdInWorker).toBe(testOrgId);
      expect(userIdInWorker).toBe(testUserId);
    });

    it('should handle missing organizationId and userId gracefully', async () => {
      const testTraceId = 'test-trace-id-no-org-user';
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

      const queuePushSpy = mockRedisQueueService.push;

      // Run without organization and user IDs
      await traceContext.run(testTraceId, async () => {
        await service.run(request);
      });

      // Verify that undefined values are passed (not errors)
      expect(queuePushSpy).toHaveBeenCalled();
      const queuedData = queuePushSpy.mock.calls[0][0] as {
        traceId?: string;
        organizationId?: number;
        userId?: number;
        request: RequestLargeListProcess;
        config: ConfigService<ServerConfigType, true>;
        emailService: EmailService;
      };
      expect(queuedData.traceId).toBe(testTraceId);
      expect(queuedData.organizationId).toBeUndefined();
      expect(queuedData.userId).toBeUndefined();
    });
  });
});
