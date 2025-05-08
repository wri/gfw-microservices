import { Test, TestingModule } from '@nestjs/testing';
import { ListPaginationService } from './list.pagination.service';
import { getPaginatedListDataRequest } from '../models';

const mockUspGetPaginatedAnalysisDataForUserList = {
  run: jest.fn(),
};

const mockUspGetAnalysisDataCountForUserList = {
  run: jest.fn(),
};

describe('ListPaginationService', () => {
  let service: ListPaginationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPaginationService,
        {
          provide: 'UspGetPaginatedAnalysisDataForUserList',
          useValue: mockUspGetPaginatedAnalysisDataForUserList,
        },
        {
          provide: 'UspGetAnalysisDataCountForUserList',
          useValue: mockUspGetAnalysisDataCountForUserList,
        },
      ],
    }).compile();

    service = module.get<ListPaginationService>(ListPaginationService);
  });

  describe('getPaginatedListData', () => {
    it('should return paginated list data', async () => {
      const mockData = [
        {
          list_id: 1,
          'Location Name': 'Test Location',
          Latitude: 0,
          Longitude: 0,
          'Analysis Radius': 0,
          'Analysis Area': 0,
          Commodity: 'test',
          'Location Classification': 'test',
          'Company ID': 'test-company',
          Volume: 100,
          'Owner Name': 'Test Owner',
          'Owner ID': 'owner-1',
        },
      ];
      const queryParam: getPaginatedListDataRequest = {
        listId: 1,
        organizationDatabase: 'test_db',
        page: 0,
        rowsPerPage: 1000,
      };

      mockUspGetPaginatedAnalysisDataForUserList.run.mockResolvedValue(mockData);

      const result = await service.getPaginatedListData(queryParam);

      expect(result).toEqual(mockData);
      expect(mockUspGetPaginatedAnalysisDataForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
    });

    it('should return empty array when no data is found', async () => {
      const queryParam: getPaginatedListDataRequest = {
        listId: 1,
        organizationDatabase: 'test_db',
        page: 0,
        rowsPerPage: 1000,
      };

      mockUspGetPaginatedAnalysisDataForUserList.run.mockResolvedValue(null);

      const result = await service.getPaginatedListData(queryParam);

      expect(result).toEqual([]);
    });
  });

  describe('getPaginatedListDataWithPages', () => {
    it('should return paginated list data with pages', async () => {
      const mockData = [
        {
          list_id: 1,
          'Location Name': 'Test Location',
          Latitude: 0,
          Longitude: 0,
          'Analysis Radius': 0,
          'Analysis Area': 0,
          Commodity: 'test',
          'Location Classification': 'test',
          'Company ID': 'test-company',
          Volume: 100,
          'Owner Name': 'Test Owner',
          'Owner ID': 'owner-1',
        },
      ];
      const mockPages = { count: 10 };
      const queryParam: getPaginatedListDataRequest = {
        listId: 1,
        organizationDatabase: 'test_db',
        page: 0,
        rowsPerPage: 1000,
      };

      mockUspGetPaginatedAnalysisDataForUserList.run.mockResolvedValue(mockData);
      mockUspGetAnalysisDataCountForUserList.run.mockResolvedValue(mockPages);

      const result = await service.getPaginatedListDataWithPages(queryParam);

      expect(result).toEqual({
        data: mockData,
        pages: mockPages,
      });
      expect(mockUspGetPaginatedAnalysisDataForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
      expect(mockUspGetAnalysisDataCountForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
    });

    it('should return empty arrays when no data is found', async () => {
      const queryParam: getPaginatedListDataRequest = {
        listId: 1,
        organizationDatabase: 'test_db',
        page: 0,
        rowsPerPage: 1000,
      };

      mockUspGetPaginatedAnalysisDataForUserList.run.mockResolvedValue(null);
      mockUspGetAnalysisDataCountForUserList.run.mockResolvedValue(null);

      const result = await service.getPaginatedListDataWithPages(queryParam);

      expect(result).toEqual({
        data: [],
        pages: [],
      });
    });
  });
});
