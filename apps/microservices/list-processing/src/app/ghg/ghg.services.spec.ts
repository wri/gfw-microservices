import { SQLUtils } from '@wri-monorepos/sql';
import { GHGService } from './ghg.service';

describe('GHG - service', () => {
  let ghgService: GHGService;

  beforeEach(() => {
    ghgService = new GHGService();
    jest.restoreAllMocks();
  });

  it(`Should return Number of Pages`, async () => {
    jest.spyOn(SQLUtils, 'queryDBFirstRow').mockImplementation(() =>
      Promise.resolve({
        pages: 2,
        clientDatabase: 'mockDatabase',
        rowsPerPage: 5,
      })
    );

    const response = await ghgService.getNumberOfPagesGHGAnalysis('5692', {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 5,
    });
    expect(response).toEqual({
      pages: 2,
      clientDatabase: 'mockDatabase',
      rowsPerPage: 5,
    });
  });
  it(`Should not find Number of Pages for an inexistent id`, async () => {
    jest.spyOn(SQLUtils, 'queryDBFirstRow').mockImplementation(() =>
      Promise.resolve({
        pages: 0,
        clientDatabase: 'mockDatabase',
        rowsPerPage: 1,
      })
    );

    const response = await ghgService.getNumberOfPagesGHGAnalysis('2', {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 5,
    });
    expect(response).toEqual({
      pages: 0,
      clientDatabase: 'mockDatabase',
      rowsPerPage: 1,
    });
  });
  it(`Should return GHG Data Per Page`, async () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation(() =>
      Promise.resolve([
        {
          listId: 1,
          listName: null,
          locationId: 2,
          totalAreaHa: 1.2921,
          statusCode: 2,
          locationError: null,
          emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
        },
        {
          listId: 1,
          listName: null,
          locationId: 3,
          totalAreaHa: 1.1921,
          statusCode: 2,
          locationError: null,
          emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
        },
      ])
    );

    const response = await ghgService.getGHGDataPerPage('1', {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });
    expect(response).toEqual([
      {
        listId: 1,
        listName: null,
        locationId: 2,
        totalAreaHa: 1.2921,
        statusCode: 2,
        locationError: null,
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
      },
      {
        listId: 1,
        listName: null,
        locationId: 3,
        totalAreaHa: 1.1921,
        statusCode: 2,
        locationError: null,
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
      },
    ]);
  });
  it(`Should not find GHG data for an inexistent ID`, async () => {
    jest.spyOn(SQLUtils, 'queryDB').mockImplementation(() => Promise.resolve([]));

    const response = await ghgService.getGHGDataPerPage('2', {
      clientDatabase: 'mockDatabase',
      rowsPerPage: 2,
      pageNumber: 0,
    });
    expect(response).toEqual([]);
  });
});
