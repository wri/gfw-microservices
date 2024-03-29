import { FCDService } from './fcd.service';

describe('WDPA Category', () => {
  const data = [
    {
      listId: 5837,
      locationId: 5,
      protectedAreasByCategoryArea: '{}',
      countrySpecificDeforestationWdpaYearly: '{"ARG":{}}',
    },
    {
      listId: 5837,
      locationId: 7,
      protectedAreasByCategoryArea: '{"Category II":16600.2927}',
      countrySpecificDeforestationWdpaYearly: '{"ARG":{"Category II":{}}}',
    },
    {
      listId: 5837,
      locationId: 3,
      protectedAreasByCategoryArea: '{}',
      countrySpecificDeforestationWdpaYearly: '{"ARG":{}}',
    },
    {
      listId: 5837,
      locationId: 9,
      protectedAreasByCategoryArea: '{}',
      countrySpecificDeforestationWdpaYearly: '{"ARG":{}}',
    },
    {
      listId: 5837,
      locationId: 8,
      protectedAreasByCategoryArea: '{"Not Reported":3335.8852}',
      countrySpecificDeforestationWdpaYearly:
        '{"ARG":{"Not Reported":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":527.781}}}',
    },
  ];

  it('getAggregatedWDPAOverlapData should correctly aggregate fullyRestrictive and lessRestricted data', async () => {
    const fcdService = new FCDService();

    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve(data));

    const result = await fcdService.getAggregatedWDPAOverlapData('1', 'Argentina', 'TestCo', '5');

    expect(result).toEqual({
      fullyRestrictive: 16600.2927,
      lessRestricted: 3335.8852,
    });
  });

  it('getProcessedWDPACountrySpecificDeforestationYearlyData should correctly process country specific data', async () => {
    const fcdService = new FCDService();

    jest
      .spyOn(fcdService, 'getWDPACountrySpecificDeforestationYearlyData')
      .mockImplementation(() => Promise.resolve(data));

    const result = await fcdService.getProcessedWDPACountrySpecificDeforestationYearlyData(
      'TestCo',
      '1',
      'ARG',
      '5'
    );

    expect(result).toEqual({
      fullyRestrictive: {},
      lessRestricted: {
        '2001': 0,
        '2002': 0,
        '2003': 0,
        '2004': 0,
        '2005': 0,
        '2006': 0,
        '2007': 0,
        '2008': 0,
        '2009': 0,
        '2010': 0,
        '2011': 0,
        '2012': 0,
        '2013': 0,
        '2014': 0,
        '2015': 0,
        '2016': 0,
        '2017': 0,
        '2018': 0,
        '2019': 0,
        '2020': 0,
        '2021': 0,
        '2022': 527.781,
      },
    });
  });

  it(`getAggregatedWDPAOverlapData when data is undefined`, async () => {
    const fcdService = new FCDService();

    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve(undefined));

    const result = await fcdService.getAggregatedWDPAOverlapData('1', 'Argentina', 'TestCo', '');

    expect(result).toStrictEqual({
      fullyRestrictive: 0,
      lessRestricted: 0,
    });
  });

  it(`getAggregatedWDPAOverlapData when getProtectedAreasByCategoryAreaData result array is empty`, async () => {
    const fcdService = new FCDService();

    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve([]));

    const result = await fcdService.getAggregatedWDPAOverlapData('1', 'Argentina', 'TestCo', '5');

    expect(result).toStrictEqual({
      fullyRestrictive: 0,
      lessRestricted: 0,
    });
  });
});

describe('Landmark Overlap Country', () => {
  const data = [
    {
      listId: 5692,
      locationId: 2,
      totalArea: 314.2081,
      landmarkByCategoryArea: '{}',
    },
    {
      listId: 5692,
      locationId: 3,
      totalArea: 45.6463,
      landmarkByCategoryArea: '{"Not Reported":45.6463}',
    },
    {
      listId: 5692,
      locationId: 4,
      totalArea: 5024.1901,
      landmarkByCategoryArea: '{}',
    },
    {
      listId: 5692,
      locationId: 6,
      totalArea: 299.3889,
      landmarkByCategoryArea: '{"Not Reported":299.3889}',
    },
    {
      listId: 5692,
      locationId: 6,
      totalArea: 20001.9047,
      landmarkByCategoryArea: '{"Not Reported":10398.914}',
    },
  ];

  it(`When have 4 locations as input array`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve(data));

    const result = await fcdService.getAggregatedLandmarkOverlapByCountry(
      '5692',
      'Argentina',
      'production',
      ''
    );
    expect(result).toStrictEqual({
      indigenous: 10743.949200000001,
      nonIndigenous: 14941.3889,
    });
  });

  it(`When have 4 locations as input array with specific locationId`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve(data));

    const result = await fcdService.getAggregatedLandmarkOverlapByCountry(
      '5692',
      'Argentina',
      'production',
      '6'
    );
    expect(result).toStrictEqual({
      indigenous: 10743.949200000001,
      nonIndigenous: 14941.3889,
    });
  });

  it(`When the input data is undefined`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve(undefined));

    const result = await fcdService.getAggregatedLandmarkOverlapByCountry(
      '5692',
      'Argentina',
      'production',
      ''
    );
    expect(result).toStrictEqual({
      indigenous: 0,
      nonIndigenous: 0,
    });
  });

  it(`When the input array is empty`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve([]));

    const result = await fcdService.getAggregatedLandmarkOverlapByCountry(
      '5692',
      'Argentina',
      'production',
      ''
    );
    expect(result).toStrictEqual({
      indigenous: 0,
      nonIndigenous: 0,
    });
  });
});
