import { FCDService } from './fcd.service';

describe('WDPA Overlap Country', () => {
  const data = [
    {
      listId: 5692,
      locationId: 2,
      protectedAreasByCategoryArea: '{}',
    },
    {
      listId: 5692,
      locationId: 3,
      protectedAreasByCategoryArea: '{}',
    },
    {
      listId: 5692,
      locationId: 4,
      protectedAreasByCategoryArea: '{}',
    },
    {
      listId: 5692,
      locationId: 6,
      protectedAreasByCategoryArea:
        '{"Category Ia":1620.7222,"Category II":156.9743,"Category VI":0.2748}',
    },
  ];

  it(`When the input array has 4 locations`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve(data));

    const result = await fcdService.getAggregatedWDPAOverlapByCountry(
      '5692',
      'Argentina',
      'production',
      ''
    );
    expect(result).toStrictEqual({
      fullyRestrictive: 1777.6965,
      lessRestricted: 0.2748,
    });
  });

  it(`When the input array has 4 locations with specific locationId is requested`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve(data));

    const result = await fcdService.getAggregatedWDPAOverlapByCountry(
      '5692',
      'Argentina',
      'production',
      '3'
    );
    expect(result).toStrictEqual({
      fullyRestrictive: 1777.6965,
      lessRestricted: 0.2748,
    });
  });

  it(`When the input is undefined`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve(undefined));

    const result = await fcdService.getAggregatedWDPAOverlapByCountry(
      '5692',
      'Argentina',
      'production',
      ''
    );
    expect(result).toStrictEqual({
      fullyRestrictive: 0,
      lessRestricted: 0,
    });
  });

  it(`When the input array is empty`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve([]));

    const result = await fcdService.getAggregatedWDPAOverlapByCountry(
      '5692',
      'Argentina',
      'production',
      '3'
    );
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
      countrySpecificDeforestation: '{}',
    },
    {
      listId: 5692,
      locationId: 3,
      totalArea: 45.6463,
      landmarkByCategoryArea: '{"Not Reported":45.6463}',
      countrySpecificDeforestation:
        '{"ARG":{"Not Reported":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.8037,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}}}',
    },
    {
      listId: 5692,
      locationId: 4,
      totalArea: 5024.1901,
      landmarkByCategoryArea: '{}',
      countrySpecificDeforestation:
        '{"ARG":{"Not Reported":{"2001":8.2756,"2002":0.0,"2003":0.0,"2004":2.5036,"2005":0.5563,"2006":2.7816,"2007":0.4172,"2008":1.1823,"2009":3.8248,"2010":225.4062,"2011":1143.0575,"2012":95.1385,"2013":414.1285,"2014":1.1126,"2015":0.0,"2016":44.5754,"2017":12.5167,"2018":0.3477,"2019":0.1391,"2020":4.4509,"2021":0.5563,"2022":0.3477}}}',
    },
    {
      listId: 5692,
      locationId: 6,
      totalArea: 299.3889,
      landmarkByCategoryArea: '{"Not Reported":299.3889}',
      countrySpecificDeforestation:
        '{"ARG":{"Not Reported":{"2001":223.3446,"2002":0.4896,"2003":3.0773,"2004":4.3379,"2005":9.9319,"2006":3.7765,"2007":19.9348,"2008":21.8881,"2009":3.4275,"2010":2.519,"2011":6.5724,"2012":29.9316,"2013":88.8256,"2014":8.9507,"2015":0.0,"2016":0.3497,"2017":2.0976,"2018":6.0161,"2019":0.0,"2020":54.9729,"2021":1.3286,"2022":12.8712}}}',
    },
    {
      listId: 5692,
      locationId: 6,
      totalArea: 20001.9047,
      landmarkByCategoryArea: '{"Not Reported":10398.914}',
      countrySpecificDeforestation:
        '{"BRA":{"Not Reported":{"2001":0.2827,"2002":1.06,"2003":15.3373,"2004":51.0978,"2005":17.1756,"2006":9.3287,"2007":4.1701,"2008":22.2609,"2009":6.29,"2010":11.5896,"2011":7.4918,"2012":84.9459,"2013":89.2608,"2014":7.1391,"2015":5.0878,"2016":52.7918,"2017":12.7911,"2018":5.3006,"2019":20.4286,"2020":7.0681,"2021":30.4587,"2022":408.3157}}}',
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
      '',
      'ARG'
    );
    expect(result).toStrictEqual({
      country_specific_deforestation: {
        indigenous: {
          '2001': 231.6202,
          '2002': 0.4896,
          '2003': 3.0773,
          '2004': 6.8415,
          '2005': 10.4882,
          '2006': 6.5581,
          '2007': 20.352,
          '2008': 23.070400000000003,
          '2009': 7.2523,
          '2010': 227.92520000000002,
          '2011': 1149.6299,
          '2012': 125.0701,
          '2013': 503.7578,
          '2014': 10.0633,
          '2015': 0,
          '2016': 44.9251,
          '2017': 14.6143,
          '2018': 6.3637999999999995,
          '2019': 0.1391,
          '2020': 59.4238,
          '2021': 1.8849,
          '2022': 13.2189,
        },
      },
      overlap: {
        indigenous: 10743.949200000001,
        nonIndigenous: 14941.388899999998,
      },
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
      '6',
      'ARG'
    );
    expect(result).toStrictEqual({
      country_specific_deforestation: {
        indigenous: {
          '2001': 231.6202,
          '2002': 0.4896,
          '2003': 3.0773,
          '2004': 6.8415,
          '2005': 10.4882,
          '2006': 6.5581,
          '2007': 20.352,
          '2008': 23.070400000000003,
          '2009': 7.2523,
          '2010': 227.92520000000002,
          '2011': 1149.6299,
          '2012': 125.0701,
          '2013': 503.7578,
          '2014': 10.0633,
          '2015': 0,
          '2016': 44.9251,
          '2017': 14.6143,
          '2018': 6.3637999999999995,
          '2019': 0.1391,
          '2020': 59.4238,
          '2021': 1.8849,
          '2022': 13.2189,
        },
      },
      overlap: {
        indigenous: 10743.949200000001,
        nonIndigenous: 14941.388899999998,
      },
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
      '',
      'ARG'
    );
    expect(result).toStrictEqual({});
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
      '',
      'ARG'
    );
    expect(result).toStrictEqual({
      country_specific_deforestation: {
        indigenous: {},
      },
      overlap: {
        indigenous: 0,
        nonIndigenous: 0,
      },
    });
  });
});
