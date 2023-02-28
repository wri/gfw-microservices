import { Transform } from 'stream';
import { parse, GeoJSONGeometryOrNull } from 'wellknown';


class ConvertToGeoJSON extends Transform {
  constructor() {
    super({objectMode: true});
  }

  getGeoJSONGeometry(wktGeometry: string) : GeoJSONGeometryOrNull {
    return parse(wktGeometry);
  }

  _transform(location, _, next) {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

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

class ConvertObjectToString extends Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(geojson, _, next) {
    next(null, JSON.stringify(geojson));
  }
}


class ConvertToCSV extends Transform {

  constructor(private readonly header: string[]) {
    super({objectMode: true});
  }

  _transform(data, _, next) {
    const [ first] = data;
    let result = '';
    if ( Array.isArray(first)){
      result = data.filter(item => item.length === this.header.length).map(x => x.join(',')).join('\n');
    } else {
      result = data.map(x => x ?? '').join(',');
    }
    next(null, result ? `${result}\n` : '')
  }
}

export {
  ConvertToGeoJSON,
  ConvertObjectToString,
  ConvertToCSV
}
