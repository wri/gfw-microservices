import { Test, TestingModule } from '@nestjs/testing';
import { StartAnalysisService } from './start.analysis.service';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { RequestLargeListProcess } from '../../models';
import { checkIfListExist } from './shared/cheker.utils';

jest.mock('./parser/csv2geojson.parser', () => ({
  csv2geojson: jest.fn(),
}));

jest.mock('./shared/cheker.utils', () => ({
  checkIfListExist: jest.fn(),
}));

jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('fastq', () => ({
  __esModule: true,
  default: {
    promise: jest.fn().mockImplementation(() => ({
      push: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

describe('StartAnalysisService', () => {
  let service: StartAnalysisService;
  let mockGet: jest.Mock;
  let mockWriteS3fileIntoTmp: jest.Mock;

  beforeEach(async () => {
    mockGet = jest.fn().mockReturnValue('test-bucket');
    mockWriteS3fileIntoTmp = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartAnalysisService,
        {
          provide: S3Service,
          useValue: {
            writeS3fileIntoTmp: mockWriteS3fileIntoTmp,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: mockGet,
          },
        },
      ],
    }).compile();

    service = module.get<StartAnalysisService>(StartAnalysisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error when list does not exist in client store', async () => {
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
    };

    (checkIfListExist as jest.Mock).mockResolvedValue(false);

    await expect(service.run(request)).rejects.toThrow(
      'List not found with id 123 at client store'
    );
  });
});
