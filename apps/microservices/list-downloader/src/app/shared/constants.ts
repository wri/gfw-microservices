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

export const MAX_NUMBER_OF_ROWS_PER_PAGE = 5000;

export const templateColumns = {
  INVESTMENT: [
    'Investment Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Commodity',
    'Company Policy Ranking',
    'Risk Level',
    'Counterparty',
    'Parent Company or Group',
    'Type of Investment',
    'Certification',
    'Size of Investment',
    'CCY',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  PALM_OIL_MILL: [
    'Location Name',
    'Analysis Radius',
    'Analysis Area',
    'Company ID',
    'ID',
    'Volume',
    'Parent Company',
    'Supplier Name',
    'Refinery Name',
    'Second Supplier Name',
    'Second Refinery Name',
    'Verified?',
    'Oil Type',
    'RSPO Model',
    'Certification',
    'Direct FFB',
    'Other FFB',
    'Associated Smallholder FFB',
    'Independent Smallholder FFB',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  PALM_OIL_PLANTATION: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Company ID',
    'Volume',
    'Parent Company',
    'Supplier Name',
    'Facility Name',
    'Refinery Name',
    'Second Supplier Name',
    'Second Refinery Name',
    'RSPO Model',
    'Certification',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  PALM_OIL_SMALLHOLDER_FARM: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Company ID',
    'Volume',
    'Supplier Name',
    'Facility Name',
    'Second Supplier Name',
    'RSPO Model',
    'Certification',
    'Type of Smallholder',
    'Number of Smallholders',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  PALM_OIL_GENERIC: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Location Classification',
    'Company ID',
    'Volume',
    'Owner Name',
    'Owner ID',
    'Parent Company',
    'Supplier Name',
    'Facility Name',
    'Refinery Name',
    'Second Supplier Name',
    'Second Refinery Name',
    'Oil Type',
    'RSPO Model',
    'Certification',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  PALM_OIL_MILL_GFW: [
    'Location Name',
    'Alternative Mill Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Location Classification',
    'Company ID',
    'Mill ID',
    'Volume',
    'Owner Name',
    'Owner ID',
    'Parent Company',
    'Supplier Name',
    'Facility Name',
    'Refinery Name',
    'Second Supplier Name',
    'Second Refinery Name',
    'Oil Type',
    'RSPO Model',
    'Certification',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  SOY_SILO: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'ID',
    'Volume',
    'National Facility Code',
    'Facility E-mail',
    'Facility Phone',
    'Facility Capacity',
    'Facility Type',
    'Facility Owner',
    'Business ID',
    'Certification',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  SOY_FARM: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Company ID',
    'Cadaster ID',
    'Volume',
    'Owner Name',
    'Owner ID',
    'Facility Name',
    'Facility E-mail',
    'Company Name',
    'Company Contact',
    'Certification',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  SOY_GENERIC: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
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
  ],
  BEEF_SLAUGHTERHOUSE: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Volume',
    'Facility Code',
    'Slaughterhouse Contact',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  CATTLE_RANCH: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Company ID',
    'Cadaster ID',
    'Volume',
    'Owner Name',
    'Owner ID',
    'Company Name',
    'Name of Slaughterhouse',
    'Code of Slaughterhouse',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  CATTLE_GENERIC: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
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
  ],
  COCOA_FARM: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Company ID',
    'Volume',
    'Owner Name',
    'Cooperative Name',
    'Improvement Program',
    'Certification',
    'Start Date',
    'End Date',
    'Time Horizon',
  ],
  COCOA_GENERIC: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
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
  ],
  COMMODITY_GENERIC: [
    'Location Name',
    'Latitude',
    'Longitude',
    'Analysis Radius',
    'Analysis Area',
    'Location Classification',
    'Commodity',
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
  ],
};

export const columnsTemplateId = {
  1: templateColumns.INVESTMENT,
  2: templateColumns.PALM_OIL_MILL,
  3: templateColumns.PALM_OIL_PLANTATION,
  4: templateColumns.PALM_OIL_SMALLHOLDER_FARM,
  5: templateColumns.PALM_OIL_GENERIC,
  6: templateColumns.SOY_SILO,
  7: templateColumns.SOY_FARM,
  8: templateColumns.SOY_GENERIC,
  9: templateColumns.BEEF_SLAUGHTERHOUSE,
  10: templateColumns.CATTLE_RANCH,
  11: templateColumns.CATTLE_GENERIC,
  12: templateColumns.COCOA_FARM,
  13: templateColumns.COCOA_GENERIC,
  14: templateColumns.COMMODITY_GENERIC,
};

export const columnsListName = {
  'Administrative Areas': templateColumns.COMMODITY_GENERIC,
  'Protected Areas': templateColumns.COMMODITY_GENERIC,
  'Oil Palm Concessions': templateColumns.PALM_OIL_GENERIC,
  'RSPO Palm Concessions': templateColumns.PALM_OIL_GENERIC,
  'Palm Oil Mills': templateColumns.PALM_OIL_MILL_GFW,
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
          attribute: 'tree_cover_loss_arg_otbn_yearly',
          label: 'Argentina OTBN',
          following: {
            attribute: 'tree_cover_loss_arg_otbn_yearly',
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
        {
          attribute: 'tree_cover_loss_arg_otbn_yearly',
          label: 'Argentina OTBN',
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
};

export const FIELDS_NEEDED_CALCULATION = [
  'tree_cover_loss_brazil_biomes_yearly',
  'tree_cover_loss_sea_landcover_yearly',
  'tree_cover_loss_idn_landcover_yearly',
  'tree_cover_loss_arg_otbn_yearly',
  'south_america_presence',
  'southeast_asia_presence',
  'brazil_biomes',
  'arg_otbn_area',
  'total_area',
  'soy_total_area',
  'soy_pre2001_nonforest_area',
  'Country',
  'Investment Name',
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

export const AFI_HEADER_AGGREGATE = {
  listName: 'List Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  coverageHA: 'Natural Forest Coverage (HA)',
  naturalForestLossHA: 'Natural Forest Loss (ha)',
  negligibleRisk: 'Negligible Risk',
};

export const AFI_HEADER = {
  listName: 'List Name',
  locationName: 'Location Name',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  coverageHA: 'Natural Forest Coverage (HA)',
  naturalForestLossHA: 'Natural Forest Loss (ha)',
  negligibleRisk: 'Negligible Risk (%)',
};
