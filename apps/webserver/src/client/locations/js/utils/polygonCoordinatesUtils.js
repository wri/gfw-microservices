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

export const calculateFontSizeForZoom = (zoom) => {
  const minFontSize = 1; // Extremely small before disappearing
  const maxFontSize = 12;
  const minZoom = 5.5; // Visibility threshold
  const maxZoom = 12; // Where we reach max font size

  // Exponential curve that drops DRASTICALLY at lower zoom levels
  // This gives us 1-2 extra zoom levels with very small fonts before hiding
  const zoomRange = maxZoom - minZoom;
  const fontRange = maxFontSize - minFontSize;

  // Use very steep exponential scaling - extremely aggressive decrease at low zooms
  const normalizedZoom = Math.max(0, Math.min(1, (zoom - minZoom) / zoomRange));
  const exponentialFactor = Math.pow(normalizedZoom, 0.3); // Even lower power = much steeper curve

  const fontSize = minFontSize + fontRange * exponentialFactor;

  return Math.max(1, Math.round(fontSize)); // Ensure minimum 1px
};

export const shouldShowCoordinatesAtZoom = (zoom) => {
  // Hide coordinate labels when zoomed out too far to prevent overcrowding
  const minZoomForCoordinates = 5.5;
  return zoom >= minZoomForCoordinates;
};

export const calculateScreenDistance = (mapView, point1, point2) => {
  const screenPoint1 = mapView.toScreen(point1);
  const screenPoint2 = mapView.toScreen(point2);

  if (!screenPoint1 || !screenPoint2) {
    return Infinity; // If points can't be projected, assume far apart
  }

  const dx = screenPoint1.x - screenPoint2.x;
  const dy = screenPoint1.y - screenPoint2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const shouldShowLabelBasedOnDistance = (mapView, point, allPoints, minDistance = 50) => {
  // Check if this label has enough space from other points
  for (let i = 0; i < allPoints.length; i++) {
    const otherPoint = allPoints[i];

    // Skip comparing point to itself
    if (
      point === otherPoint ||
      (point.latitude === otherPoint.latitude && point.longitude === otherPoint.longitude)
    ) {
      continue;
    }

    const distance = calculateScreenDistance(mapView, point, otherPoint);

    // If any other point is too close, hide this label
    if (distance < minDistance) {
      return false;
    }
  }

  return true;
};

export const getDecimalPrecisionForZoom = (zoom) => {
  // Use fewer decimal places when zoomed out - very aggressive reduction for extra zoom steps
  if (zoom >= 10) {
    return 3; // High precision when zoomed in
  }
  if (zoom >= 8.5) {
    return 2; // Medium precision
  }
  if (zoom >= 7) {
    return 1; // Low precision
  }
  if (zoom >= 6) {
    return 0; // No decimals - just whole numbers
  }
  return 0; // Stay at 0 decimals at lowest zooms
};

export const addCoordinateTextFromPoint = (mapView, point, zoom = null) => {
  const currentZoom = zoom !== null ? zoom : mapView.zoom;
  const fontSize = calculateFontSizeForZoom(currentZoom);
  const precision = getDecimalPrecisionForZoom(currentZoom);
  const shouldShow = shouldShowCoordinatesAtZoom(currentZoom);

  const textSymbol = new TextSymbol({
    text: `${point.latitude.toFixed(precision)}, ${point.longitude.toFixed(precision)}`,
    color: 'black',
    haloColor: 'white',
    haloSize: '2px',
    yoffset: -15,
    font: {
      size: fontSize,
    },
  });

  const textGraphic = new Graphic({
    geometry: point,
    symbol: textSymbol,
    visible: shouldShow,
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
