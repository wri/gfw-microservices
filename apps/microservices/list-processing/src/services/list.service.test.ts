import { Test, TestingModule } from '@nestjs/testing';
import { ListService } from './list.service';
import { StartAnalysisService } from '../app/list-upload/start.analysis.service';
import { DeprecatedStartAnalysisService } from '../app/list-upload/deprecated.start.analysis.service';
import { FeatureFlag, Organization } from '@wri-monorepos/sql';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../models';
import { DataSource } from 'typeorm';
import { MetadataService } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';

jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));

describe('ListService', () => {
  let service: ListService;
  let startAnalysisService: StartAnalysisService;
  let deprecatedStartAnalysisService: DeprecatedStartAnalysisService;
  let getFeatureFlagsForCurrentOrg: jest.Mock;

  beforeEach(async () => {
    getFeatureFlagsForCurrentOrg = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: DataSource, // Provide the DataSource mock
          useValue: {
            // Mock the methods you need from DataSource
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: 'ClientStoreConnection', // Provide the ClientStoreConnection mock
          useValue: {
            // Mock the methods you need from ClientStoreConnection
          },
        },
        {
          provide: MetadataService, // Provide the MetadataService mock
          useValue: {
            // Mock the methods you need from MetadataService
          },
        },
        {
          provide: ConfigService, // Provide the ConfigService mock
          useValue: {
            // Mock the methods you need from ConfigService
          },
        },
        {
          provide: StartAnalysisService,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: DeprecatedStartAnalysisService,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: 'featureFlagsService',
          useValue: {
            getFeatureFlagsForCurrentOrg,
          },
        },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
    startAnalysisService = module.get<StartAnalysisService>(StartAnalysisService);
    deprecatedStartAnalysisService = module.get<DeprecatedStartAnalysisService>(
      DeprecatedStartAnalysisService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call startAnalysisService.run if UploadListLp flag is true', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'org123',
      list_id: 1,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
    };
    const flags: FeatureFlag[] = [
      {
        id: 1,
        flagId: 'UploadListLp',
        flagState: true,
        modifierUserId: 1,
        updateDateTime: new Date(),
        organization: new Organization(),
        orgId: 1,
      },
    ];
    const response: ResponseLargeListProcess = { executionArn: '', startDate: '' };

    getFeatureFlagsForCurrentOrg.mockResolvedValue(flags);
    (startAnalysisService.run as jest.Mock).mockResolvedValue(response);

    const result = await service.startAnalysisProcessForList(request);

    expect(getFeatureFlagsForCurrentOrg).toHaveBeenCalledWith(request.organization_id);
    expect(startAnalysisService.run).toHaveBeenCalledWith(request);
    expect(deprecatedStartAnalysisService.run).not.toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('should call deprecatedStartAnalysisService.run if UploadListLp flag is false', async () => {
    const request: RequestLargeListProcess = {
      organization_id: 1,
      subscription_status_id: 1,
      organization_database: 'org123',
      list_id: 1,
      path: 'test-path',
      template_type: 'test-type',
      user_id: 1,
      startAnalysis: true,
    };
    const flags: FeatureFlag[] = [
      {
        id: 1,
        flagId: 'UploadListLp',
        flagState: false,
        modifierUserId: 1,
        updateDateTime: new Date(),
        organization: new Organization(),
        orgId: 1,
      },
    ];
    const response: ResponseLargeListProcess = { executionArn: '', startDate: '' };

    getFeatureFlagsForCurrentOrg.mockResolvedValue(flags);
    (deprecatedStartAnalysisService.run as jest.Mock).mockResolvedValue(response);

    const result = await service.startAnalysisProcessForList(request);

    expect(getFeatureFlagsForCurrentOrg).toHaveBeenCalledWith(request.organization_id);
    expect(deprecatedStartAnalysisService.run).toHaveBeenCalledWith(request);
    expect(startAnalysisService.run).not.toHaveBeenCalled();
    expect(result).toEqual(response);
  });
});
