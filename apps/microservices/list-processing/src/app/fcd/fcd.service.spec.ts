import { SQLUtils } from '@wri-monorepos/sql';
import { FCDService } from './fcd.service';
import {
  wdpaDatabaseOutput,
  wdpaAnnualLossProcessedValue,
  landmarkDatabaseOutput,
  landmarkAnnualLossProcessedValue,
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
      ...wdpaAnnualLossProcessedValue[countryGadm],
      overlap: { fullyRestrictive: 16600.2927, lessRestricted: 3485.8852 },
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
