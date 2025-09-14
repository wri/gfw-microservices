import { SQLUtils } from '@wri-monorepos/sql';
import { FCDService } from './fcd.service';
import {
  wdpaDatabaseOutput,
  wdpaAnnualLossProcessedValue,
  landmarkDatabaseOutput,
  landmarkAnnualLossProcessedValue,
  countryDatabaseOutput,
  countryAnnualLossProcessedValue,
  classifiedAnnualLossProcessedValue,
  classifiedRegionDatabaseOutput,
  classifiedRegionDatabaseOutputWithoutNewTclData,
} from './fixture';

describe('WDPA - handleWDPACategoryForList', () => {
  let fcdService: FCDService;

  beforeEach(() => {
    fcdService = new FCDService();
    jest.restoreAllMocks();
  });

  it.each(['ARG', 'BRA'])('should return the data correctly for each country', (countryGadm) => {
    jest
      .spyOn(SQLUtils, 'queryDB')
      .mockImplementation(() => Promise.resolve(wdpaDatabaseOutput.overlapProtectedAreas));

    jest
      .spyOn(SQLUtils, 'queryDBFirstRow')
      .mockImplementation(() => Promise.resolve(wdpaDatabaseOutput.annualLoss));

    expect(
      fcdService.handleWDPACategoryForList(1, {
        clientDatabase: 'TestCo',
        countryGadm,
        country: 'Argentina',
        locationId: 5,
      })
    ).resolves.toEqual({
      overlap: { fullyRestrictive: 16600.2927, lessRestricted: 3485.8852 },
      ...wdpaAnnualLossProcessedValue[countryGadm],
    });
  });

  it('should return empty WDPA obj when database fields are empty', () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation(() => Promise.resolve([]));
    jest.spyOn(SQLUtils, 'queryDBFirstRow').mockImplementation(() =>
      Promise.resolve({
        country_specific_deforestation_wdpa_yearly: '{}',
        tree_cover_loss_by_country_wdpa_yearly: '{}',
      })
    );

    expect(
      fcdService.handleWDPACategoryForList(1, {
        country: 'Argentina',
        clientDatabase: 'TestCo',
        locationId: 5,
        countryGadm: 'ARG',
      })
    ).resolves.toStrictEqual({
      country_specific_deforestation: {
        fullyRestrictive: [],
        lessRestricted: [],
      },
      tree_cover_loss: {
        fullyRestrictive: [],
        lessRestricted: [],
      },
      overlap: {
        fullyRestrictive: 0,
        lessRestricted: 0,
      },
    });
  });
});

describe('Landmark - handleLandmarkCategoryForList', () => {
  let fcdService: FCDService;

  beforeEach(() => {
    fcdService = new FCDService();
    jest.restoreAllMocks();
  });
  it.each(['ARG', 'BRA'])('should return the data correctly for each country', (countryGadm) => {
    jest
      .spyOn(SQLUtils, 'queryDB')
      .mockImplementation(() => Promise.resolve(landmarkDatabaseOutput.overlapCountry));

    jest
      .spyOn(SQLUtils, 'queryDBFirstRow')
      .mockImplementation(() => Promise.resolve(landmarkDatabaseOutput.annualLoss));

    expect(
      fcdService.handleLandmarkCategoryForList(1, {
        clientDatabase: 'TestCo',
        countryGadm,
        country: 'Argentina',
        locationId: 5,
      })
    ).resolves.toEqual({
      ...landmarkAnnualLossProcessedValue[countryGadm],
      overlap: {
        indigenous: 10743.949200000001,
        nonIndigenous: 14941.388899999998,
      },
    });
  });

  it('should return empty landmark obj when database fields are empty', () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation(() => Promise.resolve([]));

    jest.spyOn(SQLUtils, 'queryDBFirstRow').mockImplementation(() =>
      Promise.resolve({
        country_specific_deforestation_landmark_yearly: '{}',
        tree_cover_loss_by_country_landmark_yearly: '{}',
      })
    );

    expect(
      fcdService.handleLandmarkCategoryForList(5692, {
        country: 'Argentina',
        clientDatabase: 'production',
        locationId: null,
        countryGadm: 'ARG',
      })
    ).resolves.toStrictEqual({
      country_specific_deforestation: {
        indigenous: [],
      },
      tree_cover_loss: {
        indigenous: [],
      },
      overlap: {
        indigenous: 0,
        nonIndigenous: 0,
      },
    });
  });
});

describe('Country - handleCountryCategoryForList', () => {
  let fcdService: FCDService;

  beforeEach(() => {
    fcdService = new FCDService();
    jest.restoreAllMocks();
  });
  it.each(['ARG', 'BRA'])(
    'should return the data correctly for each country',
    async (countryGadm) => {
      jest
        .spyOn(SQLUtils, 'queryDBFirstRow')
        .mockImplementation(() => Promise.resolve(countryDatabaseOutput.annualLoss));

      const result = await fcdService.handleCountryCategoryForList(1, {
        clientDatabase: 'TestCo',
        countryGadm,
        country: 'Argentina',
        locationId: 5,
      });
      expect(result).toStrictEqual(countryAnnualLossProcessedValue[countryGadm]);
    }
  );

  it('should return empty country obj when database fields are empty', () => {
    jest.spyOn(SQLUtils, 'queryDBFirstRow').mockImplementation(() =>
      Promise.resolve({
        country_specific_deforestation_yearly: '{}',
        tree_cover_loss_by_country_yearly: '{}',
      })
    );

    expect(
      fcdService.handleCountryCategoryForList(1, {
        clientDatabase: 'TestCo',
        countryGadm: 'ARG',
        country: 'Argentina',
        locationId: 5,
      })
    ).resolves.toStrictEqual({ country_specific_deforestation: [], tree_cover_loss: [] });
  });
});

describe('Classified Region - handleClassifiedRegionCategoryForList', () => {
  let fcdService: FCDService;

  beforeEach(() => {
    fcdService = new FCDService();
    jest.restoreAllMocks();
  });

  it.each(['ARG', 'COL'])(
    'should return the data correctly for each country',
    async (countryGadm) => {
      jest
        .spyOn(SQLUtils, 'queryDBFirstRow')
        .mockImplementation(() => Promise.resolve(classifiedRegionDatabaseOutput));

      expect(
        fcdService.handleClassifiedRegionCategoryForList(1, {
          clientDatabase: 'TestCo',
          countryGadm: countryGadm,
          country: 'Argentina',
          locationId: 5,
        })
      ).resolves.toStrictEqual({
        ...classifiedAnnualLossProcessedValue[countryGadm],
      });
    }
  );

  it('should return the data correctly when the field tree_cover_loss_by_country_classified_region_yearly DOES NOT EXIST - Argentina', () => {
    jest
      .spyOn(SQLUtils, 'queryDBFirstRow')
      .mockImplementation(() => Promise.resolve(classifiedRegionDatabaseOutputWithoutNewTclData));

    expect(
      fcdService.handleClassifiedRegionCategoryForList(1, {
        clientDatabase: 'TestCo',
        countryGadm: 'ARG',
        country: 'Argentina',
        locationId: 5,
      })
    ).resolves.toStrictEqual({
      ...classifiedAnnualLossProcessedValue.ARG,
      overlap: { 'Category I': 2487.9471, 'Category II': 315.8723 },
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
    });
  });

  it('should return empty classified region obj when database fields are empty', () => {
    jest.spyOn(SQLUtils, 'queryDBFirstRow').mockImplementation(() =>
      Promise.resolve({
        country_specific_deforestation_classified_region_yearly: '{}',
        arg_otbn_area: '{}',
      })
    );

    expect(
      fcdService.handleClassifiedRegionCategoryForList(1, {
        clientDatabase: 'TestCo',
        countryGadm: 'ARG',
        country: 'Argentina',
        locationId: 5,
      })
    ).resolves.toStrictEqual({
      overlap: {},
      country_specific_deforestation: {},
      tree_cover_loss: {},
    });
  });
});
