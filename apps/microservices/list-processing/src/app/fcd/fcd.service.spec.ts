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

    const result = await fcdService.aggregateOverlapByCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      overlap: {
        fullyRestrictive: 1777.6965,
        lessRestricted: 0.2748,
      },
    });
  });

  it(`When the input is undefined`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve(undefined));

    const result = await fcdService.aggregateOverlapByCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      overlap: {
        fullyRestrictive: 0,
        lessRestricted: 0,
      },
    });
  });

  it(`When the input array is empty`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve([]));

    const result = await fcdService.aggregateOverlapByCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      overlap: {
        fullyRestrictive: 0,
        lessRestricted: 0,
      },
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

    const result = await fcdService.landmarkOverlapCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      overlap: {
        indigenous: 10743.949200000001,
        nonIndigenous: 14941.3889,
      },
    });
  });

  it(`When the input data is undefined`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve(undefined));

    const result = await fcdService.landmarkOverlapCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      overlap: {
        indigenous: 0,
        nonIndigenous: 0,
      },
    });
  });

  it(`When the input array is empty`, async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve([]));

    const result = await fcdService.landmarkOverlapCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      overlap: {
        indigenous: 0,
        nonIndigenous: 0,
      },
    });
  });
});
