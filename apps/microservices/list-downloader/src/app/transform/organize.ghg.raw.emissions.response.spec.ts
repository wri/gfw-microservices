import { OrganizeGHGRawEmissionsResponse } from './organize.ghg.raw.emissions.response';

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
        emissionsCo2Yearly: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
        emissionsCh4Yearly: '{"2021":121.8186,"2022":229.1142,"2023":0.0}',
        emissionsN2oYearly: '{"2021":122.8186,"2022":230.1142,"2023":0.0}',
        emissionsYearly: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
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
            120,
            121,
            122,
            120,
            '2021',
          ],
          [
            'kgTestCG3 927 all',
            'location name 2',
            1256.1646821446757,
            'Soybeans',
            'dLUC',
            228,
            229,
            230,
            228,
            '2022',
          ],
          [
            'kgTestCG3 927 all',
            'location name 2',
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
