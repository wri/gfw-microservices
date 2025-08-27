import { OrganizeGHGIntermediateOutputsResponse } from './organize.ghg.intermediate.outputs.response';

describe('OrganizeGHGIntermediateOutputsResponse', () => {
  test('when receive an empty object', () => {
    const organizeGHGIntermediateOutputsResponse = new OrganizeGHGIntermediateOutputsResponse();
    organizeGHGIntermediateOutputsResponse._transform({}, '', (err, data) => {
      expect(data).toEqual([]);
    });
  });

  test('When receive an analysis', () => {
    const organizeGHGIntermediateOutputsResponse = new OrganizeGHGIntermediateOutputsResponse();
    organizeGHGIntermediateOutputsResponse._transform(
      {
        listId: 5642,
        listName: 'kgTestCG3 927 all',
        locationName: 'location name 2',
        totalAreaHa: 1256.1646821446757,
        statusCode: 2,
        locationError: null,
        commodity: 'Soybeans',
        co2EmissionsFactor: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
        ch4EmissionsFactor: '{"2021":121.8186,"2022":229.1142,"2023":0.0}',
        n2oEmissionsFactor: '{"2021":122.8186,"2022":230.1142,"2023":0.0}',
        combinedEmissionsFactor: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
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
            120818.6,
            121818.6,
            122818.6,
            120818.6,
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
            228114.2,
            229114.2,
            230114.2,
            228114.2,
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
    const organizeGHGIntermediateOutputsResponse = new OrganizeGHGIntermediateOutputsResponse();
    organizeGHGIntermediateOutputsResponse._transform(
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
