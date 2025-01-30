import { Logger } from '@nestjs/common';
import { ProcessUploadData } from './process.upload.data';
import { ConvertPoint2Polygon } from './convert.point.2.polygon';
import { Feature } from '@wri-monorepos/geo';
import { ChainType } from './types';
import { ClientStoreConnection } from '@wri-monorepos/sql';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock('./convert.point.2.polygon', () => ({
  ConvertPoint2Polygon: jest.fn(),
}));

const requestMock = {
  organization_id: 1,
  subscription_status_id: 2,
  organization_database: 'testDb',
  list_id: 173,
  path: 'ei66192vm56txqq1-gpv3646 working input_input - gpv3646 working input_input (2).csv',
  template_id: 13,
  template_type: 'cocoa_generic',
  user_id: 1,
  startAnalysis: true,
  list_name: 'gpv3648 sample feature 4',
  analysisIds: ['FCD', 'AFI', 'ALERTS'],
  fileDownloadedPath:
    '/tmp/ei66192vm56txqq1-gpv3646 working input_input - gpv3646 working input_input (2).csv',
  listTable: 'list-gpv3648samplefeature4',
  analysisTable: 'analysis-gpv3648samplefeature4',
  listStatusId: 1,
  locationClassification: 'Property',
  customAttributeNames: '',
  customAttributeTypes: '',
};

describe('ProcessUploadData', () => {
  let service: ProcessUploadData;
  let convertPoint2PolygonMock: ConvertPoint2Polygon;
  let mockFindOne;

  beforeEach(async () => {
    const mockGetConnection = jest.fn();
    mockFindOne = jest.fn();

    convertPoint2PolygonMock = {
      convertFeature: jest.fn().mockImplementation((feature: Feature) => Promise.resolve(feature)),
    } as any;

    service = new ProcessUploadData();
    (service as any).convertPoint2Polygon = convertPoint2PolygonMock;

    (ClientStoreConnection.prototype.getConnection as jest.Mock) = mockGetConnection;
    mockGetConnection.mockReturnValue({
      getRepository: jest.fn().mockReturnValue({
        findOne: mockFindOne,
      }),
    });
  });

  describe('processFeatureAttributes', () => {
    it('should not include columnsToExclude or required fields in attributes', () => {
      const featurePayload: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          locationName: 'Sample Location',
          longitude: 100,
          latitude: 0,
          commodity: 'Gold',
          errorDetails: 'None',
          someCustomField: 'CustomValue',
          randomField: 'RandomValue',
        },
      };

      const result = service['processFeatureAttributes'](featurePayload);
      const parsedAttributes = JSON.parse(result.properties.attributes as string);

      expect(parsedAttributes.find((attr: any) => attr.field === 'locationName')).toBeUndefined();
      expect(parsedAttributes.find((attr: any) => attr.field === 'longitude')).toBeUndefined();
      expect(parsedAttributes.find((attr: any) => attr.field === 'latitude')).toBeUndefined();
      expect(parsedAttributes.find((attr: any) => attr.field === 'commodity')).toBeUndefined();
      expect(parsedAttributes.find((attr: any) => attr.field === 'errorDetails')).toBeUndefined();
      expect(parsedAttributes.find((attr: any) => attr.field === 'someCustomField')).toBeDefined();
      expect(parsedAttributes.find((attr: any) => attr.field === 'randomField')).toBeDefined();
    });

    it('should set custom = true for fields not in the schema and infer types correctly', () => {
      const featurePayload: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          integerField: 42,
          floatField: 42.42,
          stringField: 'Test',
          booleanField: true,
          arrayField: [1, 2, 3],
          objectField: { key: 'value' },
        },
      };

      const result = service['processFeatureAttributes'](featurePayload);
      const parsedAttributes = JSON.parse(result.properties.attributes as string);

      expect(parsedAttributes.find((attr: any) => attr.field === 'integerField').type).toBe(
        'number'
      );
      expect(parsedAttributes.find((attr: any) => attr.field === 'floatField').type).toBe('string');
      expect(parsedAttributes.find((attr: any) => attr.field === 'stringField').type).toBe(
        'string'
      );
      expect(parsedAttributes.find((attr: any) => attr.field === 'booleanField').type).toBe(
        'boolean'
      );
      expect(parsedAttributes.find((attr: any) => attr.field === 'arrayField').type).toBe('string');
      expect(parsedAttributes.find((attr: any) => attr.field === 'objectField').type).toBe(
        'string'
      );

      parsedAttributes.forEach((attr: any) => {
        expect(attr.custom).toBe(true);
      });
    });

    it('should stringfy geometry', () => {
      const featurePayload: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {},
      };
      const result = service['processFeatureAttributes'](featurePayload);
      expect(typeof result.geometry).toBe('object');
      expect(result.geometry).toStrictEqual({ coordinates: [100, 0], type: 'Point' });
    });
  });

  describe('handle', () => {
    it('should process each feature and append locationId', async () => {
      mockFindOne.mockResolvedValue({
        Commodity: 'test',
      });

      const request: ChainType = {
        request: requestMock,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [10, 20],
              },
              properties: {},
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [30, 40],
              },
              properties: {},
            },
          ],
        },
        locations: [],
      };

      const result = await service.handle(request);
      expect(convertPoint2PolygonMock.convertFeature).toHaveBeenCalledTimes(2);
      expect(result.geojson).toStrictEqual({
        features: [
          {
            geometry: {
              coordinates: [10, 20],
              type: 'Point',
            },
            properties: {
              attributes: '[]',
              commodity: 'test',
              geometry: 'POINT (10 20)',
              locationId: 1,
            },
            type: 'Feature',
          },
          {
            geometry: {
              coordinates: [30, 40],
              type: 'Point',
            },
            properties: {
              attributes: '[]',
              commodity: 'test',
              geometry: 'POINT (30 40)',
              locationId: 2,
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
      expect(result.locations.length).toBe(2);
    });

    it('should catch errors in feature processing', async () => {
      mockFindOne.mockResolvedValue({
        Commodity: 'test',
      });

      (convertPoint2PolygonMock.convertFeature as jest.Mock).mockRejectedValueOnce(
        new Error('convert error')
      );
      const request: ChainType = {
        request: requestMock,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [10, 20],
              },
              properties: {},
            },
          ],
        },
        locations: [],
      };

      const result = await service.handle(request);
      expect(Logger).toHaveBeenCalled();
      expect(result.geojson).toStrictEqual({
        features: [
          {
            geometry: {
              coordinates: [10, 20],
              type: 'Point',
            },
            properties: {},
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
    });
  });
});
