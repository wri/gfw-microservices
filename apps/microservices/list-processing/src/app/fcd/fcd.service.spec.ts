import { SQLUtils } from '@wri-monorepos/sql';
import { FCDService } from './fcd.service';
import {
  overlapProtectedAreasWdpaData,
  annualLossWdpaData,
  annualLossLandmarkData,
  overlapCountryWrongFormatLandmarkData,
  annualLossWrongFormatLandmarkData,
  overlapCountryLandmarkData,
} from './fixture';

describe('WDPA Category', () => {
  let fcdService: FCDService;

  beforeEach(() => {
    fcdService = new FCDService();
    jest.restoreAllMocks();
  });

  it('handleWDPACategoryForList should correctly process country specific data', () => {
    jest
      .spyOn(SQLUtils, 'queryDB')
      .mockImplementation(() => Promise.resolve(overlapProtectedAreasWdpaData));

    jest
      .spyOn(SQLUtils, 'queryDBFirstRow')
      .mockImplementation(() => Promise.resolve(annualLossWdpaData));

    expect(
      fcdService.handleWDPACategoryForList('1', {
        clientDatabase: 'TestCo',
        countryGadm: 'ARG',
        country: 'Argentina',
        locationId: 5,
      })
    ).resolves.toEqual({
      country_specific_deforestation: {
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
      },
      tree_cover_loss: {
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
      },
      overlap: { fullyRestrictive: 16600.2927, lessRestricted: 3335.8852 },
    });
  });

  it(`handleWDPACategoryForList when database is null is empty`, () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation(() => Promise.resolve([]));
    jest.spyOn(SQLUtils, 'queryDBFirstRow').mockImplementation(() =>
      Promise.resolve({
        countrySpecificDeforestationWdpaYearly: '{}',
        treeCoverLossByCountryWdpaYearly: '{}',
      })
    );

    expect(
      fcdService.handleWDPACategoryForList('1', {
        country: 'Argentina',
        clientDatabase: 'TestCo',
        locationId: 5,
        countryGadm: 'ARG',
      })
    ).resolves.toStrictEqual({
      country_specific_deforestation: {
        fullyRestrictive: {},
        lessRestricted: {},
      },
      tree_cover_loss: {
        fullyRestrictive: {},
        lessRestricted: {},
      },
      overlap: {
        fullyRestrictive: 0,
        lessRestricted: 0,
      },
    });
  });
});

describe('Landmark Overlap Country', () => {
  let fcdService: FCDService;

  beforeEach(() => {
    fcdService = new FCDService();
    jest.restoreAllMocks();
  });
  it('Should return landmark obj in correct format when json database', () => {
    jest
      .spyOn(SQLUtils, 'queryDB')
      .mockImplementation(() => Promise.resolve(overlapCountryLandmarkData));

    jest
      .spyOn(SQLUtils, 'queryDBFirstRow')
      .mockImplementation(() => Promise.resolve(annualLossLandmarkData));

    expect(
      fcdService.handleLandmarkCategoryForList('5692', {
        country: 'Argentina',
        clientDatabase: 'production',
        locationId: null,
        countryGadm: 'ARG',
      })
    ).resolves.toStrictEqual({
      landmark: {
        country_specific_deforestation: {
          indigenous: {
            '2001': 8.2756,
            '2002': 0,
            '2003': 0,
            '2004': 2.5036,
            '2005': 0.5563,
            '2006': 2.7816,
            '2007': 0.4172,
            '2008': 1.1823,
            '2009': 3.8248,
            '2010': 225.4062,
            '2011': 1143.0575,
            '2012': 95.1385,
            '2013': 414.1285,
            '2014': 1.1126,
            '2015': 0,
            '2016': 44.5754,
            '2017': 12.5167,
            '2018': 0.3477,
            '2019': 0.1391,
            '2020': 4.4509,
            '2021': 0.5563,
            '2022': 0.3477,
          },
        },
        tree_cover_loss: {
          indigenous: {
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
            '2013': 0.8037,
            '2014': 0,
            '2015': 0,
            '2016': 0,
            '2017': 0,
            '2018': 0,
            '2019': 0,
            '2020': 0,
            '2021': 0,
            '2022': 0,
          },
        },
        overlap: {
          indigenous: 10743.949200000001,
          nonIndigenous: 14941.388899999998,
        },
      },
    });
  });

  it('Should return empty obj for country_specific_deforestation & tree_cover_loss and 0 for overlap when database values are empty', () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation(() => Promise.resolve([]));

    expect(
      fcdService.handleLandmarkCategoryForList('5692', {
        country: 'Argentina',
        clientDatabase: 'production',
        locationId: null,
        countryGadm: 'ARG',
      })
    ).resolves.toStrictEqual({
      landmark: {
        country_specific_deforestation: {
          indigenous: {},
        },
        tree_cover_loss: {
          indigenous: {},
        },
        overlap: {
          indigenous: 0,
          nonIndigenous: 0,
        },
      },
    });
  });

  it('Should return empty obj for country_specific_deforestation & tree_cover_loss and 0 for overlap when database json is invalid', () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation((_, __, parameters) => {
      if (parameters.some((x) => x.field === 'country')) {
        return Promise.resolve(overlapCountryWrongFormatLandmarkData);
      } else {
        return Promise.resolve([annualLossWrongFormatLandmarkData]);
      }
    });

    expect(
      fcdService.handleLandmarkCategoryForList('5692', {
        country: 'Argentina',
        clientDatabase: 'production',
        locationId: null,
        countryGadm: 'ARG',
      })
    ).resolves.toStrictEqual({
      landmark: {
        country_specific_deforestation: {
          indigenous: {},
        },
        tree_cover_loss: {
          indigenous: {},
        },
        overlap: {
          indigenous: 0,
          nonIndigenous: 0,
        },
      },
    });
  });
});
