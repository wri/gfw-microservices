import { Test, TestingModule } from '@nestjs/testing';
import { StartAnalysisService } from './start.analysis.service';
import { EmailService } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { RequestLargeListProcess } from '../../models';
import { CommodityService } from '../commodity/commodity.service';
import { QueueService } from './queue.service';
import sinon from 'sinon';

// Mock the SQLUtils module
jest.mock('@wri-monorepos/sql', () => {
  const originalModule = jest.requireActual('@wri-monorepos/sql');
  return {
    ...originalModule,
    SQLUtils: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    })),
    upgradeListSchema: jest.fn().mockResolvedValue(undefined),
  };
});

describe('StartAnalysisService', () => {
  let service: StartAnalysisService;
  let commodityService: CommodityService;
  let queueService: QueueService;
  let sandbox: sinon.SinonSandbox;
  let emailService: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();

    // Create service stubs
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

    queueService = {
      processRequest: jest.fn().mockResolvedValue(undefined),
      getQueueStats: jest.fn().mockReturnValue({
        size: 0,
        pending: 0,
        running: 0,
      }),
    } as unknown as QueueService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartAnalysisService,
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
          provide: QueueService,
          useValue: queueService,
        },
      ],
    }).compile();

    service = module.get<StartAnalysisService>(StartAnalysisService);
  });

  afterEach(() => {
    sandbox.restore();
    jest.clearAllMocks();
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
      template_type: 'test-type',
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
      list_id: 123,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    (commodityService.checkIfListExistAndCommodityIsTheSame as sinon.SinonStub).resolves(true);

    const result = await service.run(request);

    expect(result).toHaveProperty('executionArn');
    expect(result).toHaveProperty('startDate');
    expect(result.startDate).toBeDefined();
    expect(queueService.processRequest).toHaveBeenCalledWith(request, configService, emailService);
    expect(queueService.getQueueStats).toHaveBeenCalled();
  });

  it('should handle list processing without list_id', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: null,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    const result = await service.run(request);

    expect(result).toHaveProperty('executionArn');
    expect(result).toHaveProperty('startDate');
    expect(result.startDate).toBeDefined();
    expect(queueService.processRequest).toHaveBeenCalledWith(request, configService, emailService);
    expect(queueService.getQueueStats).toHaveBeenCalled();
  });

  it('should get queue stats and log them', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: null,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    const mockStats = { size: 5, pending: 2, running: 1 };
    (queueService.getQueueStats as jest.Mock).mockReturnValue(mockStats);

    await service.run(request);

    expect(queueService.getQueueStats).toHaveBeenCalled();
    expect(queueService.processRequest).toHaveBeenCalledWith(request, configService, emailService);
  });
});
