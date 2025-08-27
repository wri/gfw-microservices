import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import { getPointGeometry, getPolygonGeometry } from './geometries';

export const newCoordinate = () => ({
  id: crypto.randomUUID(),
  latitude: '',
  longitude: '',
  errors: {},
});

export const isValidLatitude = (value) => value !== null && value >= -90 && value <= 90;
export const isValidLongitude = (value) => value !== null && value >= -180 && value <= 180;

export const createGeometryAndGraphic = ({
  coordinates,
  isPolygon,
  selectedAreaRadioOption,
  measurementUnit,
  customArea,
}) => {
  let geometry;
  if (!isPolygon) {
    // create point geometry
    geometry = getPointGeometry(coordinates, selectedAreaRadioOption, measurementUnit, customArea);
  } else {
    // create polygon geometry
    let polygonCoordinates = [...coordinates];
    const firstPoint = polygonCoordinates[0];
    const lastPoint = polygonCoordinates[polygonCoordinates.length - 1];

    // Check if the polygon is not closed
    if (
      firstPoint.longitude !== lastPoint.longitude ||
      firstPoint.latitude !== lastPoint.latitude
    ) {
      // add first coordinate to the end to close the polygon
      polygonCoordinates.push(firstPoint);
    }

    geometry = getPolygonGeometry(polygonCoordinates);
  }

  const symbol = new SimpleFillSymbol({
    color: [151, 189, 61, 0.65],
    outline: {
      color: [151, 189, 61, 1],
      width: 1,
    },
  });

  const graphic = new Graphic({
    geometry,
    symbol,
  });

  return { geometry, graphic };
};

export const extractCoordinates = (geometry) => {
  const numberOfVertices = geometry?.rings?.[0]?.length;
  if (numberOfVertices > 1) {
    const rings = geometry.rings[0];
    return rings.map(([longitude, latitude]) => ({
      id: crypto.randomUUID(),
      latitude,
      longitude,
      errors: {},
    }));
  }

  return [];
};

export const addCoordinateTextFromPoint = (mapView, point) => {
  const textSymbol = new TextSymbol({
    text: `${point.latitude.toFixed(3)}, ${point.longitude.toFixed(3)}`,
    color: 'black',
    haloColor: 'white',
    haloSize: '2px',
    yoffset: -15,
    font: {
      size: 14,
    },
  });

  const textGraphic = new Graphic({
    geometry: point,
    symbol: textSymbol,
  });

  mapView.graphics.add(textGraphic);
  return textGraphic;
};

export const addCoordinateTextFromPolygon = (polygon, mapView) => {
  // if the polygon has more than 20 vertices, the user is adding the shape from the map
  // don't show the coordinates in that case
  // as it would be useless and consume much memory
  if (polygon?.rings?.[0]?.length < 20) {
    polygon?.rings?.[0]?.forEach((coord) => {
      const point = new Point({
        longitude: coord[0],
        latitude: coord[1],
        spatialReference: polygon.spatialReference,
      });
      addCoordinateTextFromPoint(mapView, point);
    });
  }
};
