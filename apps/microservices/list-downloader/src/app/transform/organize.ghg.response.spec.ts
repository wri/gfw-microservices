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
        locationId: 2,
        totalAreaHA: 1256.1646821446757,
        statusCode: 2,
        locationError: null,
        commodity: 'Soybeans',
        emissionsFactorByYear: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual([
          ['kgTestCG3 927 all', 2, 1256.1646821446757, 'Soybeans', 'dLUC', 120.8186, '2021'],
          ['kgTestCG3 927 all', 2, 1256.1646821446757, 'Soybeans', 'dLUC', 228.1142, '2022'],
          ['kgTestCG3 927 all', 2, 1256.1646821446757, 'Soybeans', 'dLUC', 0, '2023'],
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
        locationId: 2,
        totalAreaHA: 1256.1646821446757,
        statusCode: 2,
        locationError: null,
        emissionsFactorByYear: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual([]);
      }
    );
  });
});
