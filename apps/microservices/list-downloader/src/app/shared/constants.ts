/*
  Templates corresponding to template_id numbers:
  1 Investment
  2 Palm Oil Mill
  3 Palm Oil Plantation
  4 Palm Smallholder Farm
  5 Palm Oil Generic
  6 Soy Silo
  7 Soy Farm
  8 Soy Generic
  9 Beef Slaughterhouse
  10 Cattle Ranch
  11 Cattle Generic
  12 Cocoa Farm
  13 Cocoa Generic
  14 Other
*/
export const SELECTED_TIMEFRAME_DAY = 'DAY';
export const SELECTED_TIMEFRAME_WEEK = 'WEEK';
export const SELECTED_TIMEFRAME_MONTH = 'MONTH';
export const SELECTED_TIMEFRAME_QUARTER = 'QUARTER';
export const SELECTED_TIMEFRAME_YEAR = 'YEAR';
export const SELECTED_ALERT_INTEGRATED = 'Integrated';

// number of threads that will be used to process the data
export const POOL_SIZE = 5;
export const MAX_NUMBER_OF_ROWS_PER_PAGE = 5000;

export const DATE_FORMAT_CSV = 'dd MMM yyyy';
export const DATE_FORMAT = 'yyyy-MM-dd';

export const ALERTS_PRIORITIES_LOCATION_LEVEL = 'AlertsPriorities_LocationsLevel';
export const ALERTS_LOCATION_LEVEL = 'Alerts_LocationsLevel';
export const ALERTS_LOCATION_LEVEL_DAILY = 'Alerts_LocationsLevel_Daily';

export const templateColumns = {
  COMMODITY_GENERIC: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Commodity',
    'Country',
    'State',
    'Sub State',
    'gadmid',
  ],
};

export const resultColumns = {
  tree_cover_extent_total: 'Tree Cover Extent Total',
  tree_cover_extent_primary_forest: 'Tree Cover Extent Primary Forest',
  tree_cover_extent_protected_areas: 'Tree Cover Extent Protected Areas',
  total_area: 'Total Area',
};

export const errorCodes = {
  failedToGetList: 604,
};

export const EXCEL_TEMPLATES = {
  aggregate: [
    {
      name: 'total_area',
      parsed: 'total',
    },
    {
      name: 'tree_cover_extent_intact_forest',
      parsed: 'total',
    },
    {
      name: 'peat_area',
      parsed: 'total',
    },
    {
      name: 'protected_areas_area',
      parsed: 'total',
    },
  ],
  forestLoss: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      parsed: 'yearly',
      composites: [
        {
          attribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Loss',
          following: {
            attribute: 'tree_cover_loss_total_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_primary_forest_yearly',
          label: 'Primary Forest',
          following: {
            attribute: 'tree_cover_loss_primary_forest_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_protected_areas_yearly',
          label: 'Protected Areas',
          following: {
            attribute: 'tree_cover_loss_protected_areas_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_peat_yearly',
          label: 'Peat',
          following: {
            attribute: 'tree_cover_loss_peat_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_intact_forest_yearly',
          label: 'Intact Forest Landscapes',
          following: {
            attribute: 'tree_cover_loss_intact_forest_yearly',
            parsed: 'total',
          },
        },
      ],
    },
  ],
  forestLossAggregate: [
    {
      parsed: 'yearly',
      composites: [
        {
          attribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Loss',
        },
        {
          attribute: 'tree_cover_loss_primary_forest_yearly',
          label: 'Primary Forest',
        },
        {
          attribute: 'tree_cover_loss_protected_areas_yearly',
          label: 'Protected Areas',
        },
        { attribute: 'tree_cover_loss_peat_yearly', label: 'Peat' },
        {
          attribute: 'tree_cover_loss_intact_forest_yearly',
          label: 'Intact Forest Landscapes',
        },
      ],
    },
  ],
  historicPercent: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      parsed: 'percent',
      numerators: [
        {
          extentAttribute: 'tree_cover_extent_total',
          tclAttribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Extent',
        },
        {
          extentAttribute: 'tree_cover_extent_primary_forest',
          tclAttribute: 'tree_cover_loss_primary_forest_yearly',
          label: 'Primary Forest',
        },
        {
          extentAttribute: 'tree_cover_extent_protected_areas',
          tclAttribute: 'tree_cover_loss_protected_areas_yearly',
          label: 'Protected Areas',
        },
        {
          extentAttribute: 'tree_cover_extent_peat',
          tclAttribute: 'tree_cover_loss_peat_yearly',
          label: 'Peat',
        },
        {
          extentAttribute: 'tree_cover_extent_intact_forest',
          tclAttribute: 'tree_cover_loss_intact_forest_yearly',
          label: 'Intact Forest Landscapes',
        },
      ],
      following: [
        {
          attribute: 'tree_cover_loss_total_yearly',
          parsed: 'total',
        },
        {
          attribute: 'tree_cover_loss_total_yearly',
          parsed: 'percent',
        },
      ],
    },
  ],
  historicPercentAggregate: [
    {
      parsed: 'percent',
      numerators: [
        {
          extentAttribute: 'tree_cover_extent_total',
          tclAttribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Extent',
        },
        {
          extentAttribute: 'tree_cover_extent_primary_forest',
          tclAttribute: 'tree_cover_loss_primary_forest_yearly',
          label: 'Primary Forest',
        },
        {
          extentAttribute: 'tree_cover_extent_protected_areas',
          tclAttribute: 'tree_cover_loss_protected_areas_yearly',
          label: 'Protected Areas',
        },
        {
          extentAttribute: 'tree_cover_extent_peat',
          tclAttribute: 'tree_cover_loss_peat_yearly',
          label: 'Peat',
        },
        {
          extentAttribute: 'tree_cover_extent_intact_forest',
          tclAttribute: 'tree_cover_loss_intact_forest_yearly',
          label: 'Intact Forest Landscapes',
        },
      ],
    },
  ],
  forestChangeDiagnosticLocationSummary: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'Country',
      parsed: 'overhead',
    },
    {
      name: 'State',
      parsed: 'overhead',
    },
    {
      name: 'forestChangeDiagnosticLocationSummary',
      parsed: 'overhead',
      fields: [
        { attribute: 'tree_cover_extent_total', parsed: 'percent' },
        { attribute: 'tree_cover_extent_total', parsed: 'aggregate' },
        { attribute: 'natural_habitat_primary', parsed: 'percent' },
        { attribute: 'natural_habitat_primary', parsed: 'aggregate' },
        { attribute: 'protected_areas_area', parsed: 'percent' },
        { attribute: 'protected_areas_area', parsed: 'aggregate' },
        { attribute: 'peat_area', parsed: 'percent' },
        { attribute: 'peat_area', parsed: 'aggregate' },
        { attribute: 'natural_habitat_intact_forest', parsed: 'percent' },
        { attribute: 'natural_habitat_intact_forest', parsed: 'aggregate' },
      ],
      additionalFields: [
        { attribute: 'Volume', parsed: 'aggregate' },
        { attribute: 'Company ID', parsed: 'aggregate' },
        { attribute: 'Refinery Name', parsed: 'aggregate' },
        { attribute: 'Supplier Name', parsed: 'aggregate' },
        { attribute: 'Second Refinery Name', parsed: 'aggregate' },
        { attribute: 'Second Supplier Name', parsed: 'aggregate' },
        { attribute: 'total_area', parsed: 'aggregate' },
      ],
    },
  ],
  commodityRiskDiagnosticLocationSummary: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'Country',
      parsed: 'overhead',
    },
    {
      name: 'State',
      parsed: 'overhead',
    },
    {
      name: 'commodityRiskDiagnosticLocationSummary',
      parsed: 'overhead',
      fields: [
        { attribute: 'tree_cover_extent_total', parsed: 'percent' },
        { attribute: 'tree_cover_extent_total', parsed: 'aggregate' },
        { attribute: 'natural_habitat_primary', parsed: 'percent' },
        { attribute: 'natural_habitat_primary', parsed: 'aggregate' },
        { attribute: 'protected_areas_area', parsed: 'percent' },
        { attribute: 'protected_areas_area', parsed: 'aggregate' },
        { attribute: 'peat_area', parsed: 'percent' },
        { attribute: 'peat_area', parsed: 'aggregate' },
        { attribute: 'natural_habitat_intact_forest', parsed: 'percent' },
        { attribute: 'natural_habitat_intact_forest', parsed: 'aggregate' },
      ],
      additionalFields: [
        { attribute: 'Volume', parsed: 'aggregate' },
        { attribute: 'Company ID', parsed: 'aggregate' },
        { attribute: 'Refinery Name', parsed: 'aggregate' },
        { attribute: 'Supplier Name', parsed: 'aggregate' },
        { attribute: 'Second Refinery Name', parsed: 'aggregate' },
        { attribute: 'Second Supplier Name', parsed: 'aggregate' },
        { attribute: 'Parent Company', parsed: 'aggregate' },
        { attribute: 'Certification', parsed: 'aggregate' },
        { attribute: 'total_area', parsed: 'aggregate' },
      ],
    },
  ],
  sAmericaSoy: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'soy',
      parsed: 'overhead',
    },
  ],
  sAmericaLoss: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      parsed: 'yearly',
      composites: [
        {
          attribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Loss',
          following: {
            attribute: 'tree_cover_loss_total_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_brazil_biomes_yearly',
          label: 'Brazil Biomes',
          following: {
            attribute: 'tree_cover_loss_brazil_biomes_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_prodes_yearly',
          label: 'PRODES',
          following: {
            attribute: 'tree_cover_loss_prodes_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_soy_yearly',
          label: 'Soy on Tree Cover Loss',
          following: {
            attribute: 'tree_cover_loss_soy_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_prodes_primary_forest_yearly',
          label: 'Primary Forest',
          following: {
            attribute: 'tree_cover_loss_prodes_primary_forest_yearly',
            parsed: 'total',
          },
        },
        {
          attribute: 'tree_cover_loss_prodes_wdpa_yearly',
          label: 'Protected Areas',
          following: {
            attribute: 'tree_cover_loss_prodes_wdpa_yearly',
            parsed: 'total',
          },
        },
      ],
    },
  ],
  sAmericaLossAggregate: [
    {
      parsed: 'yearly',
      composites: [
        {
          attribute: 'tree_cover_loss_soy_yearly',
          label: 'Soy on Tree Cover Loss',
        },
        {
          attribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Loss',
        },
        {
          attribute: 'tree_cover_loss_brazil_biomes_yearly',
          label: 'Brazil Biomes',
        },
        { attribute: 'tree_cover_loss_prodes_yearly', label: 'PRODES' },
        {
          attribute: 'tree_cover_loss_prodes_primary_forest_yearly',
          label: 'Primary Forest',
        },
        {
          attribute: 'tree_cover_loss_prodes_wdpa_yearly',
          label: 'Protected Areas',
        },
      ],
    },
  ],
  sAmericaBiomes: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'data_layer',
      parsed: 'overhead',
    },
  ],
  sAmericaBiomesAggregate: [
    {
      name: 'arg_otbn_area',
      parsed: 'overhead',
    },
    {
      name: 'brazil_biomes',
      parsed: 'overhead',
    },
  ],
  seAsiaAll: [
    {
      name: 'total_area',
      parsed: 'total',
    },
    {
      name: 'tree_cover_extent_intact_forest',
      parsed: 'total',
    },
    {
      name: 'peat_area',
      parsed: 'total',
    },
    {
      name: 'protected_areas_area',
      parsed: 'total',
    },
  ],
  seAsiaTCL: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      parsed: 'yearly',
      composites: [
        {
          attribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Loss',
        },
        {
          attribute: 'tree_cover_loss_sea_landcover_yearly',
          label: 'Southeast Asia Landcover',
        },
        {
          attribute: 'tree_cover_loss_idn_landcover_yearly',
          label: 'Indonesia Landcover',
        },
        {
          attribute: 'tree_cover_loss_idn_legal_yearly',
          label: 'Indonesia Legal Classification',
        },
        {
          attribute: 'tree_cover_loss_idn_forest_moratorium_yearly',
          label: 'Indonesia Forest Moratorium',
        },
        {
          attribute: 'tree_cover_loss_idn_primary_forest_yearly',
          label: 'Primary Forest',
        },
      ],
      following: [
        {
          attribute: 'tree_cover_loss_total_yearly',
          parsed: 'total',
        },
      ],
    },
  ],
  seAsiaTCLAggregate: [
    {
      parsed: 'yearly',
      composites: [
        {
          attribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Loss',
        },
        {
          attribute: 'tree_cover_loss_sea_landcover_yearly',
          label: 'Southeast Asia Landcover',
        },
        {
          attribute: 'tree_cover_loss_idn_landcover_yearly',
          label: 'Indonesia Landcover',
        },
        {
          attribute: 'tree_cover_loss_idn_legal_yearly',
          label: 'Indonesia Legal Classification',
        },
        {
          attribute: 'tree_cover_loss_idn_forest_moratorium_yearly',
          label: 'Indonesia Forest Moratorium',
        },
        {
          attribute: 'tree_cover_loss_idn_primary_forest_yearly',
          label: 'Primary Forest',
        },
      ],
    },
  ],
  seAsiaPie: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'pie_chart',
      parsed: 'overhead',
      composites: [
        {
          attribute: 'tree_cover_loss_sea_landcover_yearly',
          label: 'Land Cover Southeast Asia',
        },
        {
          attribute: 'tree_cover_loss_idn_landcover_yearly',
          label: 'Indonesia land cover',
        },
        {
          attribute: 'tree_cover_loss_idn_legal_yearly',
          label: 'Indonesia legal classifications',
        },
        {
          attribute: 'tree_cover_loss_idn_forest_moratorium_yearly',
          label: 'Indonesia forest moratorium',
        },
      ],
      following: [
        {
          attribute: 'tree_cover_loss_total_yearly',
          parsed: 'total',
        },
        {
          attribute: 'tree_cover_loss_total_yearly',
          parsed: 'percent',
        },
      ],
    },
  ],
  seAsiaOverlap: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'seAsia_overlap',
      parsed: 'overhead',
      composites: [
        {
          attribute: 'sea_landcover_area',
          label: 'Southeast Asia Landcover',
        },
        { attribute: 'idn_landcover_area', label: 'Indonesia Landcover' },
        {
          attribute: 'idn_legal_area',
          label: 'Indonesia Legal Classification',
        },
        {
          attribute: 'idn_forest_moratorium_area',
          label: 'Indonesia Forest Moratorium',
        },
      ],
    },
  ],
  seAsiaOverlapAggregate: [
    {
      parsed: 'yearly',
      composites: [
        {
          attribute: 'sea_landcover_area',
          label: 'Southeast Asia Landcover',
        },
        { attribute: 'idn_landcover_area', label: 'Indonesia Landcover' },
        {
          attribute: 'idn_legal_area',
          label: 'Indonesia Legal Classification',
        },
        {
          attribute: 'idn_forest_moratorium_area',
          label: 'Indonesia Forest Moratorium',
        },
      ],
    },
  ],
  deforestationTrends: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      parsed: 'yearly',
      composites: [{ attribute: 'commodity_threat_deforestation', label: '' }],
      following: [],
    },
  ],
  millPriority: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      parsed: 'yearly',
      composites: [{ attribute: 'commodity_mill_priority_level', label: '' }],
      following: [],
    },
  ],
  palmRiskAnalysis: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'palmRiskAnalysis',
      parsed: 'overhead',
      fields: [
        {
          attribute: 'commodity_mill_priority_level',
          type: 'yearly',
          parsed: 'category',
        },
        {
          attribute: 'commodity_mill_priority_score',
          type: 'yearly',
          parsed: 'last',
        },
        {
          attribute: 'commodity_threat_overall_level',
          type: 'yearly',
          parsed: 'category',
        },
        {
          attribute: 'commodity_threat_overall_score',
          type: 'yearly',
          parsed: 'last',
        },
        {
          attribute: 'commodity_value_overall_level',
          type: 'yearly',
          parsed: 'category',
        },
        {
          attribute: 'commodity_value_overall_score',
          type: 'yearly',
          parsed: 'last',
        },
        {
          attribute: 'commodity_threat_deforestation',
          type: 'yearly',
          parsed: 'last',
        },
        {
          attribute: 'commodity_threat_peat',
          type: 'yearly',
          parsed: 'last',
        },
        {
          attribute: 'commodity_threat_protected_areas',
          type: 'yearly',
          parsed: 'last',
        },
        {
          attribute: 'commodity_threat_fires',
          type: 'yearly',
          parsed: 'last',
        },
        {
          attribute: 'commodity_value_forest_extent',
          type: 'yearly',
          parsed: 'last',
        },
        { attribute: 'commodity_value_peat', type: 'yearly', parsed: 'last' },
        {
          attribute: 'commodity_value_protected_areas',
          type: 'yearly',
          parsed: 'last',
        },
        {
          attribute: 'commodity_threat_deforestation_level',
          type: 'lastYear',
          parsed: 'aggregate',
        },
        {
          attribute: 'commodity_threat_peat_level',
          type: 'lastYear',
          parsed: 'aggregate',
        },
        {
          attribute: 'commodity_threat_protected_areas_level',
          type: 'lastYear',
          parsed: 'aggregate',
        },
        {
          attribute: 'commodity_threat_fires_level',
          type: 'lastYear',
          parsed: 'aggregate',
        },
        {
          attribute: 'commodity_value_forest_extent_level',
          type: 'lastYear',
          parsed: 'aggregate',
        },
        {
          attribute: 'commodity_value_peat_level',
          type: 'lastYear',
          parsed: 'aggregate',
        },
        {
          attribute: 'commodity_value_protected_areas_level',
          type: 'lastYear',
          parsed: 'aggregate',
        },
      ],
    },
  ],
  forestChangeDiagnosticListSummary: [
    {
      name: 'forestChangeDiagnosticListSummary',
      parsed: 'overhead',
      fields: [
        { attribute: 'tree_cover_extent_total', parsed: 'percent' },
        { attribute: 'tree_cover_extent_total', parsed: 'aggregate' },
        { attribute: 'natural_habitat_primary', parsed: 'percent' },
        { attribute: 'natural_habitat_primary', parsed: 'aggregate' },
        { attribute: 'protected_areas_area', parsed: 'percent' },
        { attribute: 'protected_areas_area', parsed: 'aggregate' },
        { attribute: 'peat_area', parsed: 'percent' },
        { attribute: 'peat_area', parsed: 'aggregate' },
        { attribute: 'natural_habitat_intact_forest', parsed: 'percent' },
        { attribute: 'natural_habitat_intact_forest', parsed: 'aggregate' },
        { attribute: 'total_area', parsed: 'aggregate' },
      ],
    },
  ],
  forest_change: [
    { name: 'List Name', key: 'List Name', analysis: false },
    { name: 'Location Name', key: 'Location Name', analysis: false },
    { name: 'Size', key: 'total_area', analysis: false },
    { name: 'Commodity', key: 'Commodity', analysis: false },
    { name: 'Country(Countries)', key: 'Country', analysis: false },
    { name: 'State(s)', key: 'State', analysis: false },
    { name: 'Sub-state(s)', key: 'Sub State', analysis: false },
    {
      name: 'Tree Cover Extent',
      key: 'tree_cover_extent_total',
      analysis: true,
    },
    { name: 'Total', key: 'tree_cover_loss_total_yearly', analysis: true },
    {
      name: 'Protected Areas',
      key: 'tree_cover_loss_protected_areas_yearly',
      analysis: true,
    },
    {
      name: 'Primary Forests',
      key: 'tree_cover_loss_primary_forest_yearly',
      analysis: true,
    },
  ],
  commodity_risk: [
    { name: 'List Name', key: 'List Name', analysis: false },
    { name: 'Location Name', key: 'Location Name', analysis: false },
    { name: 'Country(Countries)', key: 'Country', analysis: false },
    {
      name: 'Mill Priority',
      key: 'commodity_mill_priority_level',
      analysis: true,
    },
    {
      name: 'THREATS - Deforestation',
      key: 'commodity_threat_deforestation_level',
      analysis: true,
    },
    {
      name: 'THREATS - Peat',
      key: 'commodity_threat_peat_level',
      analysis: true,
    },
    {
      name: 'THREATS - Protected Areas',
      key: 'commodity_threat_protected_areas_level',
      analysis: true,
    },
    {
      name: 'THREATS - Fire',
      key: 'commodity_threat_fires_level',
      analysis: true,
    },
    {
      name: 'THREATS - Overall',
      key: 'commodity_threat_overall_level',
      analysis: true,
    },
    {
      name: 'VALUES - Forest',
      key: 'commodity_value_forest_extent_level',
      analysis: true,
    },
    {
      name: 'VALUES - Peat',
      key: 'commodity_value_peat_level',
      analysis: true,
    },
    {
      name: 'VALUES - Protected Areas',
      key: 'commodity_value_protected_areas_level',
      analysis: true,
    },
    {
      name: 'VALUES - Overall',
      key: 'commodity_value_overall_level',
      analysis: true,
    },
  ],
  commodity_risk_user: [
    { name: 'RSPO Certified', key: 'Certification' },
    { name: 'Parent Company', key: 'Parent Company' },
    { name: 'Supplier', key: 'Supplier Name' },
    { name: 'Supplier 2', key: 'Second Supplier Name' },
  ],
  palm_oil_mill_fc: [
    { name: 'Parent Company', key: 'Parent Company' },
    { name: 'Certification', key: 'Certification' },
    { name: 'RSPO Model', key: 'RSPO Model' },
    { name: 'ID', key: 'Mill ID' },
    { name: 'Alternative Mill Name', key: 'Alternative Name' },
  ],
  palm_oil_mill_cr: [
    { name: 'Certification', key: 'Certification' },
    { name: 'RSPO Model', key: 'RSPO Model' },
    { name: 'ID', key: 'Mill ID' },
    { name: 'Alternative Mill Name', key: 'Alternative Name' },
  ],
  oil_palm_concession_fc: [
    { name: 'Company', key: 'Company' },
    { name: 'Parent Company', key: 'Parent Company' },
    { name: 'Certification', key: 'Certification' },
  ],
  rspo_oil_palm_fc: [
    { name: 'Company', key: 'Company' },
    { name: 'Parent Company', key: 'Parent Company' },
    { name: 'Certification', key: 'Certification' },
  ],
  protected_area_fc: [
    { name: 'IUCN Category', key: 'IUCN CAT' },
    { name: 'Designation Type', key: 'Designation Type' },
    { name: 'Designation', key: 'Designation' },
  ],
  argentinaOverlap: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'argentinaLayers',
      parsed: 'overhead',
      composites: [
        {
          attribute: 'arg_otbn_area',
          type: 'category',
          label: 'Argentina OTBN',
          limit: 4,
        },
        {
          attribute: 'protected_areas_by_category_area',
          type: 'country',
          label: 'Argentina Protected Areas',
        },
        {
          attribute: 'landmark_by_category_area',
          type: 'country',
          label: 'Argentina Indigenous Territories',
        },
      ],
    },
  ],
  argentinaOverlapAggregate: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'argentinaLayers',
      parsed: 'overhead',
      composites: [
        {
          attribute: 'arg_otbn_area',
          type: 'category',
          label: 'Argentina OTBN',
          limit: 4,
        },
        {
          attribute: 'protected_areas_by_category_area',
          type: 'country',
          label: 'Argentina Protected Areas',
        },
        {
          attribute: 'landmark_by_category_area',
          type: 'country',
          label: 'Argentina Indigenous Territories',
        },
      ],
    },
  ],
  argentinaDeforestation: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'argentinaDeforestation',
      parsed: 'overhead',
      composites: [
        {
          attribute: 'country_specific_deforestation_classified_region_yearly',
          label: 'OTBN',
        },
        {
          attribute: 'country_specific_deforestation_wdpa_yearly',
          label: 'Argentina Protected Areas',
        },
        {
          attribute: 'country_specific_deforestation_landmark_yearly',
          label: 'Indigenous territories',
        },
        { attribute: 'country_specific_deforestation_yearly', label: 'Country' },
      ],
    },
  ],
  argentinaDeforestationAggregate: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'argentinaDeforestation',
      parsed: 'yearly',
      composites: [
        {
          attribute: 'country_specific_deforestation_classified_region_yearly',
          label: 'OTBN',
        },
        {
          attribute: 'country_specific_deforestation_wdpa_yearly',
          label: 'Argentina Protected Areas',
        },
        {
          attribute: 'country_specific_deforestation_landmark_yearly',
          label: 'Indigenous territories',
        },
        { attribute: 'country_specific_deforestation_yearly', label: 'Country' },
      ],
    },
  ],
  colombiaOverlap: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'colombiaOverlap',
      parsed: 'overhead',
      composites: [
        {
          attribute: 'classified_region_area',
          type: 'yearly',
          label: 'National Agricultural Frontier',
          hasSecondarySubLayers: true,
        },
        {
          attribute: 'protected_areas_by_category_area',
          type: 'category',
          label: 'Protected Areas',
        },
        {
          attribute: 'landmark_by_category_area',
          type: 'category',
          label: 'Indigenous Territories',
        },
      ],
    },
  ],
  colombiaOverlapAggregate: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'colombiaOverlap',
      parsed: 'overhead',
      composites: [
        {
          attribute: 'classified_region_area',
          type: 'yearly',
          label: 'National Agricultural Frontier',
          hasSecondarySubLayers: true,
        },
        {
          attribute: 'protected_areas_by_category_area',
          type: 'category',
          label: 'Protected Areas',
        },
        {
          attribute: 'landmark_by_category_area',
          type: 'category',
          label: 'Indigenous Territories',
        },
      ],
    },
  ],
  colombiaDeforestation: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'Location Name',
      parsed: 'overhead',
    },
    {
      name: 'colombiaDeforestation',
      parsed: 'overhead',
      startYear: 2011,
      endYear: 2023,
      composites: [
        {
          attribute: 'tree_cover_loss_by_country_classified_region_yearly',
          type: 'yearly',
          label: 'National Agricultural Frontier',
          hasSecondarySubLayers: true,
        },
        {
          attribute: 'tree_cover_loss_by_country_wdpa_yearly',
          type: 'yearly',
          label: 'Protected Areas',
        },
        {
          attribute: 'tree_cover_loss_by_country_landmark_yearly',
          type: 'yearly',
          label: 'Indigenous territories',
        },
      ],
    },
  ],
  colombiaDeforestationAggregate: [
    {
      name: 'list_name',
      parsed: 'overhead',
    },
    {
      name: 'colombiaDeforestation',
      parsed: 'yearly',
      startYear: 2011,
      endYear: 2023,
      composites: [
        {
          attribute: 'tree_cover_loss_by_country_classified_region_yearly',
          type: 'yearly',
          label: 'National Agricultural Frontier',
          hasSecondarySubLayers: true,
        },
        {
          attribute: 'tree_cover_loss_by_country_wdpa_yearly',
          type: 'yearly',
          label: 'Protected Areas',
          constantLayers: [
            'Category VI',
            'Ramsar Site, Wetland of International Importance',
            'UNESCO-MAB Biosphere Reserve',
            'Category II',
            'Category Ia',
            'Category IV',
            'Category Ib',
            'Category III',
          ],
        },
        {
          attribute: 'tree_cover_loss_by_country_landmark_yearly',
          type: 'yearly',
          label: 'Indigenous territories',
        },
      ],
    },
  ],
};

export const EXCEL_TEMPLATE_HEADERS = {
  aggregate: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (ha)',
    '% of TCL',
  ],
  forestLoss: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (ha)',
    '% of TCL',
  ],
  forestLossAggregate: [
    'List Name',
    'Data Layer Name',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (ha)',
    '% of TCL',
  ],
  historicPercent: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    '% of Historic Area Lost',
    'Loss (all years) (ha)',
    'Tree Cover Extent (2000) (ha)',
  ],
  historicPercentAggregate: [
    'List Name',
    'Data Layer Name',
    '% of Historic Area Lost',
    'Loss (all years) (ha)',
    'Tree Cover Extent (2000) (ha)',
  ],
  sAmericaSoy: [
    'List Name',
    'Location Name',
    'Total soy in selected area (%)',
    'Total soy in selected area (ha)',
    'Pre-2001 conversion/non-forest (%)',
    'Pre-2001 conversion/non-forest (ha)',
  ],
  sAmericaLoss: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (ha)',
    '% of TCL',
  ],
  sAmericaLossAggregate: [
    'List Name',
    'Data Layer Name',
    'Forest Loss (ha)',
    'Year',
    'Total Loss (ha)',
  ],
  sAmericaBiomes: [
    'List Name',
    'Location Name',
    'Data Layer',
    'Sub-Layer',
    'Overlap with Sub-Layer (%)',
  ],
  sAmericaBiomesAggregate: ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
  seAsiaAll: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (ha)',
    '% of TCL',
  ],
  seAsiaTCL: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (ha)',
    '% of TCL',
  ],
  seAsiaTCLAggregate: [
    'List Name',
    'Data Layer Name',
    'Forest Loss (ha)',
    'Year',
    'Total Loss (ha)',
  ],
  seAsiaPie: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Sub-layer name',
    'Overlap with sub-layer (%)',
  ],
  seAsiaOverlap: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Sub-layer name',
    'Overlap with sub-layer (%)',
  ],
  seAsiaOverlapAggregate: [
    'List Name',
    'Data Layer Name',
    'Sub-layer name',
    'Overlap with sub-layer (%)',
  ],
  deforestationTrends: ['List Name', 'Location Name', 'Loss', 'Year'],
  millPriority: ['List Name', 'Location Name', 'Threat + Value', 'Year'],
  palmRiskAnalysis: [
    'List Name',
    'Location Name',
    'Mill Priority',
    'Mill Priority Score',
    'Overall Threat',
    'Threat Score',
    'Overall Value',
    'Value Score',
    'Deforestation - Threats Amount',
    'Peat - Threats Amount',
    'Protected Areas - Threats Amount',
    'Fires - Threats Amount',
    'Forest - Values Amount',
    'Peat - Values Amount',
    'Protected Areas - Values Amount',
    'Deforestation - Threats Level',
    'Peat - Threats Level',
    'Protected Areas - Threats Level',
    'Fires - Threats Level',
    'Forest - Values Level',
    'Peat - Values Level',
    'Protected Areas - Values Level',
  ],
  forestChangeDiagnosticListSummary: [
    'List Name',
    'Country (Countries)',
    'Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS)',
    'Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Primary Forest (%) (HISTORIC SITE CHARACTERISTICS)',
    'Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Protected Area (%) (HISTORIC SITE CHARACTERISTICS)',
    'Protected Area (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Peat (%) (HISTORIC SITE CHARACTERISTICS)',
    'Peat (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS)',
    'Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Total Hectares',
  ],
  forestChangeDiagnosticLocationSummary: [
    'List Name',
    'Location Name',
    'State(s)',
    'Country (Countries)',
    'Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS)',
    'Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Primary Forest (%) (HISTORIC SITE CHARACTERISTICS)',
    'Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Protected Area (%) (HISTORIC SITE CHARACTERISTICS)',
    'Protected Area (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Peat (%) (HISTORIC SITE CHARACTERISTICS)',
    'Peat (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS)',
    'Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Volume',
    'Company ID',
    'Refinery Name',
    'Supplier Name',
    'Second Refinery Name',
    'Second Supplier Name',
    'Total Hectares',
  ],
  commodityRiskDiagnosticLocationSummary: [
    'List Name',
    'Location Name',
    'State(s)',
    'Country (Countries)',
    'Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS)',
    'Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Primary Forest (%) (HISTORIC SITE CHARACTERISTICS)',
    'Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Protected Area (%) (HISTORIC SITE CHARACTERISTICS)',
    'Protected Area (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Peat (%) (HISTORIC SITE CHARACTERISTICS)',
    'Peat (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS)',
    'Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS)',
    'Volume',
    'Company ID',
    'Refinery Name',
    'Supplier Name',
    'Second Refinery Name',
    'Second Supplier Name',
    'Parent Company',
    'Certification',
    'Total Hectares',
  ],
  argentinaOverlap: [
    'List Name',
    'Location Name',
    'Data Layer',
    'Sub-Layer',
    'Overlap with Sub-layer (Ha)',
    'Overlap with Sub-Layer (%)',
  ],
  argentinaOverlapAggregate: [
    'List Name',
    'Data Layer',
    'Sub-Layer',
    'Overlap with Sub-layer (Ha)',
    'Overlap with Sub-Layer (%)',
  ],
  argentinaDeforestation: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Sub-Layer',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (ha)',
    '% of Forest Loss',
  ],
  argentinaDeforestationAggregate: [
    'List Name',
    'Data Layer Name',
    'Sub-Layer',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (ha)',
    '% of Forest Loss',
  ],
  colombiaOverlap: [
    'List Name',
    'Location Name',
    'Data Layer',
    'Sub-Layer',
    'Overlap with Sub-layer (Ha)',
    'Overlap with Sub-Layer (%)',
    'Secondary Sub-Layer',
    'Overlap with Secondary Sub-Layer (Ha)',
    'Overlap with Secondary Sub-Layer (%)',
  ],
  colombiaOverlapAggregate: [
    'List Name',
    'Data Layer',
    'Sub-Layer',
    'Overlap with Sub-layer (Ha)',
    'Overlap with Sub-Layer (%)',
    'Secondary Sub-Layer',
    'Overlap with Secondary Sub-Layer (Ha)',
    'Overlap with Secondary Sub-Layer (%)',
  ],
  colombiaDeforestation: [
    'List Name',
    'Location Name',
    'Data Layer Name',
    'Sub-Layer',
    'Secondary Sub-Layer',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (Ha)',
    '% of Forest Loss',
  ],
  colombiaDeforestationAggregate: [
    'List Name',
    'Data Layer Name',
    'Sub-Layer',
    'Secondary Sub-Layer',
    'Forest Loss (ha)',
    'Year',
    'Loss (all years) (Ha)',
    '% of Forest Loss',
  ],
};

export const FIELDS_NEEDED_CALCULATION = [
  'tree_cover_loss_brazil_biomes_yearly',
  'tree_cover_loss_sea_landcover_yearly',
  'tree_cover_loss_idn_landcover_yearly',
  'south_america_presence',
  'southeast_asia_presence',
  'brazil_biomes',
  'arg_otbn_area',
  'total_area',
  'soy_total_area',
  'soy_pre2001_nonforest_area',
  'Country',
  'Investment Name',
  'country_area',
];

export const NESTED_JSON_ATTRIBUTES = [
  'tree_cover_loss_brazil_biomes_yearly',
  'tree_cover_loss_sea_landcover_yearly',
  'tree_cover_loss_idn_landcover_yearly',
];

export const DATA_LAYER = {
  arg_otbn_area: 'Argentina OTBN',
  brazil_biomes: 'Brazil Biomes',
};

export const DEFORESTATION_KPIS_HEADER_AGGREGATE = {
  listName: 'List Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  coverageHA: 'Natural Forest Coverage (HA) (Beta)',
  naturalForestLossHA: 'Natural Forest Loss (ha) (Beta)',
  negligibleRisk: 'Negligible Risk',
};

export const DEFORESTATION_KPIS_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  coverageHA: 'Natural Forest Coverage (HA) (Beta)',
  naturalForestLossHA: 'Natural Forest Loss (ha) (Beta)',
  negligibleRisk: 'Negligible Risk (%)',
};

export const NATURAL_FOREST_LOST_KPIS_HEADER_AGGREGATE = {
  listName: 'List Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  totalAreaHa: 'Locations overlap within Sub State (HA)',
  coverageHA: 'Natural Forest Coverage (HA)',
  naturalForestLossCumulative: 'Natural Forest Loss cumulative (HA)',
  naturalForestLossAnnual: 'Natural Forest Loss annual (HA)',
  year: 'Year',
  layer: 'Natural Forest Data Layer',
} as const;

export const NATURAL_FOREST_LOST_KPIS_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  totalAreaHa: 'Location Size (HA)',
  coverageHA: 'Natural Forest Coverage (HA)',
  naturalForestLossCumulative: 'Natural Forest Loss cumulative (HA)',
  naturalForestLossAnnual: 'Natural Forest Loss annual (HA)',
  year: 'Year',
  layer: 'Natural Forest Data Layer',
} as const;

export const OTHER_KPIS_HEADER_AGGREGATE = {
  listName: 'List Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  negligibleRisk: 'Negligible Risk',
  protectedAreasArea: 'Overlap with WDPA (Ha)',
  landmarkArea: 'Overlap with Indigenous Lands (Ha)',
} as const;

export const OTHER_KPIS_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  negligibleRisk: 'Negligible Risk (%)',
  protectedAreasArea: 'Overlap with WDPA (Ha)',
  protectedAreasAreaPercentage: 'Overlap with WDPA (%)',
  landmarkArea: 'Overlap with Indigenous Lands (Ha)',
  landmarkAreaPercentage: 'Overlap with Indigenous Lands (%)',
} as const;

export const ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  alertType: 'Alert Type',
  startDate: 'Start Date',
  endDate: 'End Date',
  date: 'Date',
  totalHa: 'Location Size (HA)',
  confidenceLevel: 'Confidence Level',
  totalAlerts: 'Total # of alerts',
  alertSbtn: '# Alerts in SBTN Natural Forest',
  alertsJRC: '# Alerts in JRC Natural Forest',
  numberLocations: '# of locations',
} as const;

export const GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_DAILY_CSV_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  locationSizeHa: 'Location Size (ha)',
  country: 'Country',
  state: 'State',
  subState: 'Sub state',
  alertType: 'Alert Type',
  startDate: 'Start Date',
  endDate: 'End Date',
  date: 'Date',
  confidenceLevel: 'Confidence Level',
  totalAlertHectares: 'Total alert hectares',
  hectaresSbtnNaturalForest: 'Hectares of alerts in SBTN Natural Forest',
  hectaresSbtnNaturalOpenEcosystems: 'Hectares of alerts in SBTN Natural Open Ecosystems',
  hectaresJrcForest: 'Hectares of alerts in JRC Forest',
  numberOfLocations: 'Number of locations',
} as const;

export const ACCOUNT_USERS_USAGE_CSV_HEADER = [
  'Username',
  'List ID',
  'Analysis Types',
  'Hectares',
  'Locations',
  'Date/Timestamp',
  'UI/API',
];

export const GREEN_HOUSE_GAS_EMISSIONS_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  locationSizeHa: 'Location Size (Ha)',
  commodity: 'Commodity',
  dataLayerName: 'Data Layer Name',
  co2EmissionsFactor: 'CO2 Emissions Factor',
  ch4EmissionsFactor: 'CH4 Emissions Factor',
  n2oEmissionsFactor: 'N2O Emissions Factor',
  CombinedEmissionsFactor: 'Combined Emissions Factor',
  year: 'Reporting Year',
};

export const GHG_RAW_EMISSIONS_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  locationSizeHa: 'Location Size (Ha)',
  commodity: 'Commodity',
  dataLayerName: 'Data Layer Name',
  co2RawEmission: 'CO2 Raw Emissions',
  ch4RawEmission: 'CH4 Raw Emissions',
  n2oRawEmission: 'N2O Raw Emissions',
  CombinedRawEmission: 'Combined Raw Emissions',
  year: 'Year',
};
export const GHG_INTERMEDIATE_OUTPUTS_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  locationSizeHa: 'Location Size (Ha)',
  commodity: 'Commodity',
  dataLayerName: 'Data Layer Name',
  weightedAvgYield: 'Yield',
  production: 'Production',
  co2LinearDiscountedEmission: 'CO2 Linear Discounted Emissions',
  ch4LinearDiscountedEmission: 'CH4 Linear Discounted Emissions',
  n2oLinearDiscountedEmission: 'N2O Linear Discounted Emissions',
  CombinedLinearDiscountedEmission: 'Combined Linear Discounted Emissions',
  year: 'Reporting Year',
};
