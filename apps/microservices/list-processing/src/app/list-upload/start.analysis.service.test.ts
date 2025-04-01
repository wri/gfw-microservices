import { Test, TestingModule } from '@nestjs/testing';
import { StartAnalysisService, clearErrorFile } from './start.analysis.service';
import { S3Service, EmailService } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { RequestLargeListProcess } from '../../models';
import { csv2geojson } from './parser/csv2geojson.parser';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';

jest.mock('./parser/csv2geojson.parser', () => ({
  csv2geojson: jest.fn(),
}));

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn().mockResolvedValue({
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn(),
      }),
    }),
  })),
  Lists: jest.fn(),
}));

describe('StartAnalysisService', () => {
  let service: StartAnalysisService;
  let s3Service: S3Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartAnalysisService,
        {
          provide: S3Service,
          useValue: {
            writeS3fileIntoTmp: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StartAnalysisService>(StartAnalysisService);
    s3Service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  xit('should be defined', () => {
    expect(service).toBeDefined();
  });

  xit('should run the analysis and return the expected response', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: 1,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
    };
    const bucket = 'test-bucket';
    const fileDownloadedPath = 'tmp/test/path';
    const geoJson = { type: 'FeatureCollection', features: [] };

    jest.spyOn(configService, 'get').mockReturnValue(bucket);
    jest.spyOn(s3Service, 'writeS3fileIntoTmp').mockResolvedValue(fileDownloadedPath);
    (csv2geojson as jest.Mock).mockReturnValue(geoJson);

    const result = await service.run(request);

    expect(configService.get).toHaveBeenCalledWith('LARGE_PROCESSING_LIST_BUCKET', { infer: true });
    expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledWith(request.path, bucket);
    expect(csv2geojson).toHaveBeenCalledWith(fileDownloadedPath);
    expect(result).toEqual({
      executionArn: '',
      startDate: '',
    });
  });

  it('should throw error when list ID does not exist', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'test-database',
      list_id: 999, // Non-existent list ID
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    // Mock the repository to return null (list not found)
    const mockRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const mockConnection = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };
    (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => ({
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    }));

    await expect(service.run(request)).rejects.toThrow(
      'List not found with id 999 at client store'
    );
  });

  describe('clearErrorFile', () => {
    it('should clear the error file storage path for a given list', async () => {
      const organizationDatabase = 'test-database';
      const listId = 123;
      const mockUpdate = jest.fn();
      const mockRepository = {
        update: mockUpdate,
      };
      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => ({
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      }));

      await clearErrorFile(organizationDatabase, listId);

      expect(mockConnection.getRepository).toHaveBeenCalledWith(Lists);
      expect(mockUpdate).toHaveBeenCalledWith({ id: listId }, { errorFileStoragePath: null });
    });
  });
});
