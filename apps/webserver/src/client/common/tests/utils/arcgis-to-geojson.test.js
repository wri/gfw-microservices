import geoUtils from '../../js/utils/arcgis-to-geojson';

describe('geoUtils', () => {
  describe('arcgisToGeoJSON', () => {
    it('should convert ArcGIS Point to GeoJSON', () => {
      const arcgis = { x: 1, y: 2 };
      const result = geoUtils.arcgisToGeoJSON(arcgis);
      expect(result.type).toBe('Point');
      expect(result.coordinates).toEqual([1, 2]);
    });

    it('should convert ArcGIS MultiPoint to GeoJSON', () => {
      const arcgis = { points: [[1, 2], [3, 4]] };
      const result = geoUtils.arcgisToGeoJSON(arcgis);
      expect(result.type).toBe('MultiPoint');
      expect(result.coordinates).toEqual(arcgis.points);
    });

    it('should convert ArcGIS LineString to GeoJSON', () => {
      const arcgis = { paths: [[[1, 2], [3, 4]]] };
      const result = geoUtils.arcgisToGeoJSON(arcgis);
      expect(result.type).toBe('LineString');
      expect(result.coordinates).toEqual(arcgis.paths[0]);
    });

    it('should convert ArcGIS MultiLineString to GeoJSON', () => {
      const arcgis = { paths: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]] };
      const result = geoUtils.arcgisToGeoJSON(arcgis);
      expect(result.type).toBe('MultiLineString');
      expect(result.coordinates).toEqual(arcgis.paths);
    });

    it('should convert ArcGIS MultiPolygon to GeoJSON', () => {
      const arcgis = { rings: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]], [[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]] };
      const result = geoUtils.arcgisToGeoJSON(arcgis);
      expect(result.type).toBe('MultiPolygon');
      expect(result.coordinates.length).toBe(2);
    });

    it('should convert ArcGIS Feature to GeoJSON', () => {
      const arcgis = {
        geometry: { x: 1, y: 2 },
        attributes: { id: 1 }
      };
      const result = geoUtils.arcgisToGeoJSON(arcgis, 'id');
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('Point');
      expect(result.geometry.coordinates).toEqual([1, 2]);
      expect(result.properties).toEqual({ id: 1 });
      expect(result.id).toBe(1);
    });
  });

  describe('geojsonToArcGIS', () => {
    it('should convert GeoJSON Point to ArcGIS', () => {
      const geojson = { type: 'Point', coordinates: [1, 2] };
      const result = geoUtils.geojsonToArcGIS(geojson);
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
    });

    it('should convert GeoJSON MultiPoint to ArcGIS', () => {
      const geojson = { type: 'MultiPoint', coordinates: [[1, 2], [3, 4]] };
      const result = geoUtils.geojsonToArcGIS(geojson);
      expect(result.points).toEqual(geojson.coordinates);
    });

    it('should convert GeoJSON LineString to ArcGIS', () => {
      const geojson = { type: 'LineString', coordinates: [[1, 2], [3, 4]] };
      const result = geoUtils.geojsonToArcGIS(geojson);
      expect(result.paths).toEqual([geojson.coordinates]);
    });

    it('should convert GeoJSON MultiLineString to ArcGIS', () => {
      const geojson = { type: 'MultiLineString', coordinates: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]] };
      const result = geoUtils.geojsonToArcGIS(geojson);
      expect(result.paths).toEqual(geojson.coordinates);
    });

    it('should convert GeoJSON Polygon to ArcGIS', () => {
      const geojson = {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 1], [1, 1], [0, 0], [0, 0]]]
      };
      const result = geoUtils.geojsonToArcGIS(geojson);
      expect(result.rings[0]).toEqual(geojson.coordinates[0]);
    });

    it('should convert GeoJSON MultiPolygon to ArcGIS', () => {
      const geojson = {
        type: 'MultiPolygon',
        coordinates: [
          [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
          [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]]
        ]
      };
      const result = geoUtils.geojsonToArcGIS(geojson);
      expect(result.rings.length).toBe(2);
    });

    it('should convert GeoJSON Feature to ArcGIS', () => {
      const geojson = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [1, 2] },
        properties: { id: 1 },
        id: 1
      };
      const result = geoUtils.geojsonToArcGIS(geojson, 'id');
      expect(result.geometry.x).toBe(1);
      expect(result.geometry.y).toBe(2);
      expect(result.attributes.id).toBe(1);
    });

    it('should convert GeoJSON FeatureCollection to ArcGIS', () => {
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1, 2] },
            properties: { id: 1 },
            id: 1
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [3, 4] },
            properties: { id: 2 },
            id: 2
          }
        ]
      };
      const result = geoUtils.geojsonToArcGIS(geojson, 'id');
      expect(result.length).toBe(2);
      expect(result[0].geometry.x).toBe(1);
      expect(result[0].geometry.y).toBe(2);
      expect(result[0].attributes.id).toBe(1);
      expect(result[1].geometry.x).toBe(3);
      expect(result[1].geometry.y).toBe(4);
      expect(result[1].attributes.id).toBe(2);
    });

    it('should convert GeoJSON GeometryCollection to ArcGIS', () => {
      const geojson = {
        type: 'GeometryCollection',
        geometries: [
          { type: 'Point', coordinates: [1, 2] },
          { type: 'Point', coordinates: [3, 4] }
        ]
      };
      const result = geoUtils.geojsonToArcGIS(geojson);
      expect(result.length).toBe(2);
      expect(result[0].x).toBe(1);
      expect(result[0].y).toBe(2);
      expect(result[1].x).toBe(3);
      expect(result[1].y).toBe(4);
    });
  });
});
