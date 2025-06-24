import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';

export const createResultsGraphic = async (item) => {
  await new Promise((resolve) => setTimeout(resolve, 0)); // Force the browser to render the loader first

  const geojson = JSON.parse(item.gfw_geojson);

  if (geojson.type !== 'MultiPolygon') {
    console.error('GeoJSON is not a MultiPolygon:', geojson);
    return [];
  }

  const polygons = geojson.coordinates.map((polygonCoords) => {
    return new Polygon({
      rings: polygonCoords[0],
      spatialReference: { wkid: 4326 },
    });
  });

  const mergedGeometry = geometryEngine.union(polygons);

  const graphic = new Graphic({
    geometry: mergedGeometry,
    attributes: item,
    symbol: {
      type: 'simple-fill',
      color: [0, 120, 255, 0.3],
      outline: {
        color: [0, 120, 255, 1],
        width: 2,
      },
    },
  });

  return graphic;
};
