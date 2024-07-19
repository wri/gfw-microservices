import Point from '@arcgis/core/geometry/Point';
import * as GeometryEngine from '@arcgis/core/geometry/geometryEngine';

export const defaultLocationRadius = 4; // kilometers (medium buffer)

// create a geometry object by buffering the given point into a poly
// based off of Analysis_Radius/Analysis_Area
export function geomFromPointRadiusArea(point, featureRadius, featureArea) {
  let radius;
  if (featureRadius) {
    radius = parseFloat(featureRadius);
    if (isNaN(radius) || radius <= 0) {
      throw new Error('Invalid radius value');
    }
  } else if (featureArea) {
    const kilosSquared = parseFloat(featureArea) / 100;
    if (isNaN(kilosSquared) || kilosSquared <= 0) {
      throw new Error('Invalid area value');
    }
    radius = Math.sqrt(kilosSquared / Math.PI).toFixed(2);
  } else {
    radius = defaultLocationRadius;
  }
  return GeometryEngine.geodesicBuffer(point, radius, 'kilometers');
}

export function geomFromLatLongRadiusArea(
  latitudeInput,
  longitudeInput,
  featureRadius,
  featureArea
) {
  const latitude = parseFloat(latitudeInput);
  const longitude = parseFloat(longitudeInput);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude or longitude value');
  }

  const point = new Point({
    latitude,
    longitude,
    spatialReference: { wkid: 4326 },
  });
  return geomFromPointRadiusArea(point, featureRadius, featureArea);
}
