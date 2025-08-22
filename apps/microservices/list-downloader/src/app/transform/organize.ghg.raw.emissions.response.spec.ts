import { OrganizeGHGRawEmissionsResponse } from "./organize.ghg.raw.emissions.response";

describe('OrganizeGHGRawEmissionsResponse', () => {
  test('when receive an empty object', () => {
    const organizeGHGRawEmissionsResponse = new OrganizeGHGRawEmissionsResponse();
    organizeGHGRawEmissionsResponse._transform({}, '', (err, data) => {
      expect(data).toEqual([]);
    });
  });

  test('When receive an analysis', () => {
    const organizeGHGRawEmissionsResponse = new OrganizeGHGRawEmissionsResponse();
    organizeGHGRawEmissionsResponse._transform(
      {
        listId: 5642,
        listName: 'kgTestCG3 927 all',
        locationName: 'location name 2',
        totalAreaHa: 1256.1646821446757,
        statusCode: 2,
        locationError: null,
        commodity: 'Soybeans',
        combinedEmissionsFactor: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
        co2LinearDiscountedEmission: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
        ch4LinearDiscountedEmission: '{"2021":121.8186,"2022":229.1142,"2023":0.0}',
        n2oLinearDiscountedEmission: '{"2021":122.8186,"2022":230.1142,"2023":0.0}',
        CombinedLinearDiscountedEmission: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
        weightedAvgYield: 12.0,
        production: 1000,
      },
      '',
      (err, data) => {
        expect(data).toEqual([
          [
            'kgTestCG3 927 all',
            'location name 2',
            1256.1646821446757,
            'Soybeans',
            'dLUC',
            12,
            1000,
            120000,
            121000,
            122000,
            120000,
            '2021',
          ],
          [
            'kgTestCG3 927 all',
            'location name 2',
            1256.1646821446757,
            'Soybeans',
            'dLUC',
            12,
            1000,
            228000,
            229000,
            230000,
            228000,
            '2022',
          ],
          [
            'kgTestCG3 927 all',
            'location name 2',
            1256.1646821446757,
            'Soybeans',
            'dLUC',
            12,
            1000,
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
    const organizeGHGRawEmissionsResponse = new OrganizeGHGRawEmissionsResponse();
    organizeGHGRawEmissionsResponse._transform(
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
