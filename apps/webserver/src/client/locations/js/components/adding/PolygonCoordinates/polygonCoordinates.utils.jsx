import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Graphic from '@arcgis/core/Graphic';
import { v4 as uuidv4 } from 'uuid';
import { getPointGeometry, getPolygonGeometry } from './geometries';

export const newCoordinate = () => ({ id: uuidv4(), latitude: '', longitude: '', errors: {} });

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
      id: uuidv4(),
      latitude,
      longitude,
      errors: {},
    }));
  }

  return [];
};
