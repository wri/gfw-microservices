import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisService } from './list-analysis.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { OrganizationService } from './organization.service';
import { ListService } from '../lists/lists.service';
import { SaveActivityLogEndpoint } from './utils/saveActivityLogEndpoint';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientStoreConnection } from '@wri-monorepos/sql';

describe('ListAnalysisService', () => {
  let service: ListAnalysisService;
  let organizationService: OrganizationService;
  let listService: ListService;
  let clientStoreConnection: ClientStoreConnection;

  const mockOrganization = {
    id: 1,
    organizationDb: 'test_db',
  };

  const mockList = {
    id: 1,
    listTableName: 'test_list_table',
  };

  const mockConnection = {
    getRepository: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAnalysisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUser: jest.fn(),
          },
        },
        {
          provide: OrganizationService,
          useValue: {
            findOrganizationById: jest.fn(),
          },
        },
        {
          provide: ListService,
          useValue: {
            getList: jest.fn(),
          },
        },
        {
          provide: SaveActivityLogEndpoint,
          useValue: {
            saveActivityLogEndpoint: jest.fn(),
          },
        },
        {
          provide: ClientStoreConnection,
          useValue: {
            getConnection: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ListAnalysisService>(ListAnalysisService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    listService = module.get<ListService>(ListService);
    clientStoreConnection = module.get<ClientStoreConnection>(ClientStoreConnection);
  });

  describe('getLocationsErrors', () => {
    const mockListTableNameRepository = {
      find: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (organizationService.findOrganizationById as jest.Mock).mockResolvedValue(mockOrganization);
      (listService.getList as jest.Mock).mockResolvedValue(mockList);
      (clientStoreConnection.getConnection as jest.Mock).mockResolvedValue(mockConnection);
      mockConnection.getRepository.mockReturnValue(mockListTableNameRepository);
    });

    it('should return locations with valid error details', async () => {
      const mockLocations = [
        { locationName: 'Location 1', errorDetails: 'Error 1' },
        { locationName: 'Location 2', errorDetails: 'Error 2' },
      ];
      mockListTableNameRepository.find.mockResolvedValue(mockLocations);

      const result = await service.getLocationsErrors({
        listId: 1,
        organizationId: 1,
      });

      expect(result).toEqual([
        { 'Location Name': 'Location 1', Details: 'Error 1' },
        { 'Location Name': 'Location 2', Details: 'Error 2' },
      ]);

      // Verify the Raw operator was used correctly
      const findCall = mockListTableNameRepository.find.mock.calls[0][0];
      expect(findCall.select).toEqual(['locationName', 'errorDetails']);
      expect(findCall.where.errorDetails).toBeInstanceOf(Object);
      expect(findCall.where.errorDetails._type).toBe('raw');
    });

    it('should filter out locations with NULL error details', async () => {
      // Mock the repository to return filtered results
      mockListTableNameRepository.find.mockImplementation(() => {
        const mockLocations = [
          { locationName: 'Location 1', errorDetails: 'Error 1' },
          { locationName: 'Location 2', errorDetails: null },
        ];
        return Promise.resolve(mockLocations.filter((loc) => loc.errorDetails !== null));
      });

      const result = await service.getLocationsErrors({
        listId: 1,
        organizationId: 1,
      });

      expect(result).toEqual([{ 'Location Name': 'Location 1', Details: 'Error 1' }]);
    });

    it('should filter out locations with empty string error details', async () => {
      // Mock the repository to return filtered results
      mockListTableNameRepository.find.mockImplementation(() => {
        const mockLocations = [
          { locationName: 'Location 1', errorDetails: 'Error 1' },
          { locationName: 'Location 2', errorDetails: '' },
        ];
        return Promise.resolve(mockLocations.filter((loc) => loc.errorDetails !== ''));
      });

      const result = await service.getLocationsErrors({
        listId: 1,
        organizationId: 1,
      });

      expect(result).toEqual([{ 'Location Name': 'Location 1', Details: 'Error 1' }]);
    });

    it('should include GHG location errors when analysisId is GHG', async () => {
      const mockLocations = [{ locationName: 'Location 1', errorDetails: 'Error 1' }];
      const mockGhgErrors = [{ locationName: 'Location 2', errorDetails: 'GHG Error' }];
      mockListTableNameRepository.find.mockResolvedValue(mockLocations);
      jest
        .spyOn(service as unknown as { getGhgLocationErrors: jest.Mock }, 'getGhgLocationErrors')
        .mockResolvedValue(mockGhgErrors);

      const result = await service.getLocationsErrors({
        listId: 1,
        organizationId: 1,
        analysisId: 'GHG',
      });

      expect(result).toEqual([
        { 'Location Name': 'Location 1', Details: 'Error 1' },
        { 'Location Name': 'Location 2', Details: 'GHG Error' },
      ]);
    });

    it('should throw HttpException when organization is not found', async () => {
      (organizationService.findOrganizationById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getLocationsErrors({
          listId: 1,
          organizationId: 1,
        })
      ).rejects.toThrow(
        new HttpException({ errorDetails: 'Organization not found' }, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw HttpException when list is not found', async () => {
      (listService.getList as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getLocationsErrors({
          listId: 1,
          organizationId: 1,
        })
      ).rejects.toThrow(
        new HttpException({ errorDetails: 'List not found' }, HttpStatus.NOT_FOUND)
      );
    });
  });
});
