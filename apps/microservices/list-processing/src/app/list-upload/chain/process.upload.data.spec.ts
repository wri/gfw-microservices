import { ProcessUploadData } from './process.upload.data';
import { Logger } from '@nestjs/common';
import { ChainType } from './types';

jest.mock('@wri-monorepos/sql', () => ({
  ListSchema: {
    name: 'ListSchema',
    columns: {
      id: { type: 'int', nullable: false },
      locationName: { type: 'varchar', nullable: false },
      longitude: { type: 'float', nullable: true },
      latitude: { type: 'float', nullable: true },
      commodity: { type: 'varchar', nullable: true },
    },
  },
}));

jest.mock('typeorm', () => ({
  EntitySchema: jest.fn().mockImplementation((schema) => ({
    options: schema,
  })),
}));

describe('ProcessUploadData', () => {
  let processUploadData: ProcessUploadData;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(() => {
    processUploadData = new ProcessUploadData();
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => void 0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process features and populate attributes', async () => {
    const request: ChainType = {
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              locationName: 'Location 1',
              longitude: -122.4194,
              latitude: 37.7749,
              customField1: 'Value1',
              customField2: 123,
            },
          },
        ],
      },
      request: {
        path: 'somepath',
        list_name: 'test',
        organization_database: '',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 2,
      },
    };

    const result = await processUploadData.handle(request);

    expect(loggerLogSpy).toHaveBeenCalledWith(
      'Processing uploaded properties into attributes column'
    );

    const processedFeature = result.geojson.features[0];
    const expectedAttributes = [
      {
        field: 'customField1',
        value: 'Value1',
        type: 'string',
        custom: true,
      },
      {
        field: 'customField2',
        value: 123,
        type: 'number',
        custom: true,
      },
    ];

    expect(processedFeature.properties.attributes).toEqual(JSON.stringify(expectedAttributes));

    // Ensure original properties are unchanged
    expect(processedFeature.properties.locationName).toBe('Location 1');
    expect(processedFeature.properties.longitude).toBe(-122.4194);
    expect(processedFeature.properties.latitude).toBe(37.7749);
  });

  it('should exclude properties listed in columnsToExclude', async () => {
    const request: ChainType = {
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              locationName: 'Location 2',
              errorDetails: 'Some error',
              customField: 'Custom Value',
            },
          },
        ],
      },
      request: {
        path: 'somepath',
        list_name: 'test',
        organization_database: '',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 2,
      },
    };

    const result = await processUploadData.handle(request);

    const processedFeature = result.geojson.features[0];
    const expectedAttributes = [
      {
        field: 'customField',
        value: 'Custom Value',
        type: 'string',
        custom: true,
      },
    ];

    expect(processedFeature.properties.attributes).toEqual(JSON.stringify(expectedAttributes));

    // Ensure excluded fields are not in attributes
    const attributes = JSON.parse(processedFeature.properties.attributes as string);
    const excludedFields = processUploadData['columnsToExclude'];
    attributes.forEach((attr) => {
      expect(excludedFields).not.toContain(attr.field);
    });
  });

  it('should exclude required fields from attributes', async () => {
    const request: ChainType = {
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              id: 1,
              locationName: 'Location 3',
              customField: 'Custom Value',
            },
          },
        ],
      },
      request: {
        path: 'somepath',
        list_name: 'test',
        organization_database: '',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 2,
      },
    };

    const result = await processUploadData.handle(request);

    const processedFeature = result.geojson.features[0];
    const expectedAttributes = [
      {
        field: 'customField',
        value: 'Custom Value',
        type: 'string',
        custom: true,
      },
    ];

    expect(processedFeature.properties.attributes).toEqual(JSON.stringify(expectedAttributes));

    // Ensure required fields are not in attributes
    const attributes = JSON.parse(processedFeature.properties.attributes as string);
    const requiredFields = ['id', 'locationName']; // As per ListSchema
    attributes.forEach((attr) => {
      expect(requiredFields).not.toContain(attr.field);
    });
  });

  it('should mark fields not in schema as custom', async () => {
    const request: ChainType = {
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              locationName: 'Location 4',
              newField: 'New Value',
            },
          },
        ],
      },
      request: {
        path: 'somepath',
        list_name: 'test',
        organization_database: '',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 2,
      },
    };

    const result = await processUploadData.handle(request);

    const processedFeature = result.geojson.features[0];
    const expectedAttributes = [
      {
        field: 'newField',
        value: 'New Value',
        type: 'string',
        custom: true,
      },
    ];

    expect(processedFeature.properties.attributes).toEqual(JSON.stringify(expectedAttributes));

    const attributes = JSON.parse(processedFeature.properties.attributes as string);
    expect(attributes[0].custom).toBe(true);
  });

  it('should handle properties with various data types', async () => {
    const request: ChainType = {
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              locationName: 'Location 5',
              nullField: null,
              arrayField: [1, 2, 3],
              objectField: { key: 'value' },
              numberField: 100.5,
              booleanField: true,
            },
          },
        ],
      },
      request: {
        path: 'somepath',
        list_name: 'test',
        organization_database: '',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 2,
      },
    };

    const result = await processUploadData.handle(request);

    const processedFeature = result.geojson.features[0];
    const expectedAttributes = [
      {
        field: 'nullField',
        value: null,
        type: 'string',
        custom: true,
      },
      {
        field: 'arrayField',
        value: [1, 2, 3],
        type: 'string',
        custom: true,
      },
      {
        field: 'objectField',
        value: { key: 'value' },
        type: 'string',
        custom: true,
      },
      {
        field: 'numberField',
        value: 100.5,
        type: 'string',
        custom: true,
      },
      {
        field: 'booleanField',
        value: true,
        type: 'boolean',
        custom: true,
      },
    ];

    expect(processedFeature.properties.attributes).toEqual(JSON.stringify(expectedAttributes));
  });

  it('should handle empty features array', async () => {
    const request: ChainType = {
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      request: {
        path: 'somepath',
        list_name: 'test',
        organization_database: '',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 2,
      },
    };

    const result = await processUploadData.handle(request);

    expect(result.geojson.features).toEqual([]);
    expect(loggerLogSpy).toHaveBeenCalledWith(
      'Processing uploaded properties into attributes column'
    );
  });

  it('should process a large number of features', async () => {
    const largeNumber = 1000;
    const features = [];

    for (let i = 0; i < largeNumber; i++) {
      features.push({
        properties: {
          locationName: `Location ${i}`,
          customField: `Value ${i}`,
        },
      });
    }

    const request: ChainType = {
      geojson: {
        type: 'FeatureCollection',
        features,
      },
      request: {
        path: 'somepath',
        list_name: 'test',
        organization_database: '',
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 2,
      },
    };

    const result = await processUploadData.handle(request);

    expect(result.geojson.features.length).toBe(largeNumber);

    for (let i = 0; i < largeNumber; i++) {
      const processedFeature = result.geojson.features[i];
      const expectedAttributes = [
        {
          field: 'customField',
          value: `Value ${i}`,
          type: 'string',
          custom: true,
        },
      ];

      expect(processedFeature.properties.attributes).toEqual(JSON.stringify(expectedAttributes));
    }
  });

  // type infering
  describe('inferType', () => {
    it('should infer types correctly', () => {
      expect(processUploadData['inferType'](null)).toBe('string');
      expect(processUploadData['inferType'](undefined)).toBe('undefined');
      expect(processUploadData['inferType']('string')).toBe('string');
      expect(processUploadData['inferType'](123.45)).toBe('string'); // so, string since it's not integer?
      expect(processUploadData['inferType'](true)).toBe('boolean');
      expect(processUploadData['inferType']([1, 2, 3])).toBe('string');
      expect(processUploadData['inferType']({ key: 'value' })).toBe('string');
    });
  });
});
