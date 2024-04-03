import { FCDService } from './fcd.service';
import {
  wdpaData,
  annualLossLandmarkData,
  overlapCountryLandmarkData,
  overlapCountryWrongFormatLandmarkData,
  annualLossWrongFormatLandmarkData,
} from './fixture';

describe('WDPA Category', () => {
  it('getAggregatedWDPAOverlapData should correctly aggregate fullyRestrictive and lessRestricted data', async () => {
    const fcdService = new FCDService();

    jest
      .spyOn(fcdService, 'getProtectedAreasByCategoryAreaData')
      .mockImplementation(() => Promise.resolve(wdpaData));

    const result = await fcdService.getAggregatedWDPAOverlapData('1', 'Argentina', 'TestCo', '5');

    expect(result).toEqual({
      fullyRestrictive: 16600.2927,
      lessRestricted: 3335.8852,
    });
  });

  it('getProcessedWDPACountrySpecificDeforestationYearlyData should correctly process country specific data', async () => {
    const fcdService = new FCDService();

    jest
      .spyOn(fcdService, 'getWdpaAnnualLossData')
      .mockImplementation(() => Promise.resolve(wdpaData));

    const result = await fcdService.getProcessedWDPACountrySpecificDeforestationYearlyData(
      'TestCo',
      '1',
      'ARG',
      '5'
    );

    expect(result).toEqual({
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
  it('Should return landmark obj in correct format when json database', async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve(overlapCountryLandmarkData));

    jest
      .spyOn(fcdService, 'getLandmarkAnnualLossData')
      .mockImplementation(() => Promise.resolve(annualLossLandmarkData));

    const result = await fcdService.getAggregatedLandmark(
      '5692',
      'Argentina',
      'production',
      '',
      'ARG'
    );
    expect(result).toStrictEqual({
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
    });
  });

  it('Should return empty obj for country_specific_deforestation & tree_cover_loss and 0 for overlap when database values are empty', async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve([]));

    jest
      .spyOn(fcdService, 'getLandmarkAnnualLossData')
      .mockImplementation(() => Promise.resolve(null));

    const result = await fcdService.getAggregatedLandmark(
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
      tree_cover_loss: {
        indigenous: {},
      },
      overlap: {
        indigenous: 0,
        nonIndigenous: 0,
      },
    });
  });

  it('Should return empty obj for country_specific_deforestation & tree_cover_loss and 0 for overlap when database json is invalid', async () => {
    const fcdService = new FCDService();
    jest
      .spyOn(fcdService, 'getLandmarkOverlapCountryData')
      .mockImplementation(() => Promise.resolve(overlapCountryWrongFormatLandmarkData));

    jest
      .spyOn(fcdService, 'getLandmarkAnnualLossData')
      .mockImplementation(() => Promise.resolve(annualLossWrongFormatLandmarkData));

    const result = await fcdService.getAggregatedLandmark(
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
      tree_cover_loss: {
        indigenous: {},
      },
      overlap: {
        indigenous: 0,
        nonIndigenous: 0,
      },
    });
  });
});
