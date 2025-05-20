/* eslint-disable no-undef */
import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisService } from '../list-analysis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserService } from '../user.service';
import { OrganizationService } from '../organization.service';
import * as sinon from 'sinon';
import { DataSource } from 'typeorm';
import { ListAnalysisStatusRepositoryMock } from './repositories/list-analysis-status.repository.mock';
import { ListAnalysisMessageModule } from '../../list-analysis-message-handler';
import { ListService } from '../../lists/lists.service';
import { S3Service } from '@wri-monorepos/aws';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { SqsService } from '@ssut/nestjs-sqs';
import { SaveActivityLogEndpoint } from '../utils/saveActivityLogEndpoint';
import { checkProcessingLimits } from '@wri-monorepos/shared';
import { listStatus } from '@wri-monorepos/constants';
import { handleCreateAnalysis } from '@wri-monorepos/geo';
import {
  ClientStoreConnection,
  ExternalAPIKey,
  FeatureFlag,
  Lists,
  ListsAnalysisStatus,
  Organization,
  UserRoutes,
} from '@wri-monorepos/sql';

jest.mock('@wri-monorepos/geo', () => ({
  handleCreateAnalysis: jest.fn().mockResolvedValue('true value'),
}));

jest.mock('@wri-monorepos/shared', () => ({
  checkProcessingLimits: jest.fn(),
}));

jest.mock('../../shared/generate-templates', () => ({
  generateAnalysisTemplate: jest.fn().mockResolvedValue(true),
}));

const USER_EMAIL = 'email@email.com';

describe('ListAnalysisService', () => {
  let service: ListAnalysisService;
  let organizationService: OrganizationService;
  let module: TestingModule;
  let clientStoreConnection: ClientStoreConnection;
  let userService: UserService;
  let listService: ListService;
  let sqsService: SqsService;
  let saveActivityLogEndpoint: SaveActivityLogEndpoint;
  beforeAll(async () => {
    sinon
      .stub(DataSource.prototype, 'getRepository')
      .withArgs(ListsAnalysisStatus)
      .returns(new ListAnalysisStatusRepositoryMock());

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [
            Organization,
            UserRoutes,
            ExternalAPIKey,
            Lists,
            ListsAnalysisStatus,
            FeatureFlag,
          ],
        }),
        TypeOrmModule.forFeature(
          [Organization, ExternalAPIKey, UserRoutes, FeatureFlag],
          'default'
        ),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
        ListAnalysisMessageModule,
      ],
      providers: [
        ListAnalysisService,
        UserService,
        ClientStoreConnection,
        OrganizationService,
        ListService,
        S3Service,
        SaveActivityLogEndpoint,
      ],
    }).compile();
  });

  beforeEach(async () => {
    organizationService = module.get<OrganizationService>(OrganizationService);
    service = module.get<ListAnalysisService>(ListAnalysisService);
    userService = module.get<UserService>(UserService);
    clientStoreConnection = module.get<ClientStoreConnection>(ClientStoreConnection);
    listService = module.get<ListService>(ListService);
    sqsService = module.get<SqsService>(SqsService);
    saveActivityLogEndpoint = module.get<SaveActivityLogEndpoint>(SaveActivityLogEndpoint);

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });

    userService.findUser = jest
      .fn()
      .mockResolvedValueOnce({ id: 1, organization_user_id: 1, userEmail: USER_EMAIL });
  });

  describe('deleteList', () => {
    it('should delete a list', async () => {
      const listId = 123;
      const organizationId = 1;

      const mockList = {
        listId: 123,
        status: listStatus.Active,
        errorsDetails: [],
        resultUrl: 'https://example.com/results',
        creationDate: new Date('2023-09-28'),
        expirationDate: new Date('2023-09-28'),
      };
      const mockResponseDeleteList = 'User email@email has deleted list listName';
      const mockObjectDeleteListResponse = { message: mockResponseDeleteList };
      clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
        getRepository: () => ({
          findOne: () => mockList,
        }),
        options: {
          database: 'mock_db',
        },
      });
      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);

      axios.post = jest
        .fn()
        .mockResolvedValue({ status: 200, data: { message: mockResponseDeleteList } });
      const result = await service.deleteList(organizationId, listId, USER_EMAIL);
      expect(result).toEqual(mockObjectDeleteListResponse);
    });

    it('should not find a list to delete', async () => {
      const listId = 123;
      const organizationId = 1;

      clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
        getRepository: () => ({
          delete: () => true,
          findOne: () => null,
        }),
      });

      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);
      axios.delete = jest.fn().mockResolvedValue({ status: 200 });
      await expect(service.deleteList(organizationId, listId, USER_EMAIL)).rejects.toThrowError(
        NotFoundException
      );
    });

    it('should throw error on trying to delete a list', async () => {
      const listId = 123;
      const organizationId = 1;

      clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
        getRepository: () => ({
          findOne: () => null,
        }),
      });
      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);
      await expect(service.deleteList(organizationId, listId, USER_EMAIL)).rejects.toThrowError(
        NotFoundException
      );
    });
  });

  describe('prepareUpload', () => {
    it('should create a prepare upload list', async () => {
      const organizationId = 1;
      const organization_user_id = 1;
      const fileType = 'csv';
      const expectedResult = {
        organizationId: organizationId.toString(),
        organization_user_id: organization_user_id.toString(),
        fileType,
      };
      service.prepareUpload = jest.fn().mockResolvedValue(expectedResult);
      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);
      const result = await service.prepareUpload({
        organizationId,
        organization_user_id,
        fileType,
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAnalysisStatus', () => {
    it('should get analysis status', async () => {
      const listId = 123;
      const organizationId = 1;
      const MockedDateTimeNow = new Date().toLocaleDateString('en-US');
      const expectedResult = {
        listId: listId.toString(),
        status: 'Invalid Status',
        errorsDetails: [],
        resultUrl: 'https://example.com/results',
        creationDate: MockedDateTimeNow,
        expirationDate: new Date('11-28-2999 02:00:22.895'),
      };
      const mockListsAnalysisStatus = {
        listId: listId.toString(),
        status: 'Completed',
        errorInfo: '',
        s3URL: 'https://example.com/results',
        bundleCreationTime: MockedDateTimeNow,
        expirationTime: new Date('11-28-2999 02:00:22.895'),
      };
      clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
        getRepository: () => ({
          findOne: jest.fn().mockReturnValue(mockListsAnalysisStatus),
        }),
      });

      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);
      const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });

      expect(result).toEqual(expectedResult);
    });

    it('should not return resultUrl, creationDate and expirationDate when the expirationDate is in the past', async () => {
      const listId = 123;
      const organizationId = 1;
      const expectedResult = {
        listId: listId.toString(),
        status: 'Invalid Status',
        errorsDetails: [],
        resultUrl: null,
        creationDate: null,
        expirationDate: null,
      };
      const mockListsAnalysisStatus = {
        listId: listId.toString(),
        status: 'Completed',
        errorInfo: '',
        s3URL: 'https://example.com/results',
        bundleCreationTime: new Date().toLocaleDateString('en-US'),
        expirationTime: new Date('11-28-2000 02:00:22.895'),
      };
      clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
        getRepository: () => ({
          findOne: jest.fn().mockReturnValue(mockListsAnalysisStatus),
        }),
      });

      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);
      const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });
      expect(result).toEqual(expectedResult);
    });

    it('Should return inactive as error when errorDetails is empty', async () => {
      const listId = 123;
      const organizationId = 1;
      const expectedResult = {
        listId: listId.toString(),
        status: 'Error',
        errorsDetails: ['Inactive'],
        resultUrl: null,
        creationDate: null,
        expirationDate: null,
      };
      const mockListsAnalysisStatus = {
        listId: listId.toString(),
        status: listStatus.Inactive,
        errorInfo: '',
        s3URL: null,
        bundleCreationTime: null,
        expirationTime: null,
      };
      clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
        getRepository: () => ({
          findOne: jest.fn().mockReturnValueOnce(mockListsAnalysisStatus),
        }),
      });

      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);
      const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });
      expect(result).toEqual(expectedResult);
    });

    it('Should not override status when status is inactive but errorDetails is not empty', async () => {
      const listId = 123;
      const organizationId = 1;
      const expectedResult = {
        listId: listId.toString(),
        status: 'Error',
        errorsDetails: ['Exceeded Analysis Limit'],
        resultUrl: null,
        creationDate: null,
        expirationDate: null,
      };
      const mockListsAnalysisStatus = {
        listId: listId.toString(),
        status: 3,
        errorInfo: 'Exceeded Analysis Limit',
        s3URL: null,
        bundleCreationTime: null,
        expirationTime: null,
      };
      clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
        getRepository: () => ({
          findOne: jest.fn().mockReturnValueOnce(mockListsAnalysisStatus),
        }),
      });

      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);
      const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });
      expect(result).toEqual(expectedResult);
    });

    it('should translate Draft status from Error Status when there are errorFileStoragePath', async () => {
      const listId = 123;
      const organizationId = 1;
      const expectedResult = {
        listId: listId.toString(),
        status: 'Error',
        errorsDetails: ['s3://gfwpro-geotrellis-pre-data/example.com/errors'],
        resultUrl: null,
        creationDate: null,
        expirationDate: null,
      };

      service.getAnalysisStatus = jest.fn().mockResolvedValue({
        status: 'Draft',
        listId: listId.toString(),
        errorsDetails: [],
        resultUrl: null,
        creationDate: null,
        expirationDate: null,
      });
      listService.getList = jest.fn().mockResolvedValue({
        errorFileStoragePath: 's3://gfwpro-geotrellis-pre-data/example.com/errors',
      });

      const result = await service.getAnalysisStatusWithErrorFileStoragePath({
        organizationId,
        listId,
        analysisId: 'FCD',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should not translate Draft status from Error Status when there are not errorFileStoragePath', async () => {
      const listId = 123;
      const organizationId = 1;
      const expectedResult = {
        listId: listId.toString(),
        status: 'Draft',
        errorsDetails: [],
        resultUrl: null,
        creationDate: null,
        expirationDate: null,
      };

      service.getAnalysisStatus = jest.fn().mockResolvedValue({
        status: 'Draft',
        listId: listId.toString(),
        errorsDetails: [],
        resultUrl: null,
        creationDate: null,
        expirationDate: null,
      });
      listService.getList = jest.fn().mockResolvedValue({
        id: listId.toString(),
        listAnalysisTableName: 'analysis-list_name',
        listErrorMessage: null,
        listName: 'list_name',
        listStatusId: 4,
      });

      const result = await service.getAnalysisStatusWithErrorFileStoragePath({
        organizationId,
        listId,
        analysisId: 'FCD',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createAnalysis', () => {
    it('Should Create an Analysis', async () => {
      const analysisTypesToProcess = 'FCD';
      const listId = 123;
      const organizationId = 1;
      const organization_user_id = 1;

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });
      const mockList = {
        listId: 123,
        analysisId: analysisTypesToProcess,
        status: listStatus.Pending,
      };

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: () => mockList,
          findBy: () => mockList,
          update: () => true,
          save: () => true,
          findOneBy: () => mockList,
        }),
        options: {
          database: 'mock_db',
        },
      });

      const mockResponseHandleCreateAnalysis = { statusText: 'mockedEmailResponse' };
      (handleCreateAnalysis as jest.Mock).mockResolvedValue(mockResponseHandleCreateAnalysis);

      const result = await service.createAnalysis(
        analysisTypesToProcess,
        listId,
        organizationId,
        USER_EMAIL,
        organization_user_id
      );

      expect(result).toBe(mockResponseHandleCreateAnalysis);

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });

    it('Should fail when try to send email', async () => {
      const analysisTypesToProcess = 'FCD';
      const listId = 123;
      const organizationId = 1;
      const organization_user_id = 1;

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });
      const mockList = {
        listId: 123,
        analysisId: analysisTypesToProcess,
        status: listStatus.Pending,
      };

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: () => mockList,
          findBy: () => mockList,
          update: () => true,
          save: () => true,
          findOneBy: () => mockList,
        }),
        options: {
          database: 'mock_db',
        },
      });
      (handleCreateAnalysis as jest.Mock).mockRejectedValue(new Error('Failed to send email'));
      await expect(
        service.createAnalysis(
          analysisTypesToProcess,
          listId,
          organizationId,
          USER_EMAIL,
          organization_user_id
        )
      ).rejects.toThrow(new Error('Failed to send email'));
    });
  });

  describe('generateDownloadBundle', () => {
    const MOCK_INPUT_DATA = {
      organizationId: 1,
      listId: 123,
      analysisId: 'FCD',
      startDate: null,
      endDate: null,
      userEmail: USER_EMAIL,
    };

    it('Should generate an alert for FCD type', async () => {
      jest.mock('../../shared/generate-templates', () => ({
        generateAnalysisTemplate: jest.fn().mockResolvedValue(true),
      }));
      sqsService.send = jest.fn().mockResolvedValue(true);
      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);

      const mockListsAnalysisStatus = {
        listId: MOCK_INPUT_DATA.listId.toString(),
        status: listStatus.Active,
        errorInfo: '',
        s3URL: 'https://example.com/results',
        bundleCreationTime: new Date().toLocaleDateString('en-US'),
        expirationTime: new Date('11-28-2999 02:00:22.895'),
      };

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: jest.fn().mockReturnValueOnce(mockListsAnalysisStatus),
          findOneBy: jest.fn().mockReturnValueOnce(mockListsAnalysisStatus),
        }),
      });

      axios.post = jest.fn().mockResolvedValue({ status: 200, statusText: 'mockedEmailResponse' });

      await expect(service.generateDownloadBundle(MOCK_INPUT_DATA)).resolves.toBeUndefined();

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });

    it('Should generate an alert for Alert type', async () => {
      jest.mock('../../shared/generate-templates', () => ({
        generateAnalysisTemplate: jest.fn().mockResolvedValue(true),
      }));
      sqsService.send = jest.fn().mockResolvedValue(true);
      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);

      const mockListsAnalysisStatus = {
        listId: MOCK_INPUT_DATA.listId.toString(),
        status: listStatus.Active,
        errorInfo: '',
        s3URL: 'https://example.com/results',
        bundleCreationTime: new Date().toLocaleDateString('en-US'),
        expirationTime: new Date('11-28-2999 02:00:22.895'),
      };

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: jest.fn().mockReturnValueOnce(mockListsAnalysisStatus),
          findOneBy: jest.fn().mockReturnValueOnce(mockListsAnalysisStatus),
        }),
      });

      axios.post = jest.fn().mockResolvedValue({ status: 200, statusText: 'mockedEmailResponse' });

      await expect(
        service.generateDownloadBundle({
          ...MOCK_INPUT_DATA,
          analysisId: 'ALERTS',
          startDate: new Date('2021-09-28'),
          endDate: new Date('2021-09-28'),
        })
      ).resolves.toBeUndefined();

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });

    it('Should generate an alert for DefReport type', async () => {
      jest.mock('../../shared/generate-templates', () => ({
        generateAnalysisTemplate: jest.fn().mockResolvedValue(true),
      }));
      sqsService.send = jest.fn().mockResolvedValue(true);
      saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);

      const mockListsAnalysisStatus = {
        listId: MOCK_INPUT_DATA.listId.toString(),
        status: listStatus.Active,
        errorInfo: '',
        s3URL: 'https://example.com/results',
        bundleCreationTime: new Date().toLocaleDateString('en-US'),
        expirationTime: new Date('11-28-2999 02:00:22.895'),
      };

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: jest.fn().mockReturnValueOnce(mockListsAnalysisStatus),
          findOneBy: jest.fn().mockReturnValueOnce(mockListsAnalysisStatus),
        }),
      });

      axios.post = jest.fn().mockResolvedValue({ status: 200, statusText: 'mockedEmailResponse' });

      await expect(
        service.generateDownloadBundle({ ...MOCK_INPUT_DATA, analysisId: 'DefReport' })
      ).resolves.toBeUndefined();

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });

    it('Should throw an error when list is not found', async () => {
      listService.getList = jest.fn().mockResolvedValueOnce(null);

      clientStoreConnection.getConnection = jest.fn().mockResolvedValueOnce({
        getRepository: () => ({
          save: () => true,
        }),
        options: {
          database: 'mock_db',
        },
      });

      await expect(service.generateDownloadBundle(MOCK_INPUT_DATA)).rejects.toThrow(
        expect.objectContaining({
          message: 'List not found',
        })
      );
    });

    it('Should throw an error when analysis status is not found', async () => {
      listService.getList = jest.fn().mockResolvedValueOnce({
        id: MOCK_INPUT_DATA.listId.toString(),
      });

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: () => null,
          save: () => true,
        }),
        options: {
          database: 'mock_db',
        },
      });

      await expect(
        service.generateDownloadBundle({ ...MOCK_INPUT_DATA, userEmail: null })
      ).rejects.toThrow(
        expect.objectContaining({
          message: 'Analysis status not found',
        })
      );

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });

    test.each([
      listStatus.Pending,
      listStatus.Inactive,
      listStatus.Draft,
      listStatus.AnalyzingDiagnostic,
      listStatus.AnalyzingDashboard,
    ])('Should throw an error when list it not active', async (status) => {
      listService.getList = jest.fn().mockResolvedValueOnce({
        id: MOCK_INPUT_DATA.listId.toString(),
      });

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: () => ({
            status,
          }),
          save: () => true,
        }),
        options: {
          database: 'mock_db',
        },
      });

      await expect(service.generateDownloadBundle(MOCK_INPUT_DATA)).rejects.toThrow(
        expect.objectContaining({
          message: 'List is not active',
        })
      );

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });

    it('Should throw an error when missing user email', async () => {
      const mockList = {
        listId: 123,
        analysisId: 'FCD',
        status: listStatus.Active,
      };

      listService.getList = jest.fn().mockResolvedValueOnce({
        id: MOCK_INPUT_DATA.listId.toString(),
      });

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: () => mockList,
          save: () => true,
        }),
        options: {
          database: 'mock_db',
        },
      });

      await expect(
        service.generateDownloadBundle({ ...MOCK_INPUT_DATA, userEmail: null })
      ).rejects.toThrow(
        expect.objectContaining({
          message: 'Missing user email',
        })
      );

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });

    it('Should throw an error when missing startDate for generate Alerts type', async () => {
      const mockList = {
        listId: 123,
        analysisId: 'ALERTS',
        status: listStatus.Active,
      };

      listService.getList = jest.fn().mockResolvedValueOnce({
        id: MOCK_INPUT_DATA.listId.toString(),
      });

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: () => mockList,
          save: () => true,
        }),
        options: {
          database: 'mock_db',
        },
      });

      await expect(
        service.generateDownloadBundle({
          ...MOCK_INPUT_DATA,
          analysisId: 'ALERTS',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          message: 'Missing start date or end date',
        })
      );

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });

    it('Should throw an error when missing endDate for generate Alerts type', async () => {
      const mockList = {
        listId: 123,
        analysisId: 'ALERTS',
        status: listStatus.Active,
      };

      listService.getList = jest.fn().mockResolvedValueOnce({
        id: MOCK_INPUT_DATA.listId.toString(),
      });

      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: () => mockList,
          save: () => true,
        }),
        options: {
          database: 'mock_db',
        },
      });

      await expect(
        service.generateDownloadBundle({
          ...MOCK_INPUT_DATA,
          analysisId: 'ALERTS',
          startDate: new Date(),
        })
      ).rejects.toThrow(
        expect.objectContaining({
          message: 'Missing start date or end date',
        })
      );

      (clientStoreConnection.getConnection as jest.Mock).mockReset();
    });
  });
  it('Should fail when try to create GHG Analysis', async () => {
    const analysisTypesToProcess = 'GHG';
    const listId = 123;
    const organizationId = 1;
    const organization_user_id = 1;

    (checkProcessingLimits as jest.Mock).mockResolvedValue({
      isListLocationOverLimit: false,
      processingLimit: 1000,
    });

    const mockedhandleCreateAnalysis = { statusText: 'mockedEmailResponse' };
    (handleCreateAnalysis as jest.Mock).mockResolvedValue(mockedhandleCreateAnalysis);

    listService.getList = jest.fn().mockResolvedValue({
      templateId: 13,
      Commodity: 'COCO',
    });
    saveActivityLogEndpoint.saveActivityLogEndpoint = jest.fn().mockResolvedValue(true);
    const mockList = {
      listId: 123,
      analysisId: analysisTypesToProcess,
      status: listStatus.Pending,
      templateId: '12',
    };
    clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: () => mockList,
        findBy: () => mockList,
        update: () => true,
        save: () => true,
        findOneBy: () => mockList,
      }),
      options: {
        database: 'mock_db',
      },
    });

    const resutl = await service.createAnalysis(
      analysisTypesToProcess,
      listId,
      organizationId,
      USER_EMAIL,
      organization_user_id
    );
    expect(resutl).toBe(mockedhandleCreateAnalysis);
  });

  describe('getLocationsErrors', () => {
    it('should return locations with errors when they exist', async () => {
      const mockLocationsWithErrors = [
        {
          locationName: 'Location 1',
          errorDetails: 'Error 1',
        },
        {
          locationName: 'Location 2',
          errorDetails: 'Error 2',
        },
      ];
      const mockResult = [
        {
          'Location Name': 'Location 1',
          Details: 'Error 1',
        },
        {
          'Location Name': 'Location 2',
          Details: 'Error 2',
        },
      ];
      const mockList = {
        id: 1,
        listTableName: 'test_list_table',
      };

      const mockOrg = {
        id: 1,
        organizationDb: 'test_db',
      };

      organizationService.findOrganizationById = jest.fn().mockResolvedValue(mockOrg);
      listService.getList = jest.fn().mockResolvedValue(mockList);
      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          find: jest.fn().mockResolvedValue(mockLocationsWithErrors),
        }),
      });

      const result = await service.getLocationsErrors({
        listId: 1,
        organizationId: 1,
      });

      expect(result).toEqual(mockResult);
    });

    it('should throw NOT_FOUND with correct message when organization does not exist', async () => {
      organizationService.findOrganizationById = jest.fn().mockResolvedValue(null);

      try {
        await service.getLocationsErrors({
          listId: 1,
          organizationId: 999,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual({ errorDetails: 'Organization not found' });
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw NOT_FOUND with correct message when list does not exist', async () => {
      const mockOrg = {
        id: 1,
        organizationDb: 'test_db',
      };

      organizationService.findOrganizationById = jest.fn().mockResolvedValue(mockOrg);
      listService.getList = jest.fn().mockResolvedValue(null);

      try {
        await service.getLocationsErrors({
          listId: 999,
          organizationId: 1,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual({ errorDetails: 'List not found' });
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should not throw NOT_FOUND when no errors exist', async () => {
      const mockList = {
        id: 1,
        listTableName: 'test_list_table',
      };

      const mockOrg = {
        id: 1,
        organizationDb: 'test_db',
      };

      organizationService.findOrganizationById = jest.fn().mockResolvedValue(mockOrg);
      listService.getList = jest.fn().mockResolvedValue(mockList);
      clientStoreConnection.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          find: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getLocationsErrors({
        listId: 1,
        organizationId: 1,
      });
      expect(result).toStrictEqual([]);
    });
  });
});
