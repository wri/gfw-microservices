/*
 ** TODO:
 **  We should not be using or increment this file
 **  This file is a copy of the file from client/common/js/utils/arcgis-to-geojson.js
 **  JIRA CARD - https://gfw.atlassian.net/browse/GPV-3618
 */
export type Point = [number, number];
export type Ring = Point[];
export type Polygon = Ring[];
export type MultiPolygon = Polygon[];

export interface ArcGISGeometry {
  x?: number;
  y?: number;
  points?: Point[];
  paths?: Point[][];
  rings?: Ring[];
  geometry?: ArcGISGeometry;
  attributes?: Record<string, any>;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: any;
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry | null;
  properties: Record<string, any> | null;
  id?: string | number;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface GeoJSONGeometryCollection {
  type: 'GeometryCollection';
  geometries: GeoJSONGeometry[];
}

export function pointsEqual(a: Point, b: Point): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function closeRing(coordinates: Ring): Ring {
  if (!pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
    coordinates.push(coordinates[0]);
  }
  return coordinates;
}

export function ringIsClockwise(ringToTest: Ring): boolean {
  let total = 0;
  let pt1 = ringToTest[0];
  for (let i = 0; i < ringToTest.length - 1; i++) {
    const pt2 = ringToTest[i + 1];
    total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
    pt1 = pt2;
  }
  return total >= 0;
}

export function vertexIntersectsVertex(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
  const uaT = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
  const ubT = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
  const uB = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

  if (uB !== 0) {
    const ua = uaT / uB;
    const ub = ubT / uB;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return true;
    }
  }

  return false;
}

export function arrayIntersectsArray(a: Ring, b: Ring): boolean {
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < b.length - 1; j++) {
      if (vertexIntersectsVertex(a[i], a[i + 1], b[j], b[j + 1])) {
        return true;
      }
    }
  }

  return false;
}

export function coordinatesContainPoint(coordinates: Ring, point: Point): boolean {
  let contains = false;
  for (let i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
    if (
      ((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1]) ||
        (coordinates[j][1] <= point[1] && point[1] < coordinates[i][1])) &&
      point[0] <
        ((coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1])) /
          (coordinates[j][1] - coordinates[i][1]) +
          coordinates[i][0]
    ) {
      contains = !contains;
    }
  }
  return contains;
}

export function coordinatesContainCoordinates(outer: Ring, inner: Ring): boolean {
  const intersects = arrayIntersectsArray(outer, inner);
  const contains = coordinatesContainPoint(outer, inner[0]);
  return !intersects && contains;
}

export function convertRingsToGeoJSON(rings: Ring[]): GeoJSONGeometry {
  const outerRings: Polygon[] = [];
  const holes: Ring[] = [];
  let outerRing: Ring;

  for (const ring of rings) {
    const closedRing = closeRing(ring.slice(0));
    if (closedRing.length < 4) {
      continue;
    }
    if (ringIsClockwise(closedRing)) {
      outerRings.push([closedRing]);
    } else {
      holes.push(closedRing);
    }
  }

  const uncontainedHoles: Ring[] = [];

  while (holes.length) {
    const hole = holes.pop()!;
    let contained = false;
    for (let x = outerRings.length - 1; x >= 0; x--) {
      outerRing = outerRings[x][0];
      if (coordinatesContainCoordinates(outerRing, hole)) {
        outerRings[x].push(hole);
        contained = true;
        break;
      }
    }
    if (!contained) {
      uncontainedHoles.push(hole);
    }
  }

  while (uncontainedHoles.length) {
    const hole = uncontainedHoles.pop()!;
    let intersects = false;
    for (let x = outerRings.length - 1; x >= 0; x--) {
      outerRing = outerRings[x][0];
      if (arrayIntersectsArray(outerRing, hole)) {
        outerRings[x].push(hole);
        intersects = true;
        break;
      }
    }
    if (!intersects) {
      outerRings.push([hole.reverse()]);
    }
  }

  if (outerRings.length === 1) {
    return {
      type: 'Polygon',
      coordinates: outerRings[0],
    };
  } else {
    return {
      type: 'MultiPolygon',
      coordinates: outerRings,
    };
  }
}

export function orientRings(poly: Ring[]): Ring[] {
  const output: Ring[] = [];
  const polygon = poly.slice(0);
  const outerRing = closeRing(polygon.shift()!.slice(0));
  if (outerRing.length >= 4) {
    if (!ringIsClockwise(outerRing)) {
      outerRing.reverse();
    }
    output.push(outerRing);
    for (const hole of polygon) {
      const closedHole = closeRing(hole.slice(0));
      if (closedHole.length >= 4) {
        if (ringIsClockwise(closedHole)) {
          closedHole.reverse();
        }
        output.push(closedHole);
      }
    }
  }
  return output;
}

export function flattenMultiPolygonRings(rings: MultiPolygon): Ring[] {
  const output: Ring[] = [];
  for (const polygon of rings) {
    const orientedRings = orientRings(polygon);
    for (const ring of orientedRings) {
      output.push(ring.slice(0));
    }
  }
  return output;
}

export function shallowClone(obj: Record<string, any>): Record<string, any> {
  const target: Record<string, any> = {};
  for (const i in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, i)) {
      target[i] = obj[i];
    }
  }
  return target;
}

export function arcgisToGeoJSON(
  arcgis: ArcGISGeometry,
  idAttribute?: string
): GeoJSONGeometry | GeoJSONFeature {
  let geojson: GeoJSONGeometry | GeoJSONFeature = {} as GeoJSONGeometry | GeoJSONFeature;

  if (typeof arcgis.x === 'number' && typeof arcgis.y === 'number') {
    geojson = {
      type: 'Point',
      coordinates: [arcgis.x, arcgis.y],
    };
  }

  if (arcgis.points) {
    geojson = {
      type: 'MultiPoint',
      coordinates: arcgis.points.slice(0),
    };
  }

  if (arcgis.paths) {
    if (arcgis.paths.length === 1) {
      geojson = {
        type: 'LineString',
        coordinates: arcgis.paths[0].slice(0),
      };
    } else {
      geojson = {
        type: 'MultiLineString',
        coordinates: arcgis.paths.slice(0),
      };
    }
  }

  if (arcgis.rings) {
    geojson = convertRingsToGeoJSON(arcgis.rings.slice(0));
  }

  if (arcgis.geometry || arcgis.attributes) {
    geojson = {
      type: 'Feature',
      geometry: arcgis.geometry ? (arcgisToGeoJSON(arcgis.geometry) as GeoJSONGeometry) : null,
      properties: arcgis.attributes ? shallowClone(arcgis.attributes) : null,
    };
    if (arcgis.attributes) {
      geojson.id =
        arcgis.attributes[idAttribute!] || arcgis.attributes.OBJECTID || arcgis.attributes.FID;
    }
  }

  return geojson;
}

export function geojsonToArcGIS(
  geojson: GeoJSONGeometry | GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONGeometryCollection,
  idAttribute?: string
): any {
  idAttribute = idAttribute || 'OBJECTID';
  const spatialReference = { wkid: 4326 };
  let result: any = {};
  let i: number;

  switch (geojson.type) {
    case 'Point':
      result = {
        x: geojson.coordinates[0],
        y: geojson.coordinates[1],
        spatialReference,
      };
      break;
    case 'MultiPoint':
      result = {
        points: geojson.coordinates.slice(0),
        spatialReference,
      };
      break;
    case 'LineString':
      result = {
        paths: [geojson.coordinates.slice(0)],
        spatialReference,
      };
      break;
    case 'MultiLineString':
      result = {
        paths: geojson.coordinates.slice(0),
        spatialReference,
      };
      break;
    case 'Polygon':
      result = {
        type: 'polygon',
        rings: orientRings(geojson.coordinates.slice(0)),
        spatialReference,
      };
      break;
    case 'MultiPolygon':
      result = {
        type: 'polygon',
        rings: flattenMultiPolygonRings(geojson.coordinates.slice(0)),
        spatialReference,
      };
      break;
    case 'Feature':
      if ((geojson as GeoJSONFeature).geometry) {
        result.geometry = geojsonToArcGIS((geojson as GeoJSONFeature).geometry, idAttribute);
      }
      result.attributes = (geojson as GeoJSONFeature).properties
        ? shallowClone((geojson as GeoJSONFeature).properties)
        : {};
      if ((geojson as GeoJSONFeature).id) {
        result.attributes[idAttribute] = (geojson as GeoJSONFeature).id;
      }
      break;
    case 'FeatureCollection':
      result = [];
      for (i = 0; i < (geojson as GeoJSONFeatureCollection).features.length; i++) {
        result.push(
          geojsonToArcGIS((geojson as GeoJSONFeatureCollection).features[i], idAttribute)
        );
      }
      break;
    case 'GeometryCollection':
      result = [];
      for (i = 0; i < (geojson as GeoJSONGeometryCollection).geometries.length; i++) {
        result.push(
          geojsonToArcGIS((geojson as GeoJSONGeometryCollection).geometries[i], idAttribute)
        );
      }
      break;
  }

  return result;
}

export default {
  arcgisToGeoJSON,
  geojsonToArcGIS,
};
