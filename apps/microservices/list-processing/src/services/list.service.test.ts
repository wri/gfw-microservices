import { ClientStoreConnection, FeatureFlag, Organization } from '@wri-monorepos/sql';
import { RequestLargeListProcess } from '../models';
import { ListService } from './list.service';
import { StartAnalysisService } from '../app/list-upload/start.analysis.service';
import { DeprecatedStartAnalysisService } from '../app/list-upload/deprecated.start.analysis.service';
import { MetadataService } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { featureFlagsService } from '@wri-monorepos/shared';
import { DeprecatedCreateLargeListService } from '../app/list-upload/deprecated.create.large.list.service';
import { CreateLargeListService } from '../app/list-upload/create.large.list.service';

jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));

describe('ListService - Start Analysis Process For List', () => {
  let service: ListService;
  let startAnalysisService: StartAnalysisService;
  let deprecatedStartAnalysisService: DeprecatedStartAnalysisService;
  let createLargeListService: CreateLargeListService;
  let deprecatedCreateLargeListService: DeprecatedCreateLargeListService;
  let metadataServiceMock: Partial<MetadataService>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    metadataServiceMock = {
      // Mock the methods you need from MetadataService
    };

    configServiceMock = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'LARGE_PROCESSING_LIST_BUCKET') {
          return 'test-bucket';
        }
        return undefined;
      }),
    };

    startAnalysisService = {
      run: jest.fn().mockResolvedValue({
        executionArn: 'test-arn',
        startDate: new Date().toISOString(),
      }),
    } as unknown as StartAnalysisService;

    deprecatedStartAnalysisService = {
      run: jest.fn().mockResolvedValue({
        executionArn: 'test-arn',
        startDate: new Date().toISOString(),
      }),
    } as unknown as DeprecatedStartAnalysisService;

    createLargeListService = {
      run: jest.fn(),
    } as unknown as CreateLargeListService;

    deprecatedCreateLargeListService = {
      run: jest.fn(),
    } as unknown as DeprecatedCreateLargeListService;

    service = new ListService(
      new ClientStoreConnection(),
      metadataServiceMock as MetadataService,
      configServiceMock as ConfigService,
      deprecatedStartAnalysisService,
      startAnalysisService,
      deprecatedCreateLargeListService,
      createLargeListService
    );
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
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    const flags: FeatureFlag[] = [
      {
        flagId: 'UploadListLp',
        flagState: true,
        id: 0,
        orgId: 0,
        modifierUserId: 0,
        updateDateTime: undefined,
        organization: new Organization(),
      },
      {
        flagId: 'AnotherFlag',
        flagState: false,
        id: 0,
        orgId: 0,
        modifierUserId: 0,
        updateDateTime: undefined,
        organization: new Organization(),
      },
    ];

    const mockFunc1 = jest.fn().mockReturnValue(flags);

    (featureFlagsService as jest.Mock).mockResolvedValue({
      getFeatureFlagsForCurrentOrg: mockFunc1,
    });

    await service.startAnalysisProcessForList(request);

    expect(startAnalysisService.run).toHaveBeenCalledWith(request);
    expect(deprecatedStartAnalysisService.run).not.toHaveBeenCalled();
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
      saveAsDraft: false,
      commodity: 'cocoa',
    };

    const flags: FeatureFlag[] = [
      {
        flagId: 'UploadListLp',
        flagState: false,
        id: 0,
        orgId: 0,
        modifierUserId: 0,
        updateDateTime: undefined,
        organization: new Organization(),
      },
      {
        flagId: 'AnotherFlag',
        flagState: false,
        id: 0,
        orgId: 0,
        modifierUserId: 0,
        updateDateTime: undefined,
        organization: new Organization(),
      },
    ];

    const mockFunc1 = jest.fn().mockReturnValue(flags);

    (featureFlagsService as jest.Mock).mockResolvedValue({
      getFeatureFlagsForCurrentOrg: mockFunc1,
    });

    await service.startAnalysisProcessForList(request);

    expect(startAnalysisService.run).not.toHaveBeenCalledWith(request);
    expect(deprecatedStartAnalysisService.run).toHaveBeenCalled();
  });

  describe('startAnalysisProcessForList', () => {
    it('should replace S3 path prefix with empty string when UploadListLp flag is enabled', async () => {
      const request: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 1,
        path: 's3://test-bucket/test-file.csv',
        template_type: 'test-type',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'cocoa',
      };

      const mockFlags = [
        {
          flagId: 'UploadListLp',
          flagState: true,
        },
      ] as FeatureFlag[];

      (featureFlagsService as jest.Mock).mockResolvedValue({
        getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue(mockFlags),
      });

      const result = await service.startAnalysisProcessForList(request);

      expect(configServiceMock.get).toHaveBeenCalledWith('LARGE_PROCESSING_LIST_BUCKET', {
        infer: true,
      });
      expect(request.path).toBe('test-file.csv');
      expect(startAnalysisService.run).toHaveBeenCalledWith(request);
      expect(result).toEqual({
        executionArn: 'test-arn',
        startDate: expect.any(String),
      });
    });

    it('should not modify path when UploadListLp flag is disabled', async () => {
      const request: RequestLargeListProcess = {
        organization_id: 1,
        subscription_status_id: 1,
        organization_database: 'test-database',
        list_id: 1,
        path: 's3://test-bucket/test-file.csv',
        template_type: 'test-type',
        user_id: 1,
        startAnalysis: true,
        saveAsDraft: false,
        commodity: 'cocoa',
      };

      const mockFlags = [
        {
          flagId: 'UploadListLp',
          flagState: false,
        },
      ] as FeatureFlag[];

      (featureFlagsService as jest.Mock).mockResolvedValue({
        getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue(mockFlags),
      });

      const result = await service.startAnalysisProcessForList(request);

      expect(request.path).toBe('s3://test-bucket/test-file.csv');
      expect(deprecatedStartAnalysisService.run).toHaveBeenCalledWith(request);
      expect(result).toEqual({
        executionArn: 'test-arn',
        startDate: expect.any(String),
      });
    });
  });
});
