export const wdpaDatabaseOutput = {
  overlapProtectedAreas: [
    {
      protectedAreasByCategoryArea: '{}',
    },
    {
      protectedAreasByCategoryArea: '{"Category II":16600.2927}',
    },
    {
      protectedAreasByCategoryArea: '{}',
    },
    {
      protectedAreasByCategoryArea: '{"Category I":150}',
    },
    {
      protectedAreasByCategoryArea: '{"Not Reported":3335.8852}',
    },
  ],
  annualLoss: {
    country_specific_deforestation_wdpa_yearly:
      '{"ARG": {  "Not Reported": {"2014": 822.79,"2015": 743.14,"2017": 420.12,"2018": 952.37,"2019": 177.48,"2020": 134.91,"2021": 579.28,"2022": 659.81, "2016approx": 289.67 },  "II": {"2014": 318.76,"2015": 726.92,"2016": 827.41,"2017": 590.16,"2018": 475.83,"2019": 688.24,"2020": 934.67,"2021": 456.85,"2022": 751.19  }},"BRA": {  "Not Reported": {"2014": 791.36,"2015": 227.81,"2016": 725.02,"2017": 622.91,"2018": 833.07,"2019": 588.19,"2020": 413.26,"2021": 895.74,"2022": 274.83  },  "II": {"2014": 291.58,"2015": 56.93,"2016": 468.72,"2017": 629.47,"2018": 332.15,"2019": 639.28,"2020": 959.81,"2021": 47.39,"2022": 122.57  }}}',
    tree_cover_loss_by_country_wdpa_yearly:
      '{"ARG": {"Not Reported": {"2014": 402.04,"2015": 148.02,"2016": 337.62,"2017": 900.28,"2018": 854.44,"2019": 645.73,"2020": 823.39,"2021": 527.78,"2022": 487.29}, "II": {"2014": 0,"2015": 721.93,"2016": 111.06,"2017": 963.85,"2018": 785.37,"2019": 441.15,"2021": 268.13,"2022": 52.77, "2020approx": 622.79}}, "BRA": {"Not Reported": {"2014": 18.72,"2015": 561.49,"2016": 957.84,"2017": 320.05,"2018": 739.21,"2019": 823.17,"2020": 607.26,"2021": 284.98,"2022": 172.54},"II": {"2014": 820.17,"2015": 678.73,"2016": 182.34,"2017": 461.72,"2018": 741.15,"2019": 235.91,"2020": 975.28,"2021": 752.69,"2022": 125.68 }}}',
  },
};

export const wdpaAnnualLossProcessedValue = {
  ARG: {
    country_specific_deforestation: {
      fullyRestrictive: [
        { year: 2014, value: 318.76, approximateValue: false },
        { year: 2015, value: 726.92, approximateValue: false },
        { year: 2016, value: 827.41, approximateValue: false },
        { year: 2017, value: 590.16, approximateValue: false },
        { year: 2018, value: 475.83, approximateValue: false },
        { year: 2019, value: 688.24, approximateValue: false },
        { year: 2020, value: 934.67, approximateValue: false },
        { year: 2021, value: 456.85, approximateValue: false },
        { year: 2022, value: 751.19, approximateValue: false },
      ],
      lessRestricted: [
        { year: 2014, value: 822.79, approximateValue: false },
        { year: 2015, value: 743.14, approximateValue: false },
        { year: 2016, value: 289.67, approximateValue: true },
        { year: 2017, value: 420.12, approximateValue: false },
        { year: 2018, value: 952.37, approximateValue: false },
        { year: 2019, value: 177.48, approximateValue: false },
        { year: 2020, value: 134.91, approximateValue: false },
        { year: 2021, value: 579.28, approximateValue: false },
        { year: 2022, value: 659.81, approximateValue: false },
      ],
    },
    tree_cover_loss: {
      fullyRestrictive: [
        { year: 2014, value: 0, approximateValue: false },
        { year: 2015, value: 721.93, approximateValue: false },
        { year: 2016, value: 111.06, approximateValue: false },
        { year: 2017, value: 963.85, approximateValue: false },
        { year: 2018, value: 785.37, approximateValue: false },
        { year: 2019, value: 441.15, approximateValue: false },
        { year: 2020, value: 622.79, approximateValue: true },
        { year: 2021, value: 268.13, approximateValue: false },
        { year: 2022, value: 52.77, approximateValue: false },
      ],
      lessRestricted: [
        { year: 2014, value: 402.04, approximateValue: false },
        { year: 2015, value: 148.02, approximateValue: false },
        { year: 2016, value: 337.62, approximateValue: false },
        { year: 2017, value: 900.28, approximateValue: false },
        { year: 2018, value: 854.44, approximateValue: false },
        { year: 2019, value: 645.73, approximateValue: false },
        { year: 2020, value: 823.39, approximateValue: false },
        { year: 2021, value: 527.78, approximateValue: false },
        { year: 2022, value: 487.29, approximateValue: false },
      ],
    },
  },
  BRA: {
    country_specific_deforestation: {
      fullyRestrictive: [
        { year: 2014, value: 291.58, approximateValue: false },
        { year: 2015, value: 56.93, approximateValue: false },
        { year: 2016, value: 468.72, approximateValue: false },
        { year: 2017, value: 629.47, approximateValue: false },
        { year: 2018, value: 332.15, approximateValue: false },
        { year: 2019, value: 639.28, approximateValue: false },
        { year: 2020, value: 959.81, approximateValue: false },
        { year: 2021, value: 47.39, approximateValue: false },
        { year: 2022, value: 122.57, approximateValue: false },
      ],
      lessRestricted: [
        { year: 2014, value: 791.36, approximateValue: false },
        { year: 2015, value: 227.81, approximateValue: false },
        { year: 2016, value: 725.02, approximateValue: false },
        { year: 2017, value: 622.91, approximateValue: false },
        { year: 2018, value: 833.07, approximateValue: false },
        { year: 2019, value: 588.19, approximateValue: false },
        { year: 2020, value: 413.26, approximateValue: false },
        { year: 2021, value: 895.74, approximateValue: false },
        { year: 2022, value: 274.83, approximateValue: false },
      ],
    },
    tree_cover_loss: {
      fullyRestrictive: [
        { year: 2014, value: 820.17, approximateValue: false },
        { year: 2015, value: 678.73, approximateValue: false },
        { year: 2016, value: 182.34, approximateValue: false },
        { year: 2017, value: 461.72, approximateValue: false },
        { year: 2018, value: 741.15, approximateValue: false },
        { year: 2019, value: 235.91, approximateValue: false },
        { year: 2020, value: 975.28, approximateValue: false },
        { year: 2021, value: 752.69, approximateValue: false },
        { year: 2022, value: 125.68, approximateValue: false },
      ],
      lessRestricted: [
        { year: 2014, value: 18.72, approximateValue: false },
        { year: 2015, value: 561.49, approximateValue: false },
        { year: 2016, value: 957.84, approximateValue: false },
        { year: 2017, value: 320.05, approximateValue: false },
        { year: 2018, value: 739.21, approximateValue: false },
        { year: 2019, value: 823.17, approximateValue: false },
        { year: 2020, value: 607.26, approximateValue: false },
        { year: 2021, value: 284.98, approximateValue: false },
        { year: 2022, value: 172.54, approximateValue: false },
      ],
    },
  },
};

export const landmarkDatabaseOutput = {
  overlapCountry: [
    {
      totalArea: 314.2081,
      landmarkByCategoryArea: '{}',
    },
    {
      totalArea: 45.6463,
      landmarkByCategoryArea: '{"Not Reported":45.6463}',
    },
    {
      totalArea: 5024.1901,
      landmarkByCategoryArea: '{}',
    },
    {
      totalArea: 299.3889,
      landmarkByCategoryArea: '{"Not Reported":299.3889}',
    },
    {
      totalArea: 20001.9047,
      landmarkByCategoryArea: '{"Not Reported":10398.914}',
    },
  ],
  annualLoss: {
    country_specific_deforestation_landmark_yearly:
      '{"ARG": {  "Not Reported": {"2014": 822.79,"2016": 289.67,"2017": 420.12,"2018": 952.37,"2019": 177.48,"2020": 134.91,"2021": 579.28,"2022": 659.81, "2015approx": 743.14 },  "II": {"2014": 318.76,"2015": 726.92,"2016": 827.41,"2017": 590.16,"2018": 475.83,"2019": 688.24,"2020": 934.67,"2021": 456.85,"2022": 751.19  }},"BRA": {  "Not Reported": {"2014": 791.36,"2015": 227.81,"2016": 725.02,"2017": 622.91,"2018": 833.07,"2019": 588.19,"2020": 413.26,"2021": 895.74,"2022": 274.83  },  "II": {"2014": 291.58,"2015": 56.93,"2016": 468.72,"2017": 629.47,"2018": 332.15,"2019": 639.28,"2020": 959.81,"2021": 47.39,"2022": 122.57  }}}',
    tree_cover_loss_by_country_landmark_yearly:
      '{"ARG": {"Not Reported": {"2014": 402.04,"2015": 148.02,"2016": 337.62,"2017": 900.28,"2019": 645.73,"2020": 823.39,"2021": 527.78,"2022": 487.29, "2018approx": 854.44}, "II": {"2014": 0,"2015": 721.93,"2016": 111.06,"2017": 963.85,"2018": 785.37,"2019": 441.15,"2020": 622.79,"2021": 268.13,"2022": 52.77}}, "BRA": {"Not Reported": {"2014": 18.72,"2015": 561.49,"2016": 957.84,"2017": 320.05,"2018": 739.21,"2019": 823.17,"2020": 607.26,"2021": 284.98,"2022": 172.54},"II": {"2014": 820.17,"2015": 678.73,"2016": 182.34,"2017": 461.72,"2018": 741.15,"2019": 235.91,"2020": 975.28,"2021": 752.69,"2022": 125.68 }}}',
  },
};

export const landmarkAnnualLossProcessedValue = {
  ARG: {
    country_specific_deforestation: {
      indigenous: [
        { year: 2014, value: 822.79, approximateValue: false },
        { year: 2015, value: 743.14, approximateValue: true },
        { year: 2016, value: 289.67, approximateValue: false },
        { year: 2017, value: 420.12, approximateValue: false },
        { year: 2018, value: 952.37, approximateValue: false },
        { year: 2019, value: 177.48, approximateValue: false },
        { year: 2020, value: 134.91, approximateValue: false },
        { year: 2021, value: 579.28, approximateValue: false },
        { year: 2022, value: 659.81, approximateValue: false },
      ],
    },
    tree_cover_loss: {
      indigenous: [
        { year: 2014, value: 402.04, approximateValue: false },
        { year: 2015, value: 148.02, approximateValue: false },
        { year: 2016, value: 337.62, approximateValue: false },
        { year: 2017, value: 900.28, approximateValue: false },
        { year: 2018, value: 854.44, approximateValue: true },
        { year: 2019, value: 645.73, approximateValue: false },
        { year: 2020, value: 823.39, approximateValue: false },
        { year: 2021, value: 527.78, approximateValue: false },
        { year: 2022, value: 487.29, approximateValue: false },
      ],
    },
  },
  BRA: {
    country_specific_deforestation: {
      indigenous: [
        { year: 2014, value: 791.36, approximateValue: false },
        { year: 2015, value: 227.81, approximateValue: false },
        { year: 2016, value: 725.02, approximateValue: false },
        { year: 2017, value: 622.91, approximateValue: false },
        { year: 2018, value: 833.07, approximateValue: false },
        { year: 2019, value: 588.19, approximateValue: false },
        { year: 2020, value: 413.26, approximateValue: false },
        { year: 2021, value: 895.74, approximateValue: false },
        { year: 2022, value: 274.83, approximateValue: false },
      ],
    },
    tree_cover_loss: {
      indigenous: [
        { year: 2014, value: 18.72, approximateValue: false },
        { year: 2015, value: 561.49, approximateValue: false },
        { year: 2016, value: 957.84, approximateValue: false },
        { year: 2017, value: 320.05, approximateValue: false },
        { year: 2018, value: 739.21, approximateValue: false },
        { year: 2019, value: 823.17, approximateValue: false },
        { year: 2020, value: 607.26, approximateValue: false },
        { year: 2021, value: 284.98, approximateValue: false },
        { year: 2022, value: 172.54, approximateValue: false },
      ],
    },
  },
};

export const countryDatabaseOutput = {
  annualLoss: {
    country_specific_deforestation_yearly:
      '{"ARG": { "2014": 822.79,"2016": 289.67,"2017": 420.12,"2018": 952.37,"2019": 177.48,"2020": 134.91,"2021": 579.28,"2022": 659.81, "2015approx": 743.14 },"BRA": {"2014": 791.36,"2015": 227.81,"2016": 725.02,"2017": 622.91,"2018": 833.07,"2019": 588.19,"2020": 413.26,"2021": 895.74,"2022": 274.83 }}',
    tree_cover_loss_by_country_yearly:
      '{"ARG": {"2014": 402.04,"2015": 148.02,"2016": 337.62,"2017": 900.28,"2019": 645.73,"2020": 823.39,"2021": 527.78,"2022": 487.29, "2018approx": 854.44}, "BRA": {"2014": 18.72,"2015": 561.49,"2016": 957.84,"2017": 320.05,"2018": 739.21,"2019": 823.17,"2020": 607.26,"2021": 284.98,"2022": 172.54 }}',
  },
};

export const countryAnnualLossProcessedValue = {
  ARG: {
    country_specific_deforestation: [
      { year: 2014, value: 822.79, approximateValue: false },
      { year: 2015, value: 743.14, approximateValue: true },
      { year: 2016, value: 289.67, approximateValue: false },
      { year: 2017, value: 420.12, approximateValue: false },
      { year: 2018, value: 952.37, approximateValue: false },
      { year: 2019, value: 177.48, approximateValue: false },
      { year: 2020, value: 134.91, approximateValue: false },
      { year: 2021, value: 579.28, approximateValue: false },
      { year: 2022, value: 659.81, approximateValue: false },
    ],
    tree_cover_loss: [
      { year: 2014, value: 402.04, approximateValue: false },
      { year: 2015, value: 148.02, approximateValue: false },
      { year: 2016, value: 337.62, approximateValue: false },
      { year: 2017, value: 900.28, approximateValue: false },
      { year: 2018, value: 854.44, approximateValue: true },
      { year: 2019, value: 645.73, approximateValue: false },
      { year: 2020, value: 823.39, approximateValue: false },
      { year: 2021, value: 527.78, approximateValue: false },
      { year: 2022, value: 487.29, approximateValue: false },
    ],
  },
  BRA: {
    country_specific_deforestation: [
      { year: 2014, value: 791.36, approximateValue: false },
      { year: 2015, value: 227.81, approximateValue: false },
      { year: 2016, value: 725.02, approximateValue: false },
      { year: 2017, value: 622.91, approximateValue: false },
      { year: 2018, value: 833.07, approximateValue: false },
      { year: 2019, value: 588.19, approximateValue: false },
      { year: 2020, value: 413.26, approximateValue: false },
      { year: 2021, value: 895.74, approximateValue: false },
      { year: 2022, value: 274.83, approximateValue: false },
    ],
    tree_cover_loss: [
      { year: 2014, value: 18.72, approximateValue: false },
      { year: 2015, value: 561.49, approximateValue: false },
      { year: 2016, value: 957.84, approximateValue: false },
      { year: 2017, value: 320.05, approximateValue: false },
      { year: 2018, value: 739.21, approximateValue: false },
      { year: 2019, value: 823.17, approximateValue: false },
      { year: 2020, value: 607.26, approximateValue: false },
      { year: 2021, value: 284.98, approximateValue: false },
      { year: 2022, value: 172.54, approximateValue: false },
    ],
  },
};

export const classifiedRegionDatabaseOutput = {
  arg_otbn_area: '{"Category I":2487.9471,"Category II":315.8723}',
  country_specific_deforestation_classified_region_yearly:
    '{"ARG":{"Category I":{"2014":1862.5321,"2015":1674.5525,"2016approx":575.1893,"2017":2158.1914,"2018":1818.3752,"2019":734.738,"2020":1352.6918,"2021":2363.4077,"2022":1660.059}, "Category III": {"2014": 1971.8851, "2015": 2480.3844, "2016": 1073.1832, "2017": 2739.4738, "2018approx": 1229.8696, "2019": 905.7677, "2020": 976.3013, "2021": 2390.0133, "2022": 2149.3627}}}',
  tree_cover_loss_arg_otbn_yearly:
    '{"Category III": {"2014": 1971.8851, "2015": 2480.3844, "2016": 1073.1832, "2017": 2739.4738, "2018approx": 1229.8696, "2019": 905.7677, "2020": 976.3013, "2021": 2390.0133, "2022": 2149.3627}}',
};

export const classifiedAnnualLossProcessedValue = {
  country_specific_deforestation: {
    'Category I': [
      { year: 2014, value: 1862.5321, approximateValue: false },
      { year: 2015, value: 1674.5525, approximateValue: false },
      { year: 2016, value: 575.1893, approximateValue: true },
      { year: 2017, value: 2158.1914, approximateValue: false },
      { year: 2018, value: 1818.3752, approximateValue: false },
      { year: 2019, value: 734.738, approximateValue: false },
      { year: 2020, value: 1352.6918, approximateValue: false },
      { year: 2021, value: 2363.4077, approximateValue: false },
      { year: 2022, value: 1660.059, approximateValue: false },
    ],
    'Category III': [
      { year: 2014, value: 1971.8851, approximateValue: false },
      { year: 2015, value: 2480.3844, approximateValue: false },
      { year: 2016, value: 1073.1832, approximateValue: false },
      { year: 2017, value: 2739.4738, approximateValue: false },
      { year: 2018, value: 1229.8696, approximateValue: true },
      { year: 2019, value: 905.7677, approximateValue: false },
      { year: 2020, value: 976.3013, approximateValue: false },
      { year: 2021, value: 2390.0133, approximateValue: false },
      { year: 2022, value: 2149.3627, approximateValue: false },
    ],
  },
  tree_cover_loss: {
    'Category III': [
      { year: 2014, value: 1971.8851, approximateValue: false },
      { year: 2015, value: 2480.3844, approximateValue: false },
      { year: 2016, value: 1073.1832, approximateValue: false },
      { year: 2017, value: 2739.4738, approximateValue: false },
      { year: 2018, value: 1229.8696, approximateValue: true },
      { year: 2019, value: 905.7677, approximateValue: false },
      { year: 2020, value: 976.3013, approximateValue: false },
      { year: 2021, value: 2390.0133, approximateValue: false },
      { year: 2022, value: 2149.3627, approximateValue: false },
    ],
  },
};
