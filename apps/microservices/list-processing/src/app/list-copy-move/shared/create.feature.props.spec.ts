import { ListSchema } from '@wri-monorepos/sql';
import { createFeatureProps } from './create.feature.props';
import { ColumnType } from 'typeorm';

describe('createFeatureProps', () => {
  // Mock ListSchema.columns with the correct structure
  const mockColumns = {
    locationName: {
      type: 'varchar' as ColumnType,
      name: 'Location Name',
    },
    latitude: {
      type: 'float' as ColumnType,
      name: 'Latitude',
    },
    longitude: {
      type: 'float' as ColumnType,
      name: 'Longitude',
    },
    analysisRadius: {
      type: 'float' as ColumnType,
      name: 'Analysis Radius',
      nullable: true,
    },
    analysisArea: {
      type: 'float' as ColumnType,
      name: 'Analysis Area',
      nullable: true,
    },
    commodity: {
      type: 'varchar' as ColumnType,
      name: 'Commodity',
    },
    country: {
      type: 'varchar' as ColumnType,
      name: 'Country',
      nullable: true,
    },
    state: {
      type: 'varchar' as ColumnType,
      name: 'State',
      nullable: true,
    },
    subState: {
      type: 'varchar' as ColumnType,
      name: 'Sub State',
      nullable: true,
    },
    gadmid: {
      type: 'varchar' as ColumnType,
      name: 'gadmid',
      nullable: true,
    },
    geometry: {
      type: 'varchar' as ColumnType,
      name: 'Geometry',
      nullable: true,
    },
    locationId: {
      type: 'int' as ColumnType,
      primary: true,
      name: 'location_id',
      nullable: true,
    },
    attributes: {
      type: 'varchar' as ColumnType,
      name: 'attributes',
    },
    errorDetails: {
      type: 'varchar' as ColumnType,
      name: 'ErrorDetails',
      nullable: true,
    },
  };

  beforeEach(() => {
    // Mock ListSchema.columns before each test
    ListSchema.columns = mockColumns;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should transform location data into feature properties', () => {
    const locationData = [
      {
        'Location Name': 'Test Location 1',
        Latitude: 10.5,
        Longitude: 20.5,
        'Analysis Radius': 1000,
        'Analysis Area': 500,
        Commodity: 'Palm Oil',
        Country: 'Indonesia',
        State: 'Sumatra',
        'Sub State': 'North Sumatra',
        gadmid: 'IDN.1.1',
        Geometry: 'POINT(20.5 10.5)',
        location_id: 1,
        attributes: '{"key": "value"}',
        ErrorDetails: null,
      },
      {
        'Location Name': 'Test Location 2',
        Latitude: 11.5,
        Longitude: 21.5,
        'Analysis Radius': 2000,
        'Analysis Area': 1000,
        Commodity: 'Soy',
        Country: 'Brazil',
        State: 'Mato Grosso',
        'Sub State': null,
        gadmid: 'BRA.1.1',
        Geometry: 'POINT(21.5 11.5)',
        location_id: 2,
        attributes: '{"key": "value2"}',
        ErrorDetails: null,
      },
    ];

    const result = createFeatureProps(locationData);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      'Location Name': 'Test Location 1',
      Latitude: 10.5,
      Longitude: 20.5,
      'Analysis Radius': 1000,
      'Analysis Area': 500,
      Commodity: 'Palm Oil',
      Country: 'Indonesia',
      State: 'Sumatra',
      'Sub State': 'North Sumatra',
      gadmid: 'IDN.1.1',
      Geometry: 'POINT(20.5 10.5)',
      location_id: 1,
      attributes: '{"key": "value"}',
      ErrorDetails: null,
    });
    expect(result[1]).toEqual({
      'Location Name': 'Test Location 2',
      Latitude: 11.5,
      Longitude: 21.5,
      'Analysis Radius': 2000,
      'Analysis Area': 1000,
      Commodity: 'Soy',
      Country: 'Brazil',
      State: 'Mato Grosso',
      'Sub State': null,
      gadmid: 'BRA.1.1',
      Geometry: 'POINT(21.5 11.5)',
      location_id: 2,
      attributes: '{"key": "value2"}',
      ErrorDetails: null,
    });
  });

  it('should handle empty location data', () => {
    const locationData = [];
    const result = createFeatureProps(locationData);
    expect(result).toEqual([]);
  });

  it('should handle location data with missing fields', () => {
    const locationData = [
      {
        'Location Name': 'Test Location 1',
        Latitude: 10.5,
        // missing longitude
        'Analysis Radius': 1000,
        // missing analysisArea
        Commodity: 'Palm Oil',
        // missing country
        State: 'Sumatra',
        // missing subState
        gadmid: 'IDN.1.1',
        // missing geometry
        location_id: 1,
        // missing attributes
        // missing errorDetails
      },
    ];

    const result = createFeatureProps(locationData);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      'Location Name': 'Test Location 1',
      Latitude: 10.5,
      Longitude: undefined,
      'Analysis Radius': 1000,
      'Analysis Area': undefined,
      Commodity: 'Palm Oil',
      Country: undefined,
      State: 'Sumatra',
      'Sub State': undefined,
      gadmid: 'IDN.1.1',
      Geometry: undefined,
      location_id: 1,
      attributes: undefined,
      ErrorDetails: undefined,
    });
  });
});
