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

export const chartDatasetConfigs = {
  argentinaOtbn: {
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
    endYear: 2022,
  },
  argentinaTreeCoverLoss: {
    id: 'argentinaTreeCoverLoss',
    dataCy: 'argentina-tree-cover-loss',
    chartsSelectorTitle: 'Tree cover loss',
    totalLoss: null,
    chartLabels: [
      {
        id: 'country_specific_deforestation',
        legend: 'argentina deforestation',
        color: 'rgba(34,153,102,1)',
        checked: false,
        totalLossByCategory: null,
      },
      {
        id: 'hansenTreeCoverLoss',
        legend: 'tree cover loss',
        color: 'rgb(239,102,154)',
        checked: true,
        totalLossByCategory: null,
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
