/**
 * @jest-environment node
 */
const getAnalysisFromUserList = require('./getAnalysisFromUserList');
const ListManager = require('../../../../config/publicutils/listManager.utils');
const AnalysisManager = require('../../../../config/publicutils/analysisManager.utils');
const LocationManager = require('../../../../config/publicutils/locationManager.utils');
const _ = require('lodash');

// Mock ListManager
jest.mock('../../../../config/publicutils/listManager.utils', () => ({
  getListLocations: jest.fn(),
  getPaginatedAnalysisDataForUserList: jest.fn(),
}));

// Mock AnalysisManager
jest.mock('../../../../config/publicutils/analysisManager.utils', () => ({
  getListAnalyses: jest.fn(),
}));

// Mock LocationManager
jest.mock('../../../../config/publicutils/locationManager.utils', () => ({
  getLocationAttributesList: jest.fn(),
}));

jest.mock('lodash', () => ({
  pick: jest.fn(),
}));

let selectedList;

beforeEach(() => {
  selectedList = {
    id: 5583,
    user_id: 10033,
    list_locations_count: 998,
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('getAnalysisFromUserList', () => {
  it('should handle locationId and call getListLocations', async () => {
    const req = {
      body: {
        locationId: '678',
      },
      params: {
        listId: '5583',
      },
    };

    const listId = Number(req.params.listId);
    const locationId = Number(req.body.locationId);

    // Mock getListLocations
    ListManager.getListLocations.mockResolvedValue([
      {
        features: [],
      },
    ]);

    await getAnalysisFromUserList(req, selectedList);

    const SINGLE_LOCATION_ROW_REQUESTED = 1;
    expect(ListManager.getListLocations).toHaveBeenCalledWith(
      req,
      listId,
      locationId,
      SINGLE_LOCATION_ROW_REQUESTED
    );
  });

  it('should handle no locationId and call ListManager.getPaginatedAnalysisDataForUserList', async () => {
    const req = {
      body: {
        locationId: '',
      },
      params: {
        listId: '5583',
      },
    };
    const listId = Number(req.params.listId);
    const { list_locations_count: rowsRequested } = selectedList;
    // Mock ListManager
    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue([]);

    await getAnalysisFromUserList(req, selectedList);

    const DEFAULT_SELECTED_COUNTRY = '';
    const DEFAULT_COLUMNS_TO_RETURN = 'Latitude,Longitude,location_id';
    const DEFAULT_SELECTED_STATE = '';
    const DEFAULT_SELECTED_SUB_STATE = '';
    const DEFAULT_SELECTED_AREA_MIN = 0;
    const DEFAULT_SELECTED_AREA_MAX = null;

    const queryFilters = {
      listID: listId,
      orderType: 'asc',
      sortByAttribute: 'location_id',
      country: DEFAULT_SELECTED_COUNTRY,
      state: DEFAULT_SELECTED_STATE,
      subState: DEFAULT_SELECTED_SUB_STATE,
      analysisAreaMin: DEFAULT_SELECTED_AREA_MIN,
      analysisAreaMax: DEFAULT_SELECTED_AREA_MAX,
      columnsToReturn: DEFAULT_COLUMNS_TO_RETURN,
      pageSize: rowsRequested,
    };
    expect(ListManager.getPaginatedAnalysisDataForUserList).toHaveBeenNthCalledWith(
      1,
      req,
      listId,
      queryFilters
    );
  });

  it('should handle list analysis and call AnalysisManager.getListAnalyses', async () => {
    const req = {
      body: {
        locationId: '',
      },
      params: {
        listId: '5583',
      },
    };
    const listId = Number(req.params.listId);

    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue([]);
    AnalysisManager.getListAnalyses.mockResolvedValue([]);

    await getAnalysisFromUserList(req, selectedList);

    expect(AnalysisManager.getListAnalyses).toHaveBeenLastCalledWith(req, listId);
  });

  it('should handle list analisis data and call ListManager.getPaginatedAnalysisDataForUserList with no results', async () => {
    const req = {
      body: {
        locationId: '',
      },
      params: {
        listId: '5583',
      },
    };
    const listId = Number(req.params.listId);
    const { list_locations_count: rowsRequested } = selectedList;

    // mock values from previous former functions
    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue([]);
    AnalysisManager.getListAnalyses.mockResolvedValue([]);
    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue([]);

    await getAnalysisFromUserList(req, selectedList);

    const filters = {
      page: 1,
      pageSize: rowsRequested,
      orderType: 'desc',
      sortByAttribute: 'Investment Name',
      searchString: '',
    };
    expect(ListManager.getPaginatedAnalysisDataForUserList).toHaveBeenNthCalledWith(
      2,
      req,
      listId,
      filters
    );
  });

  it('should handle list analisis data and call ListManager.getPaginatedAnalysisDataForUserList with results and call LocationManager.getLocationAttributesList', async () => {
    const req = {
      body: {
        locationId: '678',
      },
      params: {
        listId: '5583',
      },
    };
    const listId = Number(req.params.listId);
    const { list_locations_count: rowsRequested } = selectedList;

    // mock values from previous former functions
    AnalysisManager.getListAnalyses.mockResolvedValue([]);
    const paginatedAnalysisDataSecondCallResolveValue = [
      {
        list_id: 5583,
        'Location Name': 'a999',
        Latitude: 8.709205,
        Longitude: 1.22138,
        'Analysis Radius': 0.054,
        'Analysis Area': 0.9140227272033692,
        Commodity: 'Cocoa',
        'Location Classification': 'supply shed',
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
        'Accuracy Rating of Location Entered': 0,
        Country: 'Togo',
        State: 'Centre',
        'Sub State': 'Tchaudjo',
        'Wind Barrier': '',
        'Riparian Buffers': '',
        'Buffer Zones': '',
        gadmid: 'TGO.1.3',
        flag_general: 0,
        flag_gran_chaco: 0,
        flag_glad: 0,
        flag_forma: 0,
        flag_viirs: 0,
        flag_terrai: 0,
        list_location_id: 999,
        analysis_list_id: 5583,
        template_id: 13,
        id: 999,
        location_id: 999,
        location_status_id: 2,
        tree_cover_loss_total_yearly: '{}',
        tree_cover_loss_primary_forest_yearly: '{}',
        tree_cover_loss_peat_yearly: '{}',
        tree_cover_loss_intact_forest_yearly: '{}',
        tree_cover_loss_protected_areas_yearly: '{}',
        tree_cover_loss_sea_landcover_yearly: '{}',
        tree_cover_loss_idn_landcover_yearly: '{}',
        tree_cover_loss_idn_primary_forest_yearly: '{}',
        tree_cover_loss_soy_yearly: '{}',
        tree_cover_loss_idn_legal_yearly: '{}',
        tree_cover_loss_idn_forest_moratorium_yearly: '{}',
        tree_cover_loss_prodes_yearly: '{}',
        tree_cover_loss_prodes_wdpa_yearly: '{}',
        tree_cover_loss_prodes_primary_forest_yearly: '{}',
        tree_cover_loss_brazil_biomes_yearly: '{}',
        tree_cover_extent_total: 0,
        tree_cover_extent_primary_forest: 0,
        tree_cover_extent_protected_areas: 0,
        tree_cover_extent_peat: 0,
        tree_cover_extent_intact_forest: 0,
        natural_habitat_primary: 0,
        natural_habitat_intact_forest: 0,
        natural_habitat_global_land_cover: '{}',
        total_area: 0.8367,
        protected_areas_area: 0,
        critical_habitat_alliance_zero: 0,
        indigenous_people_land_rights: 0,
        peat_area: 0,
        fires_counts_monthly: '',
        soy_total_area: '{}',
        soy_pre2001_nonforest_area: 0,
        brazil_biomes: '{}',
        idn_legal_area: '{}',
        sea_landcover_area: '{}',
        idn_landcover_area: '{}',
        idn_forest_moratorium_area: 0,
        south_america_presence: 'false',
        legal_amazon_presence: 'false',
        brazil_biomes_presence: 'false',
        cerrado_biome_presence: 'false',
        southeast_asia_presence: 'false',
        indonesia_presence: 'false',
        commodity_threat_deforestation_level:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_threat_peat_level:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_threat_protected_areas_level:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_threat_fires_level: '{}',
        commodity_threat_overall_level:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_threat_overall_score:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_value_forest_extent_level:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_value_peat_level:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_value_protected_areas_level:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_value_overall_level:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_value_overall_score:
          '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
        commodity_value_forest_extent:
          '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
        commodity_value_peat:
          '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
        commodity_value_protected_areas:
          '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
        commodity_mill_priority_level:
          '{"2010": 0, "2019": 0, "2004": 0, "2015": 0, "2017": 0, "2013": 0, "2014": 0, "2007": 0, "2020": 0, "2018": 0, "2009": 0, "2016": 0, "2006": 0, "2003": 0, "2012": 0, "2005": 0, "2002": 0, "2011": 0, "2008": 0}',
        commodity_mill_priority_score:
          '{"2010": 0, "2019": 0, "2004": 0, "2015": 0, "2017": 0, "2013": 0, "2014": 0, "2007": 0, "2020": 0, "2018": 0, "2009": 0, "2016": 0, "2006": 0, "2003": 0, "2012": 0, "2005": 0, "2002": 0, "2011": 0, "2008": 0}',
        commodity_threat_deforestation:
          '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
        commodity_threat_peat:
          '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
        commodity_threat_protected_areas:
          '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
        commodity_threat_fires: '{}',
        dissolved_data_location_info: '{}',
        tree_cover_loss_arg_otbn_yearly: '{}',
        arg_otbn_area: '{}',
        argentina_presence: 'false',
        protected_areas_by_category_area: '{}',
        landmark_by_category_area: '{}',
      },
    ];
    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue(
      paginatedAnalysisDataSecondCallResolveValue
    );
    LocationManager.getLocationAttributesList.mockResolvedValue([]);

    await getAnalysisFromUserList(req, selectedList);

    const filters = {
      page: 1,
      pageSize: rowsRequested,
      orderType: 'desc',
      sortByAttribute: 'Investment Name',
      searchString: '',
    };
    expect(ListManager.getPaginatedAnalysisDataForUserList).toHaveBeenCalledWith(
      req,
      listId,
      filters
    );
    expect(LocationManager.getLocationAttributesList).toHaveBeenCalledWith(
      req,
      paginatedAnalysisDataSecondCallResolveValue,
      false
    );
  });

  it.only('should handle errors', async () => {
    const req = {
      body: {
        locationId: '',
      },
      params: {
        listId: '5583',
      },
    };
    const errorMessage = 'Some error message';
    ListManager.getListLocations.mockRejectedValue(new Error(errorMessage));
    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue([]);

    const result = await getAnalysisFromUserList(req, selectedList);

    expect(result).toBeInstanceOf(Object);
  });
});
