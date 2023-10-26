import { FCDService } from "./fcd.service";

describe('WDPA Overlap Country', () => {
  const data = [
    {
      listId: 5692,
      locationId: 2,
      protectedAreasByCategoryArea: '{}'
    },
    {
      listId: 5692,
      locationId: 3,
      protectedAreasByCategoryArea: '{}'
    },
    {
      listId: 5692,
      locationId: 4,
      protectedAreasByCategoryArea: '{}'
    },
    {
      listId: 5692,
      locationId: 6,
      protectedAreasByCategoryArea: '{"Category Ia":1620.7222,"Category II":156.9743,"Category VI":0.2748}'
    },
  ]

  it(``, async() => {
    const fcdService = new FCDService();
    jest.spyOn(fcdService, 'getProtectedAreasByCategoryAreaData').mockImplementation(() => Promise.resolve(data));

    const result = await fcdService.aggregateOverlapByCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      "fullyRestrictive": 1777.6965,
      "lessRestricted": 0.2748,
    });

  });


  it(``, async() => {
    const fcdService = new FCDService();
    jest.spyOn(fcdService, 'getProtectedAreasByCategoryAreaData').mockImplementation(() => Promise.resolve(undefined));

    const result = await fcdService.aggregateOverlapByCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      "fullyRestrictive": 0,
      "lessRestricted": 0,
    });

  });


  it(``, async() => {
    const fcdService = new FCDService();
    jest.spyOn(fcdService, 'getProtectedAreasByCategoryAreaData').mockImplementation(() => Promise.resolve([]));

    const result = await fcdService.aggregateOverlapByCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      "fullyRestrictive": 0,
      "lessRestricted": 0,
    });

  });
});

describe('Landmark Overlap Country', () => {
  const data = [
    {
      listId: 5692,
      locationId: 2,
      totalArea: 314.208100,
      landmarkByCategoryArea: '{}'
    },
    {
      listId: 5692,
      locationId: 3,
      totalArea: 313.064800,
      landmarkByCategoryArea: '{"Not Reported":313.0648}'
    },
    {
      listId: 5692,
      locationId: 4,
      totalArea: 5024.190100,
      landmarkByCategoryArea: '{}'
    },
    {
      listId: 5692,
      locationId: 6,
      totalArea: 5025.206700,
      landmarkByCategoryArea: '{"Not Reported":909.8068}'
    },
  ]

  it(``, async() => {
    const fcdService = new FCDService();
    jest.spyOn(fcdService, 'getLandmarkOverlapCountryData').mockImplementation(() => Promise.resolve(data));

    const result = await fcdService.landmarkOverlapCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      "indigenous": 1222.8716,
      "nonIndegenous": 3802.3351,
    });
  });

  it(``, async() => {
    const fcdService = new FCDService();
    jest.spyOn(fcdService, 'getLandmarkOverlapCountryData').mockImplementation(() => Promise.resolve(undefined));

    const result = await fcdService.landmarkOverlapCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      "indigenous": 0,
      "nonIndegenous": 0
    });
  });

  it(``, async() => {
    const fcdService = new FCDService();
    jest.spyOn(fcdService, 'getLandmarkOverlapCountryData').mockImplementation(() => Promise.resolve([]));

    const result = await fcdService.landmarkOverlapCountry('5692', 'Argentina', 'production');
    expect(result).toStrictEqual({
      "indigenous": 0,
      "nonIndegenous": 0,
    });
  });

});



