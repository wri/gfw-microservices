import { Test, TestingModule } from '@nestjs/testing';
import { ListPaginationService } from './list.pagination.service';
import {
  UspGetAnalysisDataCountForUserList,
  UspGetPaginatedAnalysisDataForUserList,
  AnalysisDataType,
} from '@wri-monorepos/sql';
import { getPaginatedListDataRequest } from '../../models';

describe('ListPaginationService', () => {
  let service: ListPaginationService;
  let uspGetPaginatedAnalysisDataForUserList: jest.Mocked<UspGetPaginatedAnalysisDataForUserList>;
  let uspGetAnalysisDataCountForUserList: jest.Mocked<UspGetAnalysisDataCountForUserList>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPaginationService,
        {
          provide: UspGetPaginatedAnalysisDataForUserList,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: UspGetAnalysisDataCountForUserList,
          useValue: {
            run: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ListPaginationService>(ListPaginationService);
    uspGetPaginatedAnalysisDataForUserList = module.get(UspGetPaginatedAnalysisDataForUserList);
    uspGetAnalysisDataCountForUserList = module.get(UspGetAnalysisDataCountForUserList);
  });

  describe('getPaginatedListData', () => {
    it('should return paginated list data', async () => {
      const mockData: AnalysisDataType[] = [
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
          classified_region_area: '{"ARG":{"Category I":100,"Category II":200}}',
        },
      ];
      const queryParam: getPaginatedListDataRequest = {
        listId: 1,
        organizationDatabase: 'test-db',
        page: 0,
        rowsPerPage: 1000,
      };

      uspGetPaginatedAnalysisDataForUserList.run.mockResolvedValue(mockData);

      const result = await service.getPaginatedListData(queryParam);

      expect(result).toEqual(mockData);
      expect(uspGetPaginatedAnalysisDataForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
    });

    it('should return empty array when no data is found', async () => {
      const queryParam: getPaginatedListDataRequest = {
        listId: 1,
        organizationDatabase: 'test-db',
        page: 0,
        rowsPerPage: 1000,
      };

      uspGetPaginatedAnalysisDataForUserList.run.mockResolvedValue(null);

      const result = await service.getPaginatedListData(queryParam);

      expect(result).toEqual([]);
    });
  });

  describe('getNumberOfPagesPaginatedListData', () => {
    it('should return number of pages data successfully', async () => {
      const mockPagesResult = {
        numberOfPages: 3,
        numberOfResults: 25,
        maximumAnalysisAreaInTheList: 1500,
      };
      const queryParam = {
        listId: 1,
        organizationDatabase: 'test-db',
        rowsPerPage: 1000,
        analysisAreaMin: 100,
        analysisAreaMax: 2000,
        searchString: 'test search',
      };

      uspGetAnalysisDataCountForUserList.run.mockResolvedValue(mockPagesResult);

      const result = await service.getNumberOfPagesPaginatedListData(queryParam);

      expect(result).toEqual(mockPagesResult);
      expect(uspGetAnalysisDataCountForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
    });

    it('should return empty array when no pages data is found', async () => {
      const queryParam = {
        listId: 1,
        organizationDatabase: 'test-db',
        rowsPerPage: 1000,
      };

      uspGetAnalysisDataCountForUserList.run.mockResolvedValue(null);

      const result = await service.getNumberOfPagesPaginatedListData(queryParam);

      expect(result).toEqual([]);
      expect(uspGetAnalysisDataCountForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
    });

    it('should handle minimal query parameters', async () => {
      const mockPagesResult = {
        numberOfPages: 1,
        numberOfResults: 5,
        maximumAnalysisAreaInTheList: 500,
      };
      const queryParam = {
        listId: 2,
        organizationDatabase: 'minimal-test-db',
        rowsPerPage: 1000,
      };

      uspGetAnalysisDataCountForUserList.run.mockResolvedValue(mockPagesResult);

      const result = await service.getNumberOfPagesPaginatedListData(queryParam);

      expect(result).toEqual(mockPagesResult);
      expect(uspGetAnalysisDataCountForUserList.run).toHaveBeenCalledWith(
        'minimal-test-db',
        queryParam
      );
    });

    it('should handle optional parameters correctly', async () => {
      const mockPagesResult = {
        numberOfPages: 2,
        numberOfResults: 15,
        maximumAnalysisAreaInTheList: 800,
      };
      const queryParam = {
        listId: 3,
        organizationDatabase: 'optional-test-db',
        rowsPerPage: 1000,
        subState: 'test-substate',
        analysisAreaMin: 50,
        analysisAreaMax: 1000,
        searchString: 'optional search',
      };

      uspGetAnalysisDataCountForUserList.run.mockResolvedValue(mockPagesResult);

      const result = await service.getNumberOfPagesPaginatedListData(queryParam);

      expect(result).toEqual(mockPagesResult);
      expect(uspGetAnalysisDataCountForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
    });
  });

  describe('getPaginatedListDataWithPages', () => {
    it('should return paginated list data with pages', async () => {
      const mockData: AnalysisDataType[] = [
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
          classified_region_area: '{"ARG":{"Category I":100,"Category II":200}}',
        },
      ];
      const queryParam: getPaginatedListDataRequest = {
        listId: 1,
        organizationDatabase: 'test-db',
        page: 0,
        rowsPerPage: 1000,
      };

      uspGetPaginatedAnalysisDataForUserList.run.mockResolvedValue(mockData);
      uspGetAnalysisDataCountForUserList.run.mockResolvedValue({
        numberOfPages: 1,
        numberOfResults: 1,
        maximumAnalysisAreaInTheList: 100,
      });

      const result = await service.getPaginatedListDataWithPages(queryParam);

      expect(result).toEqual({
        data: mockData,
        pages: {
          numberOfPages: 1,
          numberOfResults: 1,
          maximumAnalysisAreaInTheList: 100,
        },
      });
      expect(uspGetPaginatedAnalysisDataForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
      expect(uspGetAnalysisDataCountForUserList.run).toHaveBeenCalledWith(
        queryParam.organizationDatabase,
        queryParam
      );
    });

    it('should return empty array when no data is found', async () => {
      const queryParam: getPaginatedListDataRequest = {
        listId: 1,
        organizationDatabase: 'test-db',
        page: 0,
        rowsPerPage: 1000,
      };

      uspGetPaginatedAnalysisDataForUserList.run.mockResolvedValue(null);
      uspGetAnalysisDataCountForUserList.run.mockResolvedValue({
        numberOfPages: 0,
        numberOfResults: 0,
        maximumAnalysisAreaInTheList: 0,
      });

      const result = await service.getPaginatedListDataWithPages(queryParam);

      expect(result).toEqual({
        data: [],
        pages: {
          numberOfPages: 0,
          numberOfResults: 0,
          maximumAnalysisAreaInTheList: 0,
        },
      });
    });
  });
});
