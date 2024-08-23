export const regionIds = {
  ARGENTINA: 'argentina',
  REGIONAL: 'regional',
  COLOMBIA: 'colombia',
};

export const regionsTabs = [
  {
    id: regionIds.REGIONAL,
    label: 'Regional',
  },
  {
    id: regionIds.ARGENTINA,
    label: 'Argentina',
  },
  {
    id: regionIds.COLOMBIA,
    label: 'Colombia',
  },
];

export const regionConstants = {
  id: 'otbnArgentina',
  chartsSelectorTitle: 'ARGENTINIAN DEFORESTATION',
  informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
  downloadId: 'argentinaDeforestation',
  diagnosticTitle: 'OTBN Overlap',
  startYear: 2008,
  endYear: 2023,
};

const nonOverlapAreaColor = 'rgb(200,200,200)';

export const chartDatasetConfigs = {
  argentinaOtbn: {
    // delete when isArgentinaDeforestationAvailable feature flag is deleted
    id: 'otbnArgentina',
    chartsSelectorTitle: 'ARGENTINIAN DEFORESTATION',
    dataCy: 'tree-cover-loss-OTBN',
    legendColor: 'rgb(255,127,179)',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
    downloadId: 'southAmericaTCL',
    diagnosticTitle: 'OTBN Overlap',
    chartLabels: [
      { id: 'Category I', color: 'rgb(238,37,33)', legend: 'Category I', checked: true },
      { id: 'Category II', color: 'rgb(255,204,51)', legend: 'Category II', checked: true },
      { id: 'Category III', color: 'rgb(151,189,61)', legend: 'Category III', checked: true },
    ],
    startYear: 2008,
    endYear: 2023,
  },
  otbn: {
    id: 'otbn',
    chartsSelectorTitle: 'Argentinian Govt Deforestation on Argentina OTBN',
    dataCy: 'annual-loss-OTBN',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
    infoBubbleId: 'regions_arg_deforestation_pa_it',
    chartLabels: [
      {
        id: 'Category I',
        dataPath: 'classified_region.country_specific_deforestation.Category I',
        legend: 'Category I',
        color: 'rgb(238,37,33)',
        checked: true,
      },
      {
        id: 'Category II',
        dataPath: 'classified_region.country_specific_deforestation.Category II',
        legend: 'Category II',
        color: 'rgb(255,204,51)',
        checked: true,
      },
      {
        id: 'Category III',
        dataPath: 'classified_region.country_specific_deforestation.Category III',
        legend: 'Category III',
        color: 'rgb(151,189,61)',
        checked: true,
      },
    ],
  },
  argentinaTreeCoverLoss: {
    id: 'argentinaTreeCoverLoss',
    dataCy: 'argentina-tree-cover-loss',
    chartsSelectorTitle: 'Deforestation',
    infoBubbleId: 'regions_arg_deforestation',
    chartLabels: [
      {
        id: 'country specific deforestation',
        dataPath: 'country.country_specific_deforestation',
        legend: 'ARGENTINIAN GOVERNMENT DEFORESTATION DATA',
        color: 'rgb(34,153,102)',
        checked: true,
      },
      {
        id: 'hansen tree cover loss',
        dataPath: 'country.tree_cover_loss',
        legend: 'Hansen tree cover loss data',
        color: 'rgb(239,102,154)',
        checked: true,
      },
    ],
  },
  protectedAreas: {
    id: 'protectedAreas',
    dataCy: 'argentina-protected-areas',
    chartsSelectorTitle: 'Argentinian Govt Deforestation on Protected Areas',
    infoBubbleId: 'regions_arg_deforestation_pa_it',
    chartLabels: [
      {
        id: 'fully restrictive',
        dataPath: 'WDPA.country_specific_deforestation.fullyRestrictive',
        legend: 'fully restrictive',
        color: 'rgb(146,37,0)',
        checked: true,
      },
      {
        id: 'less restricted',
        dataPath: 'WDPA.country_specific_deforestation.lessRestricted',
        legend: 'less restricted',
        color: 'rgb(255,64,0)',
        checked: true,
      },
    ],
  },
  indigenousTerritories: {
    id: 'indigenousTerritories',
    dataCy: 'argentina-indigenous-territories',
    chartsSelectorTitle: 'Argentinian Govt Deforestation on Indigenous Territories',
    infoBubbleId: 'regions_arg_deforestation_pa_it',
    chartLabels: [
      {
        id: 'Indigenous Territories',
        dataPath: 'landmark.country_specific_deforestation.indigenous',
        legend: 'Indigenous Territories',
        color: 'rgb(146,37,100)',
        checked: true,
        preview: true,
      },
    ],
  },
  wdpaOverlapCountry: {
    diagnosticTitle: 'Protected Areas Overlap',
    informationBubbleId: 'regions_arg_pa_landcover_calc',
    informationBubbleColId: 'regions_col_pa_landcover_calc',
    downloadUrl: 'listId=5692&country=Argentina&category=WDPA',
    chartLabels: [
      { id: 'fullyRestrictive', color: '#862e13', legend: 'Fully Restricted' },
      { id: 'lessRestricted', color: '#eb5027', legend: 'Less Restricted' },
      {
        id: 'Outside of Protected Areas',
        legend: 'Outside of Protected Areas',
        color: nonOverlapAreaColor,
        checked: true,
      },
    ],
  },
  landmarkOverlapCountry: {
    diagnosticTitle: 'Indigenous Territories Overlap',
    downloadUrl: 'listId=5692&country=Argentina&category=landmark',
    informationBubbleId: 'regions_arg_it_landcover_calc',
    informationBubbleColId: 'regions_col_it_landcover_calc',
    chartLabels: [
      { id: 'indigenous', color: '#a8704a', legend: 'Overlap with Indigenous Territories' },
      {
        id: 'nonIndigenous',
        color: nonOverlapAreaColor,
        legend: 'Outside of Indigenous Territoriess',
      },
    ],
  },
  otbnPieChart: {
    id: 'otbn',
    chartsSelectorTitle: 'Argentinian Govt Deforestation on Argentina OTBN',
    dataCy: 'annual-loss-OTBN',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
    infoBubbleId: 'regions_arg_deforestation_pa_it',
    chartLabels: [
      {
        id: 'Category I',
        dataPath: 'classified_region.country_specific_deforestation.Category I',
        legend: 'Category I',
        color: 'rgb(238,37,33)',
        checked: true,
      },
      {
        id: 'Category II',
        dataPath: 'classified_region.country_specific_deforestation.Category II',
        legend: 'Category II',
        color: 'rgb(255,204,51)',
        checked: true,
      },
      {
        id: 'Category III',
        dataPath: 'classified_region.country_specific_deforestation.Category III',
        legend: 'Category III',
        color: 'rgb(151,189,61)',
        checked: true,
      },
      {
        id: 'Outside of OTBN',
        dataPath: '',
        legend: 'Outside of OTBN',
        color: nonOverlapAreaColor,
        checked: true,
      },
    ],
  },
};

const colombianSubcategories = [
  {
    id: 'Unconditioned',
    legend: 'Non Conditioned',
    color: '#0D642E',
    subCategoryColor: '#299A4C',
  },
  {
    id: 'Conditioned',
    legend: 'Conditioned',
    color: '#DC8832',
    subCategoryColor: '#D5A65A',
  },
  {
    id: 'Restrictions',
    legend: 'Restrictions',
    color: '#2438AE',
    subCategoryColor: '#4B87D5',
  },
];

export const chartDatasetConfigsColombia = {
  classifiedRegionTreeCoverLoss: {
    id: 'colombianTreeCoverLoss',
    dataCy: 'colombian-tree-cover-loss',
    chartsSelectorTitle: 'National Agricultural Frontier',
    dataPath: 'classified_region.tree_cover_loss',
    dateRange: { startYear: 2008, endYear: 2023 },
    infoBubbleId: 'regions_col_tcl_ agricultural_frontier_restrictions',
    subCategories: [...colombianSubcategories],
  },
  classifiedRegionOverlap: {
    id: 'colombianClassifiedRegionOverlap',
    dataCy: 'colombian-classified-region-overlap',
    chartsSelectorTitle: 'National Agricultural Frontier Overlap',
    infoBubbleId: 'regions_col_ag_frontier_calc',
    dataPath: 'classified_region.overlap',
    subCategories: [...colombianSubcategories],
  },
  protectedAreasTreeCoverLoss: {
    id: 'protectedAreas',
    dataCy: 'protected-areas',
    dataPath: 'WDPA.tree_cover_loss',
    dateRange: { startYear: 2008, endYear: 2023 },
    chartsSelectorTitle: 'Protected Areas',
    infoBubbleId: 'regions_col_tcl_pa',
    chartLabels: [
      {
        id: 'fully restrictive',
        dataPath: 'WDPA.tree_cover_loss.fullyRestrictive',
        legend: 'Fully restrictive',
        color: 'rgb(146,37,0)',
        checked: true,
      },
      {
        id: 'less restricted',
        dataPath: 'WDPA.tree_cover_loss.lessRestricted',
        legend: 'Less restricted',
        color: 'rgb(255,64,0)',
        checked: true,
      },
    ],
  },
  indigenousTerritoriesTreeCoverLoss: {
    id: 'indigenousTerritories',
    dataCy: 'indigenous-territories',
    dataPath: 'landmark.tree_cover_loss',
    dateRange: { startYear: 2008, endYear: 2023 },
    chartsSelectorTitle: 'Indigenous Territories',
    infoBubbleId: 'regions_col_tcl_it',
    chartLabels: [
      {
        id: 'Indigenous Territories',
        dataPath: 'landmark.tree_cover_loss.indigenous',
        legend: 'Indigenous Territories',
        color: 'rgb(146,37,100)',
        checked: true,
      },
    ],
  },
};
