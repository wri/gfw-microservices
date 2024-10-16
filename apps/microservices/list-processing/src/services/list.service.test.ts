import { ClientStoreConnection, FeatureFlag, Organization } from '@wri-monorepos/sql';
import { RequestLargeListProcess } from '../models';
import { ListService } from './list.service';
import { StartAnalysisService } from '../app/list-upload/start.analysis.service';
import { DeprecatedStartAnalysisService } from '../app/list-upload/deprecated.start.analysis.service';
import { DataSource, EntityManager } from 'typeorm';
import { MetadataService } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { featureFlagsService } from '@wri-monorepos/shared';

jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));

describe('ListService - Start Analysis Process For List', () => {
  let service: ListService;
  let startAnalysisService: StartAnalysisService;
  let deprecatedStartAnalysisService: DeprecatedStartAnalysisService;
  let dataSourceMock: Partial<DataSource>;
  let metadataServiceMock: Partial<MetadataService>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    const entityManagerMock: Partial<EntityManager> = {
      transaction: jest.fn(),
    };

    dataSourceMock = {
      manager: entityManagerMock as EntityManager,
    };

    metadataServiceMock = {
      // Mock the methods you need from MetadataService
    };

    configServiceMock = {
      // Mock the methods you need from ConfigService
    };

    startAnalysisService = {
      run: jest.fn(),
    } as unknown as StartAnalysisService;

    deprecatedStartAnalysisService = {
      run: jest.fn(),
    } as unknown as DeprecatedStartAnalysisService;

    service = new ListService(
      new ClientStoreConnection(),
      metadataServiceMock as MetadataService,
      configServiceMock as ConfigService,
      deprecatedStartAnalysisService,
      startAnalysisService
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
});
