import { Transform } from 'stream';
import { parse, GeoJSONGeometryOrNull } from 'wellknown';

class ConvertObject2Geojson extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  getGeoJSONGeometry(wktGeometry: string): GeoJSONGeometryOrNull {
    return parse(wktGeometry);
  }

  _transform(location, _, next) {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };


    if (!location) {
      next(null, geojson);
      return;
    }

    const feature = Object.keys(location).reduce(
      (obj, key) => {
        if (key === 'WKTGeometry') {
          obj.geometry = this.getGeoJSONGeometry(location[key]);
        } else {
          obj.properties[key] = location[key] ? location[key].toString() : '';
        }
        return obj;
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {},
      }
    );

    geojson.features.push(feature);
    next(null, geojson);
  }
}

export { ConvertObject2Geojson };
