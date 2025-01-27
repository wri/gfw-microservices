import { OrganizeNaturalForestLostResponse } from './organize.natural.forest.lost.response';

describe('OrganizeNaturalForestLostResponse', () => {
  test('when receive an empty object', () => {
    const organizeNaturalForestLostResponse = new OrganizeNaturalForestLostResponse();
    organizeNaturalForestLostResponse._transform({}, '', (err, data) => {
      expect(data).toEqual([]);
    });
  });

  test('When receive a location level analysis', () => {
    const organizeNaturalForestLostResponse = new OrganizeNaturalForestLostResponse();
    organizeNaturalForestLostResponse._transform(
      {
        listId: 5887,
        listName: 'Guilherme Other 4',
        locationId: 3,
        gadmId: null,
        coverageHA: 10.3344,
        naturalForestLossHA: 0.08,
        totalAreaHa: 19.0684,
        statusCode: 2,
        locationError: null,
        negligibleRisk: 0,
        jrcLandAreaHA: 12.9866,
        jrcLandDeforestedAreaHA: 0.08,
        jrcForestLossByYear: '{"2022":0.0343,"2023":0.0457}',
        naturalForestLossByYear: '{"2022":0.0343,"2023":0.0457}',
        protectedAreasArea: null,
        landmarkArea: null,
        locationName: 'B',
        country: 'Argentina',
        state: 'Salta',
        subState: 'General José de San Martín',
        sbtn_total: 0.07999999999999999,
        jrc_total: 0.07999999999999999,
        totalHa: 100,
      },
      '',
      (err, data) => {
        expect(data).toEqual([
          [
            'Guilherme Other 4',
            'B',
            'Argentina',
            'Salta',
            'General José de San Martín',
            19.0684,
            12.9866,
            0.07999999999999999,
            0.0343,
            '2022',
            'JRC',
          ],
          [
            'Guilherme Other 4',
            'B',
            'Argentina',
            'Salta',
            'General José de San Martín',
            19.0684,
            12.9866,
            0.07999999999999999,
            0.0457,
            '2023',
            'JRC',
          ],
          [
            'Guilherme Other 4',
            'B',
            'Argentina',
            'Salta',
            'General José de San Martín',
            19.0684,
            10.3344,
            0.07999999999999999,
            0.0343,
            '2022',
            'SBTN',
          ],
          [
            'Guilherme Other 4',
            'B',
            'Argentina',
            'Salta',
            'General José de San Martín',
            19.0684,
            10.3344,
            0.07999999999999999,
            0.0457,
            '2023',
            'SBTN',
          ],
        ]);
      }
    );
  });

  test('When receive a list level analysis', () => {
    const organizeNaturalForestLostResponse = new OrganizeNaturalForestLostResponse('list');
    organizeNaturalForestLostResponse._transform(
      {
        listId: 5887,
        listName: 'Guilherme Other 4',
        locationId: -1,
        gadmId: null,
        coverageHA: 10.3344,
        naturalForestLossHA: 0.08,
        totalAreaHa: 19.0684,
        statusCode: 2,
        locationError: null,
        negligibleRisk: 0,
        jrcLandAreaHA: 12.9866,
        jrcLandDeforestedAreaHA: 0.08,
        jrcForestLossByYear: '{"2022":0.0343,"2023":0.0457}',
        naturalForestLossByYear: '{"2022":0.0343,"2023":0.0457}',
        protectedAreasArea: null,
        landmarkArea: null,
        country: 'Argentina',
        state: 'Salta',
        subState: 'General José de San Martín',
        sbtn_total: 0.07999999999999999,
        jrc_total: 0.07999999999999999,
      },
      '',
      (err, data) => {
        expect(data).toEqual([
          [
            'Guilherme Other 4',
            'Argentina',
            'Salta',
            'General José de San Martín',
            19.0684,
            12.9866,
            0.07999999999999999,
            0.0343,
            '2022',
            'JRC',
          ],
          [
            'Guilherme Other 4',
            'Argentina',
            'Salta',
            'General José de San Martín',
            19.0684,
            12.9866,
            0.07999999999999999,
            0.0457,
            '2023',
            'JRC',
          ],
          [
            'Guilherme Other 4',
            'Argentina',
            'Salta',
            'General José de San Martín',
            19.0684,
            10.3344,
            0.07999999999999999,
            0.0343,
            '2022',
            'SBTN',
          ],
          [
            'Guilherme Other 4',
            'Argentina',
            'Salta',
            'General José de San Martín',
            19.0684,
            10.3344,
            0.07999999999999999,
            0.0457,
            '2023',
            'SBTN',
          ],
        ]);
      }
    );
  });

  test('When dont receive all important fields', () => {
    const organizeNaturalForestLostResponse = new OrganizeNaturalForestLostResponse('list');
    organizeNaturalForestLostResponse._transform(
      {
        listId: 5887,
        listName: 'Guilherme Other 4',
        locationId: -1,
        gadmId: null,
        coverageHA: 10.3344,
        naturalForestLossHA: 0.08,
        totalAreaHa: 19.0684,
        statusCode: 2,
        locationError: null,
        negligibleRisk: 0,
        jrcLandAreaHA: 12.9866,
        jrcLandDeforestedAreaHA: 0.08,
        protectedAreasArea: null,
        landmarkArea: null,
        country: 'Argentina',
        state: 'Salta',
        subState: 'General José de San Martín',
      },
      '',
      (err, data) => {
        expect(data).toEqual([]);
      }
    );
  });
});
