import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListPaginationService } from './list.pagination.service';
import { DeleteListService } from './delete.list.service';
import {
  DeleteListRequest,
  getPaginatedListDataRequest,
  getNumberOfPagesPaginatedListDataRequest,
} from '../../models';
import { AnalysisDataType } from '@wri-monorepos/sql';

describe('ListController', () => {
  let controller: ListController;
  let listPaginationService: jest.Mocked<ListPaginationService>;
  let deleteListService: jest.Mocked<DeleteListService>;

  const mockPaginatedData: AnalysisDataType[] = [
    {
      list_id: 1,
      'Location Name': 'Test Location 1',
      Latitude: 10.123,
      Longitude: -74.456,
      'Analysis Radius': 1000,
      'Analysis Area': 500,
      Commodity: 'Palm Oil',
      'Location Classification': 'Test Classification',
      'Company ID': 'test-company',
      Volume: 100,
      'Owner Name': 'Test Owner',
      'Owner ID': 'owner-1',
      'Company Name': 'Test Company',
      'Supplier Name': 'Test Supplier',
      'Facility Name': 'Test Facility',
      'Refinery Name': 'Test Refinery',
      Certification: 'test',
      'Start Date': '2024-01-01',
      'End Date': '2024-12-31',
      'Time Horizon': 'test',
      'Accuracy Rating of Location Entered': 'test',
      Country: 'test',
      State: 'test',
      attributes: 'test',
      'Sub State': 'test',
      'Wind Barrier': 'test',
      'Riparian Buffers': 'test',
      'Buffers Zones': 'test',
      gadmid: 'test',
      flag_general: 'test',
      flag_gran_chaco: 'test',
      flag_glad: 'test',
      flag_forma: 'test',
      flag_viirs: 'test',
      flag_terrai: 'test',
      list_location_id: 1,
      analysis_list_id: 1,
      template_id: 1,
      id: 1,
      location_id: 1,
      location_status_id: 1,
      tree_cover_loss_total_yearly: 'test',
      tree_cover_loss_primary_forest_yearly: 'test',
      tree_cover_loss_peat_yearly: 'test',
      tree_cover_loss_intact_forest_yearly: 'test',
      tree_cover_loss_protected_areas_yearly: 'test',
      tree_cover_loss_sea_landcover_yearly: 'test',
      tree_cover_loss_idn_landcover_yearly: 'test',
      tree_cover_loss_idn_primary_forest_yearly: 'test',
      tree_cover_loss_soy_yearly: 'test',
      tree_cover_loss_idn_legal_yearly: 'test',
      tree_cover_loss_idn_forest_moratorium_yearly: 'test',
      tree_cover_loss_prodes_yearly: 'test',
      tree_cover_loss_prodes_wdpa_yearly: 'test',
      tree_cover_loss_prodes_primary_forest_yearly: 'test',
      tree_cover_loss_brazil_biomes_yearly: 'test',
      tree_cover_extent_total: 100,
      tree_cover_extent_primary_forest: 100,
      tree_cover_extent_protected_areas: 100,
      tree_cover_extent_peat: 100,
      tree_cover_extent_intact_forest: 100,
      natural_habitat_primary: 100,
      natural_habitat_intact_forest: 100,
      natural_habitat_global_land_cover: 'test',
      total_area: 100,
      protected_areas_area: 100,
      critical_habitat_alliance_zero: 100,
      indigenous_people_land_rights: 100,
      peat_area: 100,
      fires_counts_monthly: 'test',
      soy_total_area: 'test',
      soy_pre2001_nonforest_area: 100,
      brazil_biomes: 'test',
      idn_legal_area: 'test',
      sea_landcover_area: 'test',
      idn_landcover_area: 'test',
      idn_forest_moratorium_area: 100,
      south_america_presence: 'test',
      legal_amazon_presence: 'test',
      brazil_biomes_presence: 'test',
      cerrado_biome_presence: 'test',
      southeast_asia_presence: 'test',
      indonesia_presence: 'test',
      commodity_threat_deforestation_level: 'test',
      commodity_threat_peat_level: 'test',
      commodity_threat_protected_areas_level: 'test',
      commodity_threat_fires_level: 'test',
      commodity_threat_overall_level: 'test',
      commodity_threat_overall_score: 'test',
      commodity_value_forest_extent_level: 'test',
      commodity_value_peat_level: 'test',
      commodity_value_protected_areas_level: 'test',
      commodity_value_overall_level: 'test',
      commodity_value_overall_score: 'test',
      commodity_value_forest_extent: 'test',
      commodity_value_peat: 'test',
      commodity_value_protected_areas: 'test',
      commodity_mill_priority_level: 'test',
      commodity_mill_priority_score: 'test',
      commodity_threat_deforestation: 'test',
      commodity_threat_peat: 'test',
      commodity_threat_protected_areas: 'test',
      commodity_threat_fires: 'test',
      dissolved_data_location_info: 'test',
      tree_cover_loss_arg_otbn_yearly: 'test',
      arg_otbn_area: 'test',
    },
  ];

  const mockPagesData = {
    numberOfPages: 5,
    numberOfResults: 100,
    maximumAnalysisAreaInTheList: 1000,
  };

  beforeEach(async () => {
    const mockListPaginationService = {
      getPaginatedListData: jest.fn(),
      getNumberOfPagesPaginatedListData: jest.fn(),
      getPaginatedListDataWithPages: jest.fn(),
    };

    const mockDeleteListService = {
      run: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListController],
      providers: [
        {
          provide: ListPaginationService,
          useValue: mockListPaginationService,
        },
        {
          provide: DeleteListService,
          useValue: mockDeleteListService,
        },
      ],
    }).compile();

    controller = module.get<ListController>(ListController);
    listPaginationService = module.get(ListPaginationService);
    deleteListService = module.get(DeleteListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaginatedListData', () => {
    const validQueryParam: getPaginatedListDataRequest = {
      listId: 123,
      organizationDatabase: 'test-org-db',
      page: 0,
      rowsPerPage: 1000,
      sortByAttribute: 'name',
      orderType: 'asc',
    };

    it('should return paginated list data successfully', async () => {
      // Arrange
      listPaginationService.getPaginatedListData.mockResolvedValue(mockPaginatedData);

      // Act
      const result = await controller.getPaginatedListData(validQueryParam);

      // Assert
      expect(result).toEqual(mockPaginatedData);
      expect(listPaginationService.getPaginatedListData).toHaveBeenCalledWith(validQueryParam);
    });

    it('should throw BadRequestException when listId is undefined', async () => {
      // Arrange
      const invalidQueryParam: Partial<getPaginatedListDataRequest> = {
        ...validQueryParam,
        listId: undefined,
      };

      // Act & Assert
      await expect(
        controller.getPaginatedListData(invalidQueryParam as getPaginatedListDataRequest)
      ).rejects.toThrow(new BadRequestException('listID is required'));
      expect(listPaginationService.getPaginatedListData).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when listId is null', async () => {
      // Arrange
      const invalidQueryParam = {
        ...validQueryParam,
        listId: null as unknown as number,
      };

      // Act & Assert
      await expect(controller.getPaginatedListData(invalidQueryParam)).rejects.toThrow(
        new BadRequestException('listID is required')
      );
      expect(listPaginationService.getPaginatedListData).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when listId is 0', async () => {
      // Arrange
      const invalidQueryParam = { ...validQueryParam, listId: 0 };

      // Act & Assert
      await expect(controller.getPaginatedListData(invalidQueryParam)).rejects.toThrow(
        new BadRequestException('listID is required')
      );
      expect(listPaginationService.getPaginatedListData).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when organizationDatabase is undefined', async () => {
      // Arrange
      const invalidQueryParam: Partial<getPaginatedListDataRequest> = {
        ...validQueryParam,
        organizationDatabase: undefined,
      };

      // Act & Assert
      await expect(
        controller.getPaginatedListData(invalidQueryParam as getPaginatedListDataRequest)
      ).rejects.toThrow(new BadRequestException('organizationDatabase is required'));
      expect(listPaginationService.getPaginatedListData).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when organizationDatabase is null', async () => {
      // Arrange
      const invalidQueryParam = {
        ...validQueryParam,
        organizationDatabase: null as unknown as string,
      };

      // Act & Assert
      await expect(controller.getPaginatedListData(invalidQueryParam)).rejects.toThrow(
        new BadRequestException('organizationDatabase is required')
      );
      expect(listPaginationService.getPaginatedListData).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when organizationDatabase is empty string', async () => {
      // Arrange
      const invalidQueryParam = { ...validQueryParam, organizationDatabase: '' };

      // Act & Assert
      await expect(controller.getPaginatedListData(invalidQueryParam)).rejects.toThrow(
        new BadRequestException('organizationDatabase is required')
      );
      expect(listPaginationService.getPaginatedListData).not.toHaveBeenCalled();
    });

    it('should handle optional parameters correctly', async () => {
      // Arrange
      const minimalQueryParam: getPaginatedListDataRequest = {
        listId: 123,
        organizationDatabase: 'test-org-db',
      };
      listPaginationService.getPaginatedListData.mockResolvedValue(mockPaginatedData);

      // Act
      const result = await controller.getPaginatedListData(minimalQueryParam);

      // Assert
      expect(result).toEqual(mockPaginatedData);
      expect(listPaginationService.getPaginatedListData).toHaveBeenCalledWith(minimalQueryParam);
    });
  });

  describe('getNumberOfPagesPaginatedListData', () => {
    const validQueryParam: getNumberOfPagesPaginatedListDataRequest = {
      listId: 123,
      organizationDatabase: 'test-org-db',
      rowsPerPage: 1000,
      analysisAreaMin: 100,
      analysisAreaMax: 1000,
    };

    it('should return number of pages data successfully', async () => {
      // Arrange
      listPaginationService.getNumberOfPagesPaginatedListData.mockResolvedValue(mockPagesData);

      // Act
      const result = await controller.getNumberOfPagesPaginatedListData(validQueryParam);

      // Assert
      expect(result).toEqual(mockPagesData);
      expect(listPaginationService.getNumberOfPagesPaginatedListData).toHaveBeenCalledWith(
        validQueryParam
      );
    });

    it('should throw BadRequestException when listId is invalid', async () => {
      // Arrange
      const invalidQueryParam = { ...validQueryParam, listId: 0 };

      // Act & Assert
      await expect(controller.getNumberOfPagesPaginatedListData(invalidQueryParam)).rejects.toThrow(
        new BadRequestException('listID is required')
      );
      expect(listPaginationService.getNumberOfPagesPaginatedListData).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when organizationDatabase is invalid', async () => {
      // Arrange
      const invalidQueryParam = { ...validQueryParam, organizationDatabase: '' };

      // Act & Assert
      await expect(controller.getNumberOfPagesPaginatedListData(invalidQueryParam)).rejects.toThrow(
        new BadRequestException('organizationDatabase is required')
      );
      expect(listPaginationService.getNumberOfPagesPaginatedListData).not.toHaveBeenCalled();
    });
  });

  describe('getPaginatedListDataWithPages', () => {
    const validQueryParam: getPaginatedListDataRequest = {
      listId: 123,
      organizationDatabase: 'test-org-db',
      page: 0,
      rowsPerPage: 1000,
    };

    const mockDataWithPages = {
      data: mockPaginatedData,
      pages: mockPagesData,
    };

    it('should return paginated list data with pages successfully', async () => {
      // Arrange
      listPaginationService.getPaginatedListDataWithPages.mockResolvedValue(mockDataWithPages);

      // Act
      const result = await controller.getPaginatedListDataWithPages(validQueryParam);

      // Assert
      expect(result).toEqual(mockDataWithPages);
      expect(listPaginationService.getPaginatedListDataWithPages).toHaveBeenCalledWith(
        validQueryParam
      );
    });

    it('should throw BadRequestException when validation fails', async () => {
      // Arrange
      const invalidQueryParam = {
        ...validQueryParam,
        listId: null as unknown as number,
      };

      // Act & Assert
      await expect(controller.getPaginatedListDataWithPages(invalidQueryParam)).rejects.toThrow(
        new BadRequestException('listID is required')
      );
      expect(listPaginationService.getPaginatedListDataWithPages).not.toHaveBeenCalled();
    });
  });

  describe('deleteList', () => {
    const mockListId = 123;
    const mockDeleteRequest: DeleteListRequest = {
      organizationDatabase: 'test-org-db',
      organization_user_id: 456,
      userEmail: 'test@example.com',
    };

    it('should delete list successfully', async () => {
      // Arrange
      const mockSuccessMessage = 'User "test@example.com" has deleted list (123).';
      deleteListService.run.mockResolvedValue(mockSuccessMessage);

      // Act
      const result = await controller.deleteList(mockListId, mockDeleteRequest);

      // Assert
      expect(result).toBe(mockSuccessMessage);
      expect(deleteListService.run).toHaveBeenCalledWith(
        mockListId,
        mockDeleteRequest.organizationDatabase,
        mockDeleteRequest.organization_user_id
      );
    });

    it('should handle delete service errors', async () => {
      // Arrange
      const mockError = new Error('Delete failed');
      deleteListService.run.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.deleteList(mockListId, mockDeleteRequest)).rejects.toThrow(mockError);
      expect(deleteListService.run).toHaveBeenCalledWith(
        mockListId,
        mockDeleteRequest.organizationDatabase,
        mockDeleteRequest.organization_user_id
      );
    });

    it('should pass correct parameters to delete service', async () => {
      // Arrange
      const mockSuccessMessage = 'List deleted';
      deleteListService.run.mockResolvedValue(mockSuccessMessage);

      // Act
      await controller.deleteList(mockListId, mockDeleteRequest);

      // Assert
      expect(deleteListService.run).toHaveBeenCalledTimes(1);
      expect(deleteListService.run).toHaveBeenCalledWith(
        mockListId,
        mockDeleteRequest.organizationDatabase,
        mockDeleteRequest.organization_user_id
      );
    });
  });

  describe('validatePaginatedRequest', () => {
    it('should not throw when valid request is provided', () => {
      // Arrange
      const validRequest: getPaginatedListDataRequest = {
        listId: 123,
        organizationDatabase: 'test-org-db',
      };

      // Act & Assert
      expect(() => controller.validatePaginatedRequest(validRequest)).not.toThrow();
    });

    it('should throw BadRequestException for listId undefined', () => {
      // Arrange
      const invalidRequest: Partial<getPaginatedListDataRequest> = {
        listId: undefined,
        organizationDatabase: 'test-org-db',
      };

      // Act & Assert
      expect(() =>
        controller.validatePaginatedRequest(invalidRequest as getPaginatedListDataRequest)
      ).toThrow(new BadRequestException('listID is required'));
    });

    it('should throw BadRequestException for listId null', () => {
      // Arrange
      const invalidRequest = {
        listId: null as unknown as number,
        organizationDatabase: 'test-org-db',
      };

      // Act & Assert
      expect(() =>
        controller.validatePaginatedRequest(invalidRequest as getPaginatedListDataRequest)
      ).toThrow(new BadRequestException('listID is required'));
    });

    it('should throw BadRequestException for listId 0', () => {
      // Arrange
      const invalidRequest = {
        listId: 0,
        organizationDatabase: 'test-org-db',
      };

      // Act & Assert
      expect(() => controller.validatePaginatedRequest(invalidRequest)).toThrow(
        new BadRequestException('listID is required')
      );
    });

    it('should throw BadRequestException for organizationDatabase undefined', () => {
      // Arrange
      const invalidRequest: Partial<getPaginatedListDataRequest> = {
        listId: 123,
        organizationDatabase: undefined,
      };

      // Act & Assert
      expect(() =>
        controller.validatePaginatedRequest(invalidRequest as getPaginatedListDataRequest)
      ).toThrow(new BadRequestException('organizationDatabase is required'));
    });

    it('should throw BadRequestException for organizationDatabase null', () => {
      // Arrange
      const invalidRequest = {
        listId: 123,
        organizationDatabase: null as unknown as string,
      };

      // Act & Assert
      expect(() =>
        controller.validatePaginatedRequest(invalidRequest as getPaginatedListDataRequest)
      ).toThrow(new BadRequestException('organizationDatabase is required'));
    });

    it('should throw BadRequestException for organizationDatabase empty string', () => {
      // Arrange
      const invalidRequest = {
        listId: 123,
        organizationDatabase: '',
      };

      // Act & Assert
      expect(() => controller.validatePaginatedRequest(invalidRequest)).toThrow(
        new BadRequestException('organizationDatabase is required')
      );
    });

    it('should validate with all possible undefined combinations', () => {
      // Arrange & Act & Assert
      const undefinedRequest: Partial<getPaginatedListDataRequest> = {
        listId: undefined,
        organizationDatabase: undefined,
      };
      expect(() =>
        controller.validatePaginatedRequest(undefinedRequest as getPaginatedListDataRequest)
      ).toThrow(new BadRequestException('listID is required'));

      const nullRequest = {
        listId: null as unknown as number,
        organizationDatabase: null as unknown as string,
      };
      expect(() =>
        controller.validatePaginatedRequest(nullRequest as getPaginatedListDataRequest)
      ).toThrow(new BadRequestException('listID is required'));

      const zeroRequest = {
        listId: 0,
        organizationDatabase: '',
      };
      expect(() =>
        controller.validatePaginatedRequest(zeroRequest as getPaginatedListDataRequest)
      ).toThrow(new BadRequestException('listID is required'));
    });
  });
});
