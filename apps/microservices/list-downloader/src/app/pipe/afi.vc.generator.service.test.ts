import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AfiVcGeneratorService } from './afi.vc.generator.service';
import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { AfiGeometryService } from '../files';
import { UspGetListAnalysis } from '@wri-monorepos/sql';
import { ConfigService } from '@nestjs/config';
import { AnalysisDataService } from '../data';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

describe('AfiVcGeneratorService', () => {
  let service: AfiVcGeneratorService;
  let mockAnalysisAfiDataService: jest.Mocked<AnalysisAfiDataService>;
  let mockAfiGeometryService: jest.Mocked<AfiGeometryService>;
  let mockUspGetListAnalysis: jest.Mocked<UspGetListAnalysis>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockAnalysisDataService: jest.Mocked<AnalysisDataService>;

  beforeEach(async () => {
    mockAnalysisAfiDataService = {
      getNumberOfPages: jest.fn(),
      getDataPaginated: jest.fn(),
    } as unknown as jest.Mocked<AnalysisAfiDataService>;

    mockAfiGeometryService = {
      start: jest.fn(),
      process: jest.fn(),
      finish: jest.fn(),
    } as unknown as jest.Mocked<AfiGeometryService>;

    mockUspGetListAnalysis = {
      run: jest.fn(),
    } as unknown as jest.Mocked<UspGetListAnalysis>;

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockAnalysisDataService = {
      getDataPaginated: jest.fn(),
    } as unknown as jest.Mocked<AnalysisDataService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AfiVcGeneratorService,
        { provide: AnalysisAfiDataService, useValue: mockAnalysisAfiDataService },
        { provide: AfiGeometryService, useValue: mockAfiGeometryService },
        { provide: UspGetListAnalysis, useValue: mockUspGetListAnalysis },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AnalysisDataService, useValue: mockAnalysisDataService },
        { provide: Logger, useValue: new Logger() },
      ],
    }).compile();

    service = module.get<AfiVcGeneratorService>(AfiVcGeneratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log an error if the file type is invalid', async () => {
    const mockFilters: ListFieldsFileRequest = {
      file: 'invalid-file',
      type: 'invalid-type',
    } as any;

    const loggerSpy = jest.spyOn(service['logger'], 'error');

    await service.makeFile(mockFilters);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Service not found for type: invalid-type and file: invalid-file'
    );
  });

  it('should call all necessary methods in makeFile', async () => {
    const mockFilters: ListFieldsFileRequest = {
      file: 'shapefile',
      type: 'afiVC',
      listId: 123,
    } as any;

    mockAnalysisAfiDataService.getNumberOfPages.mockResolvedValue(2);
    mockAnalysisDataService.getDataPaginated.mockResolvedValue([
      {
        list_id: 0,
        'Location Name': '',
        Latitude: 0,
        Longitude: 0,
        'Analysis Radius': 0,
        'Analysis Area': 0,
        Commodity: '',
        'Location Classification': '',
        'Company ID': '',
        Volume: 0,
        'Owner Name': '',
        'Owner ID': '',
        'Company Name': '',
        'Supplier Name': '',
        'Facility Name': '',
        'Refinery Name': '',
        Certification: '',
        'Start Date': '',
        'End Date': '',
        'Time Horizon': '',
        'Accuracy Rating of Location Entered': '',
        Country: '',
        State: '',
        'Sub State': '',
        'Wind Barrier': '',
        'Riparian Buffers': '',
        'Buffers Zones': '',
        gadmid: '',
        flag_general: '',
        flag_gran_chaco: '',
        flag_glad: '',
        flag_forma: '',
        flag_viirs: '',
        flag_terrai: '',
        list_location_id: 0,
        analysis_list_id: 0,
        template_id: 0,
        id: 0,
        location_id: 0,
        location_status_id: 0,
        tree_cover_loss_total_yearly: '',
        tree_cover_loss_primary_forest_yearly: '',
        tree_cover_loss_peat_yearly: '',
        tree_cover_loss_intact_forest_yearly: '',
        tree_cover_loss_protected_areas_yearly: '',
        tree_cover_loss_sea_landcover_yearly: '',
        tree_cover_loss_idn_landcover_yearly: '',
        tree_cover_loss_idn_primary_forest_yearly: '',
        tree_cover_loss_soy_yearly: '',
        tree_cover_loss_idn_legal_yearly: '',
        tree_cover_loss_idn_forest_moratorium_yearly: '',
        tree_cover_loss_prodes_yearly: '',
        tree_cover_loss_prodes_wdpa_yearly: '',
        tree_cover_loss_prodes_primary_forest_yearly: '',
        tree_cover_loss_brazil_biomes_yearly: '',
        tree_cover_extent_total: 0,
        tree_cover_extent_primary_forest: 0,
        tree_cover_extent_protected_areas: 0,
        tree_cover_extent_peat: 0,
        tree_cover_extent_intact_forest: 0,
        natural_habitat_primary: 0,
        natural_habitat_intact_forest: 0,
        natural_habitat_global_land_cover: '',
        total_area: 0,
        protected_areas_area: 0,
        critical_habitat_alliance_zero: 0,
        indigenous_people_land_rights: 0,
        peat_area: 0,
        fires_counts_monthly: '',
        soy_total_area: '',
        soy_pre2001_nonforest_area: 0,
        brazil_biomes: '',
        idn_legal_area: '',
        sea_landcover_area: '',
        idn_landcover_area: '',
        idn_forest_moratorium_area: 0,
        south_america_presence: '',
        legal_amazon_presence: '',
        brazil_biomes_presence: '',
        cerrado_biome_presence: '',
        southeast_asia_presence: '',
        indonesia_presence: '',
        commodity_threat_deforestation_level: '',
        commodity_threat_peat_level: '',
        commodity_threat_protected_areas_level: '',
        commodity_threat_fires_level: '',
        commodity_threat_overall_level: '',
        commodity_threat_overall_score: '',
        commodity_value_forest_extent_level: '',
        commodity_value_peat_level: '',
        commodity_value_protected_areas_level: '',
        commodity_value_overall_level: '',
        commodity_value_overall_score: '',
        commodity_value_forest_extent: '',
        commodity_value_peat: '',
        commodity_value_protected_areas: '',
        commodity_mill_priority_level: '',
        commodity_mill_priority_score: '',
        commodity_threat_deforestation: '',
        commodity_threat_peat: '',
        commodity_threat_protected_areas: '',
        commodity_threat_fires: '',
        dissolved_data_location_info: '',
        tree_cover_loss_arg_otbn_yearly: '',
        arg_otbn_area: '',
      },
    ]);
    mockUspGetListAnalysis.run.mockResolvedValue([{}]);
    mockAfiGeometryService.finish.mockResolvedValueOnce();

    await service.makeFile(mockFilters);

    expect(mockAnalysisAfiDataService.getNumberOfPages).toHaveBeenCalledWith(mockFilters, 0);
    expect(mockAfiGeometryService.finish).toHaveBeenCalledWith(mockFilters);
  });

  it('should return fields from the first element of paginated data', async () => {
    const mockFilters: ListFieldsFileRequest = {
      listId: 123,
    } as any;

    mockAnalysisDataService.getDataPaginated.mockResolvedValue([
      {
        list_id: 0,
        'Location Name': '',
        Latitude: 0,
        Longitude: 0,
        'Analysis Radius': 0,
        'Analysis Area': 0,
        Commodity: '',
        'Location Classification': '',
        'Company ID': '',
        Volume: 0,
        'Owner Name': '',
        'Owner ID': '',
        'Company Name': '',
        'Supplier Name': '',
        'Facility Name': '',
        'Refinery Name': '',
        Certification: '',
        'Start Date': '',
        'End Date': '',
        'Time Horizon': '',
        'Accuracy Rating of Location Entered': '',
        Country: '',
        State: '',
        'Sub State': '',
        'Wind Barrier': '',
        'Riparian Buffers': '',
        'Buffers Zones': '',
        gadmid: '',
        flag_general: '',
        flag_gran_chaco: '',
        flag_glad: '',
        flag_forma: '',
        flag_viirs: '',
        flag_terrai: '',
        list_location_id: 0,
        analysis_list_id: 0,
        template_id: 0,
        id: 0,
        location_id: 0,
        location_status_id: 0,
        tree_cover_loss_total_yearly: '',
        tree_cover_loss_primary_forest_yearly: '',
        tree_cover_loss_peat_yearly: '',
        tree_cover_loss_intact_forest_yearly: '',
        tree_cover_loss_protected_areas_yearly: '',
        tree_cover_loss_sea_landcover_yearly: '',
        tree_cover_loss_idn_landcover_yearly: '',
        tree_cover_loss_idn_primary_forest_yearly: '',
        tree_cover_loss_soy_yearly: '',
        tree_cover_loss_idn_legal_yearly: '',
        tree_cover_loss_idn_forest_moratorium_yearly: '',
        tree_cover_loss_prodes_yearly: '',
        tree_cover_loss_prodes_wdpa_yearly: '',
        tree_cover_loss_prodes_primary_forest_yearly: '',
        tree_cover_loss_brazil_biomes_yearly: '',
        tree_cover_extent_total: 0,
        tree_cover_extent_primary_forest: 0,
        tree_cover_extent_protected_areas: 0,
        tree_cover_extent_peat: 0,
        tree_cover_extent_intact_forest: 0,
        natural_habitat_primary: 0,
        natural_habitat_intact_forest: 0,
        natural_habitat_global_land_cover: '',
        total_area: 0,
        protected_areas_area: 0,
        critical_habitat_alliance_zero: 0,
        indigenous_people_land_rights: 0,
        peat_area: 0,
        fires_counts_monthly: '',
        soy_total_area: '',
        soy_pre2001_nonforest_area: 0,
        brazil_biomes: '',
        idn_legal_area: '',
        sea_landcover_area: '',
        idn_landcover_area: '',
        idn_forest_moratorium_area: 0,
        south_america_presence: '',
        legal_amazon_presence: '',
        brazil_biomes_presence: '',
        cerrado_biome_presence: '',
        southeast_asia_presence: '',
        indonesia_presence: '',
        commodity_threat_deforestation_level: '',
        commodity_threat_peat_level: '',
        commodity_threat_protected_areas_level: '',
        commodity_threat_fires_level: '',
        commodity_threat_overall_level: '',
        commodity_threat_overall_score: '',
        commodity_value_forest_extent_level: '',
        commodity_value_peat_level: '',
        commodity_value_protected_areas_level: '',
        commodity_value_overall_level: '',
        commodity_value_overall_score: '',
        commodity_value_forest_extent: '',
        commodity_value_peat: '',
        commodity_value_protected_areas: '',
        commodity_mill_priority_level: '',
        commodity_mill_priority_score: '',
        commodity_threat_deforestation: '',
        commodity_threat_peat: '',
        commodity_threat_protected_areas: '',
        commodity_threat_fires: '',
        dissolved_data_location_info: '',
        tree_cover_loss_arg_otbn_yearly: '',
        arg_otbn_area: '',
      },
    ]);

    const result = await service['getListOfFields'](mockFilters);

    expect(mockAnalysisDataService.getDataPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, rowsPerPage: 1 })
    );
    expect(result).toEqual({
      fields: [
        'list_id',
        'Location Name',
        'Latitude',
        'Longitude',
        'Analysis Radius',
        'Analysis Area',
        'Commodity',
        'Location Classification',
        'Company ID',
        'Volume',
        'Owner Name',
        'Owner ID',
        'Company Name',
        'Supplier Name',
        'Facility Name',
        'Refinery Name',
        'Certification',
        'Start Date',
        'End Date',
        'Time Horizon',
        'Accuracy Rating of Location Entered',
        'Country',
        'State',
        'Sub State',
        'Wind Barrier',
        'Riparian Buffers',
        'Buffers Zones',
        'gadmid',
        'flag_general',
        'flag_gran_chaco',
        'flag_glad',
        'flag_forma',
        'flag_viirs',
        'flag_terrai',
        'list_location_id',
        'analysis_list_id',
        'template_id',
        'id',
        'location_id',
        'location_status_id',
        'tree_cover_loss_total_yearly',
        'tree_cover_loss_primary_forest_yearly',
        'tree_cover_loss_peat_yearly',
        'tree_cover_loss_intact_forest_yearly',
        'tree_cover_loss_protected_areas_yearly',
        'tree_cover_loss_sea_landcover_yearly',
        'tree_cover_loss_idn_landcover_yearly',
        'tree_cover_loss_idn_primary_forest_yearly',
        'tree_cover_loss_soy_yearly',
        'tree_cover_loss_idn_legal_yearly',
        'tree_cover_loss_idn_forest_moratorium_yearly',
        'tree_cover_loss_prodes_yearly',
        'tree_cover_loss_prodes_wdpa_yearly',
        'tree_cover_loss_prodes_primary_forest_yearly',
        'tree_cover_loss_brazil_biomes_yearly',
        'tree_cover_extent_total',
        'tree_cover_extent_primary_forest',
        'tree_cover_extent_protected_areas',
        'tree_cover_extent_peat',
        'tree_cover_extent_intact_forest',
        'natural_habitat_primary',
        'natural_habitat_intact_forest',
        'natural_habitat_global_land_cover',
        'total_area',
        'protected_areas_area',
        'critical_habitat_alliance_zero',
        'indigenous_people_land_rights',
        'peat_area',
        'fires_counts_monthly',
        'soy_total_area',
        'soy_pre2001_nonforest_area',
        'brazil_biomes',
        'idn_legal_area',
        'sea_landcover_area',
        'idn_landcover_area',
        'idn_forest_moratorium_area',
        'south_america_presence',
        'legal_amazon_presence',
        'brazil_biomes_presence',
        'cerrado_biome_presence',
        'southeast_asia_presence',
        'indonesia_presence',
        'commodity_threat_deforestation_level',
        'commodity_threat_peat_level',
        'commodity_threat_protected_areas_level',
        'commodity_threat_fires_level',
        'commodity_threat_overall_level',
        'commodity_threat_overall_score',
        'commodity_value_forest_extent_level',
        'commodity_value_peat_level',
        'commodity_value_protected_areas_level',
        'commodity_value_overall_level',
        'commodity_value_overall_score',
        'commodity_value_forest_extent',
        'commodity_value_peat',
        'commodity_value_protected_areas',
        'commodity_mill_priority_level',
        'commodity_mill_priority_score',
        'commodity_threat_deforestation',
        'commodity_threat_peat',
        'commodity_threat_protected_areas',
        'commodity_threat_fires',
        'dissolved_data_location_info',
        'tree_cover_loss_arg_otbn_yearly',
        'arg_otbn_area',
      ],
    });
  });
});
