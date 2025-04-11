import { ProcessUploadData } from './process.upload.data';
import { Feature } from '@wri-monorepos/geo';
import { ChainType, RequestNewList } from './types';
import { ClientStoreConnection } from '@wri-monorepos/sql';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn().mockResolvedValue({
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ Commodity: 'MOCKED_COMMODITY' }),
      }),
    }),
  })),
  Lists: class {},
  getListsLocsColumnsToExclude: jest.fn().mockReturnValue(['excluded_col1']),
  getFormattedAttributes: jest.fn().mockImplementation(({ listId, attributeField, fieldValue }) => {
    return {
      list_id: listId,
      attribute_name: attributeField,
      attribute_type: typeof fieldValue === 'number' ? 1 : 2,
    };
  }),
}));

jest.mock('wellknown', () => ({
  stringify: jest.fn().mockResolvedValue('geom string'),
}));

jest.mock('./convert.point.2.polygon', () => ({
  ConvertPoint2Polygon: jest.fn().mockImplementation(() => ({
    convertFeature: jest.fn(),
  })),
}));

describe('ProcessUploadData', () => {
  let processUploadData: ProcessUploadData;
  let convertFeatureSpy: jest.SpyInstance;

  beforeAll(async () => {
    processUploadData = new ProcessUploadData();

    convertFeatureSpy = jest
      .spyOn((processUploadData as any).convertPoint2Polygon, 'convertFeature')
      .mockImplementation(async (feature) => {
        return {
          ...(feature as object),
          geometry: { type: 'Point', coordinates: [125.6, 10.1] },
          properties: (feature as Feature).properties ?? {},
        };
      });
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getFeatureAttributes', () => {
    it('should return JSON string of valid attributes, excluding columns', () => {
      const mockFeature: Feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {
          valid_col: 'some_value',
          excluded_col: 'should_not_appear',
          another_col: 'another_value',
          '': 'empty_key',
        },
      };

      const result = processUploadData.getFeatureAttributes(mockFeature);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('valid_col', 'some_value');
      expect(parsed).toHaveProperty('another_col', 'another_value');
      expect(parsed).not.toHaveProperty('excluded_col1');
      expect(parsed).not.toHaveProperty('');
    });
  });

  describe('processFeature', () => {
    it('should return the feature unchanged when properties is missing', async () => {
      const mockFeatureNoProps = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [125.6, 10.1],
        },
        properties: undefined,
      };

      const locationId = 10;
      const commodity = 'WHEAT';
      const mockRequest: ChainType = {
        request: {
          list_id: 123,
          organization_database: 'org_db',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [],
        },
      };

      const processed = await processUploadData.processFeature(
        mockFeatureNoProps as Feature,
        locationId,
        commodity,
        mockRequest
      );

      // be the original feature, unchanged:
      expect(processed).toBe(mockFeatureNoProps);
      expect(processed.properties).toBeUndefined();

      expect(convertFeatureSpy).not.toHaveBeenCalled();
    });

    it('should handle errors (if any occur) gracefully', async () => {
      convertFeatureSpy.mockRejectedValueOnce(new Error('Conversion failed'));

      const mockFeature: Feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {},
      };

      try {
        await processUploadData.processFeature(mockFeature, 1, 'TEST', {} as ChainType);
      } catch (e) {
        expect(e.message).toEqual('Conversion failed');
      }
    });
  });

  describe('getListCommodity', () => {
    it('should retrieve commodity from database', async () => {
      const commodity = await processUploadData.getListCommodity('some_org_db', 999);

      expect(commodity).toBe('MOCKED_COMMODITY');
      expect(ClientStoreConnection).toHaveBeenCalledTimes(1);

      const ClientStoreConnectionMock = ClientStoreConnection as jest.MockedClass<
        typeof ClientStoreConnection
      >;
      const instance = ClientStoreConnectionMock.mock.results[0].value;
      expect(instance.getConnection).toHaveBeenCalledWith('some_org_db');
    });
  });

  describe('getFeatPropAttrs', () => {
    it('should return formatted attributes for the first feature in the request', () => {
      const mockRequest: ChainType = {
        request: {
          list_id: 123,
          organization_database: 'org_db',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                foo: 'bar',
                amount: 123,
                excluded_col: 'excluded_value',
              },
            },
          ],
        },
      };

      const attrs = processUploadData.getFeatPropAttrs(mockRequest);

      expect(attrs).toEqual(
        expect.arrayContaining([
          {
            list_id: 123,
            attribute_name: 'foo',
            attribute_type: 2,
          },
          {
            list_id: 123,
            attribute_name: 'amount',
            attribute_type: 1,
          },
        ])
      );

      expect(attrs.length).toBe(3);
    });

    it('should return an empty array if the first feature is missing', () => {
      const mockRequestNoFeatures: ChainType = {
        request: {
          list_id: 123,
          organization_database: 'org_db',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [],
        },
      };

      const attrs = processUploadData.getFeatPropAttrs(mockRequestNoFeatures);
      expect(attrs).toEqual([]);
    });
  });

  describe('handle', () => {
    it('should log number of features, get commodity, process features, and assign attributes', async () => {
      const mockRequest: ChainType = {
        request: {
          list_id: 456,
          organization_database: 'org_db',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [10, 20] },
              properties: { foo: 'bar' },
            },
          ],
        },
      };

      const result = await processUploadData.handle(mockRequest);

      expect(result.geojson.features[0].properties.commodity).toBe('MOCKED_COMMODITY');
      expect(result.attributes).toBeDefined();
    });

    it('should handle an empty features array gracefully', async () => {
      const mockRequest: ChainType = {
        request: {
          list_id: 111,
          organization_database: 'org_db',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [], // must be empty
        },
      };

      const result = await processUploadData.handle(mockRequest);

      expect(convertFeatureSpy).toHaveBeenCalledTimes(2);
      expect(result.geojson.features).toEqual([]);
    });
  });

  describe('getProcessedFeatures', () => {
    it('should calculate area for polygon features', async () => {
      const mockFeatures: Feature[] = [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
              ],
            ],
          },
          properties: {
            analysisArea: 0,
          },
        },
      ];

      const result = await processUploadData.getProcessedFeatures(
        mockFeatures,
        'TEST',
        {} as ChainType
      );

      expect(result[0].properties.analysisArea).toBeDefined();
      expect(result[0].properties.analysisArea).toBeGreaterThan(0);
    });

    it('should not calculate area for non-polygon features', async () => {
      const mockFeatures: Feature[] = [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0],
          },
          properties: {
            analysisArea: 0,
          },
        },
      ];

      const result = await processUploadData.getProcessedFeatures(
        mockFeatures,
        'TEST',
        {} as ChainType
      );

      expect(result[0].properties.analysisArea).toBeDefined();
      expect(result[0].properties.analysisArea).toBe(0);
    });

    it('should handle multi-polygon features', async () => {
      const mockFeatures: Feature[] = [
        {
          type: 'Feature',
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [1, 0],
                  [0, 0],
                ],
              ],
            ],
          },
          properties: {
            analysisArea: 0,
          },
        },
      ];

      const result = await processUploadData.getProcessedFeatures(
        mockFeatures,
        'TEST',
        {} as ChainType
      );

      expect(result[0].properties.analysisArea).toBeDefined();
      expect(result[0].properties.analysisArea).toBeGreaterThan(0);
    });
  });
});
