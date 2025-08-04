import { OrganizeGreenHouseGasEmissionsResponse } from './organize.ghg.response';

describe('OrganizeGreenHouseGasEmissionsResponse', () => {
  test('when receive an empty object', () => {
    const organizeGreenHouseGasEmissionsResponse = new OrganizeGreenHouseGasEmissionsResponse();
    organizeGreenHouseGasEmissionsResponse._transform({}, '', (err, data) => {
      expect(data).toEqual([]);
    });
  });

  test('When receive an analysis', () => {
    const organizeGreenHouseGasEmissionsResponse = new OrganizeGreenHouseGasEmissionsResponse();
    organizeGreenHouseGasEmissionsResponse._transform(
      {
        listId: 5642,
        listName: 'kgTestCG3 927 all',
        locationName: 'location name 2',
        country: 'Country Name',
        state: 'State Name',
        subState: 'Substate Name',
        totalAreaHa: 1256.1646821446757,
        statusCode: 2,
        locationError: null,
        commodity: 'Soybeans',
        combinedEmissionsFactor: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual([
          [
            'kgTestCG3 927 all',
            'location name 2',
            'Country Name',
            'State Name',
            'Substate Name',
            1256.1646821446757,
            'Soybeans',
            'dLUC',
            0,
            0,
            0,
            120.8186,
            '2021',
          ],
          [
            'kgTestCG3 927 all',
            'location name 2',
            'Country Name',
            'State Name',
            'Substate Name',
            1256.1646821446757,
            'Soybeans',
            'dLUC',
            0,
            0,
            0,
            228.1142,
            '2022',
          ],
          [
            'kgTestCG3 927 all',
            'location name 2',
            'Country Name',
            'State Name',
            'Substate Name',
            1256.1646821446757,
            'Soybeans',
            'dLUC',
            0,
            0,
            0,
            0,
            '2023',
          ],
        ]);
      }
    );
  });

  test('When dont receive all important fields', () => {
    const organizeGreenHouseGasEmissionsResponse = new OrganizeGreenHouseGasEmissionsResponse();
    organizeGreenHouseGasEmissionsResponse._transform(
      {
        listId: 5642,
        listName: 'kgTestCG3 927 all',
        locationName: 'location name 2',
        totalAreaHa: 1256.1646821446757,
        statusCode: 2,
        locationError: null,
        combinedEmissionsFactor: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual([]);
      }
    );
  });
});
