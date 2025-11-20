/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */

const path = require('path');
const sql = require('mssql');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));

/**
 * @description - function that uses a procedure to return the values to populate
 * the filters of specific list.
 * */
const addCountry = (item, listRecord) => {
  const localListRecord = { ...listRecord };
  if (!Object.prototype.hasOwnProperty.call(localListRecord, item.Country)) {
    localListRecord[item.Country] = {};
  }
  return localListRecord;
};

const addState = (item, listRecord) => {
  const localListRecord = { ...listRecord };
  if (!Object.prototype.hasOwnProperty.call(listRecord[item.Country], item.State)) {
    localListRecord[item.Country][item.State] = [];
  }
  return localListRecord;
};

// TODO: check if exists other callsites, otherwise this is deprecated
const getListDataFilterValues = (request, listID) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];
    sqlUtils
      .executeOrganizationStoredProcedure(request, 'uspGetAdminAreas', parameters)
      .then((recordsets) => {
        let listRecord = {};
        for (let i = 0; i < recordsets.length; i += 1) {
          const item = recordsets[i];
          listRecord = addCountry(item, listRecord);
          listRecord = addState(item, listRecord);
          listRecord[item.Country][item.State].push(item['Sub State']);
        }
        resolve(listRecord);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          request,
          errorUtils.ERROR_CODES.failedToGetList,
          `Failed to build fiter data for list location for List ${listID}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * @summary this function is an extraction of the getListDataFilterValues for formatting filter countries
 * @param {Array} listLocations array of locations with fields [Country, State, 'Sub State']
 */
const formatListLocationDataForFilter = (listLocations) => {
  let listRecord = {};

  for (let i = 0; i < listLocations.length; i += 1) {
    const item = listLocations[i];

    // Initialize country if it doesn't exist
    if (!listRecord[item.Country]) {
      listRecord[item.Country] = new Map(); // Use Map for unique States within each Country
    }

    // Initialize state within the country if it doesn't exist
    if (!listRecord[item.Country].has(item.State)) {
      listRecord[item.Country].set(item.State, new Set()); // Use Set for unique Sub States within each State
    }

    // Add the Sub State to the Set within the specific State
    listRecord[item.Country].get(item.State).add(item['Sub State']);
  }

  // Convert Maps and Sets to objects and arrays for final output
  const formattedListRecord = {};
  for (const country in listRecord) {
    formattedListRecord[country] = {};
    for (const [state, subStates] of listRecord[country]) {
      formattedListRecord[country][state] = Array.from(subStates); // Convert Set to array
    }
  }

  return formattedListRecord;
};

const mapCommodityRiskValuesToDatabaseValues = (arr) => {
  const map = {
    low: 0,
    medium: 1,
    high: 2,
  };
  return arr?.map((item) => map[item]);
};

const mockAlertsAnalysisResponse = {
  list_analysis: [
    {
      id: 8311,
      list_id: 8501,
      status_id: 2,
      analysis_success_count: 0,
      analysis_fail_count: 0,
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
      total_area: 0.9633,
      protected_areas_area: 0,
      critical_habitat_alliance_zero: 0,
      indigenous_people_land_rights: 0,
      peat_area: 0,
      fires_counts_monthly: '{}',
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
      commodity_threat_deforestation_level: '{}',
      commodity_threat_peat_level: '{}',
      commodity_threat_protected_areas_level: '{}',
      commodity_threat_fires_level: '{}',
      commodity_threat_overall_level: '{}',
      commodity_threat_overall_score: '{}',
      commodity_value_forest_extent_level: '{}',
      commodity_value_peat_level: '{}',
      commodity_value_protected_areas_level: '{}',
      commodity_value_overall_level: '{}',
      commodity_value_overall_score: '{}',
      commodity_value_forest_extent:
        '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0,"2023":0.0}',
      commodity_value_peat:
        '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0,"2023":0.0}',
      commodity_value_protected_areas:
        '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0,"2023":0.0}',
      commodity_mill_priority_level: '{}',
      commodity_mill_priority_score: '{}',
      commodity_threat_deforestation:
        '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0,"2023":0.0}',
      commodity_threat_peat:
        '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0,"2023":0.0}',
      commodity_threat_protected_areas:
        '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0,"2023":0.0}',
      commodity_threat_fires: '{}',
      dissolved_geom_object_key:
        's3://gfwpro-geotrellis-pre-data/latest/dissolved/633a9c8b61ec451196553ebd15d351f7_20250725202601.geojson',
      tree_cover_loss_arg_otbn_yearly: '{}',
      arg_otbn_area: '{}',
      argentina_presence: 'false',
      protected_areas_by_category_area: '{}',
      landmark_by_category_area: '{}',
      country_specific_deforestation_yearly: '{}',
      country_specific_deforestation_wdpa_yearly: '{}',
      country_specific_deforestation_landmark_yearly: '{}',
      country_specific_deforestation_classified_region_yearly: '{}',
      tree_cover_loss_by_country_yearly: '{}',
      tree_cover_loss_by_country_wdpa_yearly: '{}',
      tree_cover_loss_by_country_landmark_yearly: '{}',
      country_area: '{}',
      classified_region_area: '{}',
      tree_cover_loss_by_country_classified_region_yearly: '{}',
    },
  ],
  location_analyses: [
    {
      list_id: 8501,
      'Location Name': 'Loc 1',
      Latitude: -23.4469551,
      Longitude: -46.5842973,
      'Analysis Radius': 1,
      'Analysis Area': 1,
      Commodity: 'cocoa',
      Country: null,
      State: null,
      'Sub State': null,
      gadmid: 'BRA.25.564',
      attributes:
        '{"Accuracy Rating of Location Entered":"3","flag_general":"0","flag_gran_chaco":"0","flag_glad":"0","flag_forma":"0","flag_viirs":"0","flag_terrai":"0"}',
      ErrorDetails: '',
      list_location_id: 4,
      analysis_list_id: 8501,
      template_id: 0,
      location_id: 4,
      location_status_id: 1,
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
      total_area: 0,
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
      commodity_threat_deforestation_level: '{}',
      commodity_threat_peat_level: '{}',
      commodity_threat_protected_areas_level: '{}',
      commodity_threat_fires_level: '{}',
      commodity_threat_overall_level: '{}',
      commodity_value_forest_extent_level: '{}',
      commodity_value_peat_level: '{}',
      commodity_value_protected_areas_level: '{}',
      commodity_value_overall_level: '{}',
      commodity_value_forest_extent: '{}',
      commodity_value_peat: '{}',
      commodity_value_protected_areas: '{}',
      commodity_mill_priority_level: '{}',
      commodity_mill_priority_score: '{}',
      commodity_value_overall_score: '{}',
      commodity_threat_deforestation: '{}',
      commodity_threat_peat: '{}',
      commodity_threat_protected_areas: '{}',
      commodity_threat_fires: '{}',
      commodity_threat_overall_score: '{}',
      dissolved_data_location_info: '{}',
      tree_cover_loss_arg_otbn_yearly: '{}',
      arg_otbn_area: '{}',
      argentina_presence: 'false',
      protected_areas_by_category_area: '{}',
      landmark_by_category_area: '{}',
      country_specific_deforestation_yearly: null,
      country_specific_deforestation_wdpa_yearly: null,
      country_specific_deforestation_landmark_yearly: null,
      country_specific_deforestation_classified_region_yearly: null,
      tree_cover_loss_by_country_yearly: null,
      tree_cover_loss_by_country_wdpa_yearly: null,
      tree_cover_loss_by_country_landmark_yearly: null,
      country_area: null,
      classified_region_area: null,
      tree_cover_loss_by_country_classified_region_yearly: null,
      location_error: null,
      threat_deforestation_cs: null,
      commodity_threat_deforestation_level_parsed: null,
      threat_peat_cs: null,
      commodity_threat_peat_level_parsed: null,
      threat_protected_areas_cs: null,
      commodity_threat_protected_areas_level_parsed: null,
      threat_fires_cs: null,
      commodity_threat_fires_level_parsed: null,
      value_forest_extent_cs: null,
      commodity_value_forest_extent_level_parsed: null,
      value_peat_cs: null,
      commodity_value_peat_level_parsed: null,
      value_protected_areas_cs: null,
      commodity_value_protected_areas_level_parsed: null,
      value_overall_cs: null,
      commodity_value_overall_level_parsed: null,
      threat_overall_cs: null,
      commodity_threat_overall_level_parsed: null,
      mill_priority_cs: null,
      commodity_mill_priority_level_parsed: null,
    },
    {
      list_id: 8501,
      'Location Name': 'Loc 2',
      Latitude: -23.4469551,
      Longitude: -46.5842973,
      'Analysis Radius': 1,
      'Analysis Area': 1,
      Commodity: 'cocoa',
      Country: null,
      State: null,
      'Sub State': null,
      gadmid: 'BRA.25.564',
      attributes:
        '{"Accuracy Rating of Location Entered":"3","flag_general":"0","flag_gran_chaco":"0","flag_glad":"0","flag_forma":"0","flag_viirs":"0","flag_terrai":"0"}',
      ErrorDetails: '',
      list_location_id: 5,
      analysis_list_id: 8501,
      template_id: 0,
      location_id: 5,
      location_status_id: 1,
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
      total_area: 0,
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
      commodity_threat_deforestation_level: '{}',
      commodity_threat_peat_level: '{}',
      commodity_threat_protected_areas_level: '{}',
      commodity_threat_fires_level: '{}',
      commodity_threat_overall_level: '{}',
      commodity_value_forest_extent_level: '{}',
      commodity_value_peat_level: '{}',
      commodity_value_protected_areas_level: '{}',
      commodity_value_overall_level: '{}',
      commodity_value_forest_extent: '{}',
      commodity_value_peat: '{}',
      commodity_value_protected_areas: '{}',
      commodity_mill_priority_level: '{}',
      commodity_mill_priority_score: '{}',
      commodity_value_overall_score: '{}',
      commodity_threat_deforestation: '{}',
      commodity_threat_peat: '{}',
      commodity_threat_protected_areas: '{}',
      commodity_threat_fires: '{}',
      commodity_threat_overall_score: '{}',
      dissolved_data_location_info: '{}',
      tree_cover_loss_arg_otbn_yearly: '{}',
      arg_otbn_area: '{}',
      argentina_presence: 'false',
      protected_areas_by_category_area: '{}',
      landmark_by_category_area: '{}',
      country_specific_deforestation_yearly: null,
      country_specific_deforestation_wdpa_yearly: null,
      country_specific_deforestation_landmark_yearly: null,
      country_specific_deforestation_classified_region_yearly: null,
      tree_cover_loss_by_country_yearly: null,
      tree_cover_loss_by_country_wdpa_yearly: null,
      tree_cover_loss_by_country_landmark_yearly: null,
      country_area: null,
      classified_region_area: null,
      tree_cover_loss_by_country_classified_region_yearly: null,
      location_error: null,
      threat_deforestation_cs: null,
      commodity_threat_deforestation_level_parsed: null,
      threat_peat_cs: null,
      commodity_threat_peat_level_parsed: null,
      threat_protected_areas_cs: null,
      commodity_threat_protected_areas_level_parsed: null,
      threat_fires_cs: null,
      commodity_threat_fires_level_parsed: null,
      value_forest_extent_cs: null,
      commodity_value_forest_extent_level_parsed: null,
      value_peat_cs: null,
      commodity_value_peat_level_parsed: null,
      value_protected_areas_cs: null,
      commodity_value_protected_areas_level_parsed: null,
      value_overall_cs: null,
      commodity_value_overall_level_parsed: null,
      threat_overall_cs: null,
      commodity_threat_overall_level_parsed: null,
      mill_priority_cs: null,
      commodity_mill_priority_level_parsed: null,
    },
    {
      list_id: 8501,
      'Location Name': 'Loc 3',
      Latitude: -23.4469551,
      Longitude: -46.5842973,
      'Analysis Radius': 1,
      'Analysis Area': 1,
      Commodity: 'cocoa',
      Country: null,
      State: null,
      'Sub State': null,
      gadmid: 'BRA.25.564',
      attributes:
        '{"Accuracy Rating of Location Entered":"3","flag_general":"0","flag_gran_chaco":"0","flag_glad":"0","flag_forma":"0","flag_viirs":"0","flag_terrai":"0"}',
      ErrorDetails: '',
      list_location_id: 6,
      analysis_list_id: 8501,
      template_id: 0,
      location_id: 6,
      location_status_id: 1,
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
      total_area: 0,
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
      commodity_threat_deforestation_level: '{}',
      commodity_threat_peat_level: '{}',
      commodity_threat_protected_areas_level: '{}',
      commodity_threat_fires_level: '{}',
      commodity_threat_overall_level: '{}',
      commodity_value_forest_extent_level: '{}',
      commodity_value_peat_level: '{}',
      commodity_value_protected_areas_level: '{}',
      commodity_value_overall_level: '{}',
      commodity_value_forest_extent: '{}',
      commodity_value_peat: '{}',
      commodity_value_protected_areas: '{}',
      commodity_mill_priority_level: '{}',
      commodity_mill_priority_score: '{}',
      commodity_value_overall_score: '{}',
      commodity_threat_deforestation: '{}',
      commodity_threat_peat: '{}',
      commodity_threat_protected_areas: '{}',
      commodity_threat_fires: '{}',
      commodity_threat_overall_score: '{}',
      dissolved_data_location_info: '{}',
      tree_cover_loss_arg_otbn_yearly: '{}',
      arg_otbn_area: '{}',
      argentina_presence: 'false',
      protected_areas_by_category_area: '{}',
      landmark_by_category_area: '{}',
      country_specific_deforestation_yearly: null,
      country_specific_deforestation_wdpa_yearly: null,
      country_specific_deforestation_landmark_yearly: null,
      country_specific_deforestation_classified_region_yearly: null,
      tree_cover_loss_by_country_yearly: null,
      tree_cover_loss_by_country_wdpa_yearly: null,
      tree_cover_loss_by_country_landmark_yearly: null,
      country_area: null,
      classified_region_area: null,
      tree_cover_loss_by_country_classified_region_yearly: null,
      location_error: null,
      threat_deforestation_cs: null,
      commodity_threat_deforestation_level_parsed: null,
      threat_peat_cs: null,
      commodity_threat_peat_level_parsed: null,
      threat_protected_areas_cs: null,
      commodity_threat_protected_areas_level_parsed: null,
      threat_fires_cs: null,
      commodity_threat_fires_level_parsed: null,
      value_forest_extent_cs: null,
      commodity_value_forest_extent_level_parsed: null,
      value_peat_cs: null,
      commodity_value_peat_level_parsed: null,
      value_protected_areas_cs: null,
      commodity_value_protected_areas_level_parsed: null,
      value_overall_cs: null,
      commodity_value_overall_level_parsed: null,
      threat_overall_cs: null,
      commodity_threat_overall_level_parsed: null,
      mill_priority_cs: null,
      commodity_mill_priority_level_parsed: null,
    },
  ],
  numberOfPages: 1,
  numberOfResults: 7,
  maximumAnalysisAreaInTheList: 0.9633,
};

module.exports = {
  getListDataFilterValues,
  formatListLocationDataForFilter,
  mapCommodityRiskValuesToDatabaseValues,
  mockAlertsAnalysisResponse,
};
