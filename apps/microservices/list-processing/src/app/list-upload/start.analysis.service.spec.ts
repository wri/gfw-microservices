import { Test, TestingModule } from '@nestjs/testing';
import { StartAnalysisService } from './start.analysis.service';
import { S3Service, EmailService } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { RequestLargeListProcess } from '../../models';
import { ListTemplate } from '@wri-monorepos/sql';
import { CommodityService } from '../list/commodity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import sinon from 'sinon';
import { AbstractHandler } from './chain/types';
import { DataSource } from 'typeorm';
import { checkListSizeLimit } from '../common/check.listSizelimit';

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

jest.mock('../common/check.listSizelimit');

// Mock the fastq module
jest.mock('fastq', () => {
  return jest.fn().mockImplementation(() => ({
    push: jest.fn().mockImplementation((data, callback) => {
      if (callback) {
        callback(null);
      }
      return Promise.resolve();
    }),
    unshift: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    running: jest.fn(),
    idle: jest.fn(),
    length: jest.fn(),
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
});
