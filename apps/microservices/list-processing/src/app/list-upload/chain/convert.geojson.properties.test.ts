import { ConvertGeojsonProperties } from './convert.geojson.properties';
import { ChainType } from './types';
import { FeatureCollection } from '@wri-monorepos/geo';

describe('ConvertGeojsonProperties', () => {
  let handler: ConvertGeojsonProperties;

  beforeEach(() => {
    handler = new ConvertGeojsonProperties();
  });

  it('should convert geojson properties according to ListSchema', async () => {
    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            'Location Name': 'Location A',
            Latitude: 10.0,
            Longitude: 20.0,
            'Unknown Property': 'Some Value',
          },
          geometry: {
            type: 'Point',
            coordinates: [20.0, 10.0],
          },
        },
      ],
    };

    const expectedGeojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            locationName: 'Location A', // Converted key
            latitude: 10.0, // Converted key
            longitude: 20.0, // Converted key
            'Unknown Property': 'Some Value', // Unchanged key
          },
          geometry: {
            type: 'Point',
            coordinates: [20.0, 10.0],
          },
        },
      ],
    };

    const request: ChainType = {
      geojson,
    } as ChainType;

    const result = await handler.handle(request);

    expect(result.geojson).toEqual(expectedGeojson);
  });
});
