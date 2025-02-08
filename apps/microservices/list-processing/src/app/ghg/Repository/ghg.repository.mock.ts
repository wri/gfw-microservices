import { jest } from '@jest/globals';

export class GHGRepositoryMock {
  findOne = jest.fn(async () => {
    return [
      {
        listId: 1,
        listName: 'mockedListName',
        locationId: 2,
        totalAreaHa: 1.2921,
        statusCode: 2,
        locationError: null,
        commodity: 'SOYB',
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.3258}',
      },
      {
        listId: 1,
        listName: 'mockedListName',
        locationId: 3,
        totalAreaHa: 1.1921,
        statusCode: 2,
        locationError: null,
        commodity: 'SOYB',
        emissionsFactorByYear: '{"2021":0.5839,"2022":0.1825,"2023":0.4258}',
      },
    ];
  });
}
