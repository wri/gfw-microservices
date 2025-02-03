import { Test, TestingModule } from '@nestjs/testing';
import { StartAnalysisService } from './start.analysis.service';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { RequestLargeListProcess } from '../../models';
import { csv2geojson } from './parser/csv2geojson.parser';

jest.mock('./parser/csv2geojson.parser', () => ({
  csv2geojson: jest.fn(),
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
});
