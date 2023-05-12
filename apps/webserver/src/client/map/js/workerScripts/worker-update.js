define([
  'esri/config',
  'esri/core/promiseUtils',
  'esri/geometry/geometryEngine',
  'esri/geometry/Polygon'
],
function(
  esriConfig,
  promiseUtils,
  geometryEngine,
  Polygon
  ) {
  class MyWorker {
    // magic({extent}, {proxy}) {
    //   // proxy.connection.invoke('progress', 'starting');
    //   // console.log('inn');
    //   // const area = Polygon.fromExtent(Extent.fromJSON(extent));
    //   // proxy.connection.invoke('progress', 'polygon created');
    //   // const centroid = area.centroid;
    //   // const buffers = [];
    //   // proxy.connection.invoke('progress', 'starting buffer creation');
    //   // for (let i = 100; i <= 50000; i = i + 100) {
    //   //   const ptBuff = geometryEngine.geodesicBuffer(centroid, i, 'feet');
    //   //   const data = ptBuff.toJSON();
    //   //   buffers.push(data);
    //   // }
    //   // proxy.connection.invoke('progress', 'buffer creation done');
    //   // return promiseUtils.resolve({ data: buffers });
    //   return promiseUtils.resolve({ data: extent });
    // }
    pointsEqual (a, b) {
      for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }

    // checks if the first and last points of a ring are equal and closes the ring
    closeRing (coordinates) {
      if (!this.pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
        coordinates.push(coordinates[0]);
      }
      return coordinates;
    }

    // determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
    // or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
    // points-are-in-clockwise-order
    ringIsClockwise (ringToTest) {
      var total = 0;
      var i = 0;
      var rLength = ringToTest.length;
      var pt1 = ringToTest[i];
      var pt2;
      for (i; i < rLength - 1; i++) {
        pt2 = ringToTest[i + 1];
        total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
        pt1 = pt2;
      }
      return (total >= 0);
    }

    // ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L504-L519
    vertexIntersectsVertex (a1, a2, b1, b2) {
      var uaT = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
      var ubT = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
      var uB = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

      if (uB !== 0) {
        var ua = uaT / uB;
        var ub = ubT / uB;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
          return true;
        }
      }

      return false;
    }

    // ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L521-L531
    arrayIntersectsArray (a, b) {
      for (var i = 0; i < a.length - 1; i++) {
        for (var j = 0; j < b.length - 1; j++) {
          if (this.vertexIntersectsVertex(a[i], a[i + 1], b[j], b[j + 1])) {
            return true;
          }
        }
      }

      return false;
    }

    // ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L470-L480
    coordinatesContainPoint (coordinates, point) {
      var contains = false;
      for (var i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
        if (((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1]) ||
             (coordinates[j][1] <= point[1] && point[1] < coordinates[i][1])) &&
            (point[0] < (coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0])) {
          contains = !contains;
        }
      }
      return contains;
    }

    // ported from terraformer-arcgis-parser.js https://github.com/Esri/terraformer-arcgis-parser/blob/master/terraformer-arcgis-parser.js#L106-L113
    coordinatesContainCoordinates (outer, inner) {
      var intersects = this.arrayIntersectsArray(outer, inner);
      var contains = this.coordinatesContainPoint(outer, inner[0]);
      if (!intersects && contains) {
        return true;
      }
      return false;
    }

    // do any polygons in this array contain any other polygons in this array?
    // used for checking for holes in arcgis rings
    // ported from terraformer-arcgis-parser.js https://github.com/Esri/terraformer-arcgis-parser/blob/master/terraformer-arcgis-parser.js#L117-L172
    convertRingsToGeoJSON (rings) {
      var outerRings = [];
      var holes = [];
      var x; // iterator
      var outerRing; // current outer ring being evaluated
      var hole; // current hole being evaluated

      // for each ring
      for (var r = 0; r < rings.length; r++) {
        var ring = this.closeRing(rings[r].slice(0));
        if (ring.length < 4) {
          continue;
        }
        // is this ring an outer ring? is it clockwise?
        if (this.ringIsClockwise(ring)) {
          var polygon = [ ring ];
          outerRings.push(polygon); // push to outer rings
        } else {
          holes.push(ring); // counterclockwise push to holes
        }
      }

      var uncontainedHoles = [];

      // while there are holes left...
      while (holes.length) {
        // pop a hole off out stack
        hole = holes.pop();

        // loop over all outer rings and see if they contain our hole.
        var contained = false;
        for (x = outerRings.length - 1; x >= 0; x--) {
          outerRing = outerRings[x][0];
          if (this.coordinatesContainCoordinates(outerRing, hole)) {
            // the hole is contained push it into our polygon
            outerRings[x].push(hole);
            contained = true;
            break;
          }
        }

        // ring is not contained in any outer ring
        // sometimes this happens https://github.com/Esri/esri-leaflet/issues/320
        if (!contained) {
          uncontainedHoles.push(hole);
        }
      }

      // if we couldn't match any holes using contains we can try intersects...
      while (uncontainedHoles.length) {
        // pop a hole off out stack
        hole = uncontainedHoles.pop();

        // loop over all outer rings and see if any intersect our hole.
        var intersects = false;

        for (x = outerRings.length - 1; x >= 0; x--) {
          outerRing = outerRings[x][0];
          if (this.arrayIntersectsArray(outerRing, hole)) {
            // the hole is contained push it into our polygon
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
          coordinates: outerRings[0]
        };
      } else {
        return {
          type: 'MultiPolygon',
          coordinates: outerRings
        };
      }
    }
    orientRings (poly) {
      var output = [];
      var polygon = poly.slice(0);
      var outerRing = this.closeRing(polygon.shift().slice(0));
      if (outerRing.length >= 4) {
        if (!this.ringIsClockwise(outerRing)) {
          outerRing.reverse();
        }

        output.push(outerRing);

        for (var i = 0; i < polygon.length; i++) {
          var hole = this.closeRing(polygon[i].slice(0));
          if (hole.length >= 4) {
            if (this.ringIsClockwise(hole)) {
              hole.reverse();
            }
            output.push(hole);
          }
        }
      }

      return output;
    }

    flattenMultiPolygonRings (rings) {
      var output = [];
      for (var i = 0; i < rings.length; i++) {
        var polygon = this.orientRings(rings[i]);
        for (var x = polygon.length - 1; x >= 0; x--) {
          var ring = polygon[x].slice(0);
          output.push(ring);
        }
      }
      return output;
    }
    shallowClone (obj) {
      var target = {};
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          target[i] = obj[i];
        }
      }
      return target;
    }
    geojsonToArcGIS (geojson, idAttribute) {
      idAttribute = idAttribute || 'OBJECTID';
      var spatialReference = { wkid: 4326 };
      var result = {};
      var i;

      switch (geojson.type) {
        case 'Point':
          result.x = geojson.coordinates[0];
          result.y = geojson.coordinates[1];
          result.spatialReference = spatialReference;
          break;
        case 'MultiPoint':
          result.points = geojson.coordinates.slice(0);
          result.spatialReference = spatialReference;
          break;
        case 'LineString':
          result.paths = [geojson.coordinates.slice(0)];
          result.spatialReference = spatialReference;
          break;
        case 'MultiLineString':
          result.paths = geojson.coordinates.slice(0);
          result.spatialReference = spatialReference;
          break;
        case 'Polygon':
          result.rings = this.orientRings(geojson.coordinates.slice(0));
          result.spatialReference = spatialReference;
          break;
        case 'MultiPolygon':
          result.rings = this.flattenMultiPolygonRings(geojson.coordinates.slice(0));
          result.spatialReference = spatialReference;
          break;
        case 'Feature':
          if (geojson.geometry) {
            result.geometry = this.geojsonToArcGIS(geojson.geometry, idAttribute);
          }
          result.attributes = (geojson.properties) ? this.shallowClone(geojson.properties) : {};
          if (geojson.id) {
            result.attributes[idAttribute] = geojson.id;
          }
          break;
        case 'FeatureCollection':
          result = [];
          for (i = 0; i < geojson.features.length; i++) {
            result.push(this.geojsonToArcGIS(geojson.features[i], idAttribute));
          }
          break;
        case 'GeometryCollection':
          result = [];
          for (i = 0; i < geojson.geometries.length; i++) {
            result.push(this.geojsonToArcGIS(geojson.geometries[i], idAttribute));
          }
          break;
      }

      return result;
    }
    magicTwo({jsonData}, {proxy}) {
      const data = {
        properties: []
      };

      const geojson = jsonData.rows.map(row => {
        if (jsonData.cartoLayer.cartoFields) {
          const props = {};
          Object.keys(row).forEach(prop => {
            if (prop !== 'geometry') {
              props[prop] = row[prop] ? row[prop] : '';
            }
          });
          data.properties.push(props);
        }

        return JSON.parse(row.geometry);
      });

      const esriJson = [];
      geojson.forEach((geo, j) => {
        const feat = {
          geometry: this.geojsonToArcGIS(geo)
        };

        if (jsonData.cartoLayer.cartoFields) {
          feat.attributes = data.properties[j];
        } else {
          feat.attributes = {};
        }
        esriJson.push(feat);
      });

      const features = esriJson.map((x, i) => {
        x.attributes.ObjectID = i;

        return {
          attributes: x.attributes,
          rings: x.geometry.rings
        };
      });

      // proxy.connection.invoke('progress', features);

      return promiseUtils.resolve({ data: features });
    }
  }
  /*
  const MyWorker = MyWorker() {};
  MyWorker.prototype.magic = magic({ extent }, { proxy }) {}
  */
  return MyWorker;
});
