export const regionIds = {
  ARGENTINA: 'argentina',
  REGIONAL: 'regional',
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
];

export const regionConstants = {
  id: 'otbnArgentina',
  chartsSelectorTitle: 'Tree Cover Loss on Argentina OTBN',
  informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
  downloadId: 'southAmericaTCL',
  diagnosticTitle: 'OTBN Percent Overlap',
  startYear: 2008,
  endYear: 2023,
};

export const chartDatasetConfigs = {
  argentinaOtbn: {
    // delete when isArgentinaDeforestationAvailable feature flag is deleted
    id: 'otbnArgentina',
    chartsSelectorTitle: 'Tree Cover Loss on Argentina OTBN',
    dataCy: 'tree-cover-loss-OTBN',
    legendColor: 'rgb(255,127,179)',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
    downloadId: 'southAmericaTCL',
    diagnosticTitle: 'OTBN Percent Overlap',
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
    chartsSelectorTitle: 'Argentina OTBN',
    dataCy: 'annual-loss-OTBN',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
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
    chartsSelectorTitle: 'Tree cover loss',
    chartLabels: [
      {
        id: 'country specific deforestation',
        dataPath: 'country.country_specific_deforestation',
        legend: 'argentina deforestation',
        color: 'rgb(34,153,102)',
        checked: true,
      },
      {
        id: 'hansen tree cover loss',
        dataPath: 'country.tree_cover_loss',
        legend: 'tree cover loss',
        color: 'rgb(239,102,154)',
        checked: true,
      },
    ],
  },
  protectedAreas: {
    id: 'protectedAreas',
    dataCy: 'argentina-protected-areas',
    chartsSelectorTitle: 'Protected Areas',
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
    chartsSelectorTitle: 'Indigenous Territories',
    chartLabels: [
      {
        id: 'Indigenous Territories',
        dataPath: 'landmark.country_specific_deforestation.indigenous',
        legend: 'Indigenous Territories',
        color: 'rgb(146,37,100)',
        checked: true,
      },
    ],
  },

  wdpaOverlapCountry: {
    diagnosticTitle: 'Protected Areas Percent Overlap',
    informationBubbleId: 'regions_arg_pa_landcover_calc',
    downloadUrl: 'listId=5692&country=Argentina&category=WDPA',
    chartLabels: [
      { id: 'fullyRestrictive', color: '#862e13', legend: 'Fully Restricted' },
      { id: 'lessRestricted', color: '#eb5027', legend: 'Less Restricted' },
    ],
  },
  landmarkOverlapCountry: {
    diagnosticTitle: 'Indigenous Territories Percent Overlap',
    downloadUrl: 'listId=5692&country=Argentina&category=landmark',
    informationBubbleId: 'regions_arg_it_landcover_calc',
    chartLabels: [
      { id: 'indigenous', color: '#a8704a', legend: 'Overlap with Indigenous Territories' },
      { id: 'nonIndigenous', color: '#deaf82', legend: 'Non-Overlap with Indigenous Territories' },
    ],
  },
};
