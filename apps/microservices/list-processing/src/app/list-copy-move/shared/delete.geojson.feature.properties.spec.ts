import { deleteGeoJSONFeatureProperties } from './delete.geojson.feature.properties';

describe('deleteGeoJSONFeatureProperties', () => {
  it('should delete all specified properties from GeoJSON features', () => {
    const mockGeoJSON = {
      features: [
        {
          properties: {
            list_id: '123',
            location_id: '456',
            flag_forma: true,
            flag_general: false,
            flag_glad: true,
            flag_gran_chaco: false,
            flag_terrai: true,
            flag_viirs: false,
            other_property: 'should remain',
          },
        },
        {
          properties: {
            list_id: '789',
            location_id: '012',
            flag_forma: false,
            flag_general: true,
            flag_glad: false,
            flag_gran_chaco: true,
            flag_terrai: false,
            flag_viirs: true,
            another_property: 'should remain',
          },
        },
      ],
    };

    deleteGeoJSONFeatureProperties(mockGeoJSON);

    mockGeoJSON.features.forEach((feature) => {
      expect(feature.properties.list_id).toBeUndefined();
      expect(feature.properties.location_id).toBeUndefined();
      expect(feature.properties.flag_forma).toBeUndefined();
      expect(feature.properties.flag_general).toBeUndefined();
      expect(feature.properties.flag_glad).toBeUndefined();
      expect(feature.properties.flag_gran_chaco).toBeUndefined();
      expect(feature.properties.flag_terrai).toBeUndefined();
      expect(feature.properties.flag_viirs).toBeUndefined();
    });

    // Verify other properties remain unchanged
    expect(mockGeoJSON.features[0].properties.other_property).toBe('should remain');
    expect(mockGeoJSON.features[1].properties.another_property).toBe('should remain');
  });

  it('should handle empty features array', () => {
    const mockGeoJSON = {
      features: [],
    };

    expect(() => {
      deleteGeoJSONFeatureProperties(mockGeoJSON);
    }).not.toThrow();
  });

  it('should handle features with missing properties', () => {
    const mockGeoJSON = {
      features: [
        {
          properties: {
            list_id: '123',
            // Missing other properties
          },
        },
      ],
    };

    expect(() => {
      deleteGeoJSONFeatureProperties(mockGeoJSON);
    }).not.toThrow();

    expect(mockGeoJSON.features[0].properties.list_id).toBeUndefined();
  });
});
