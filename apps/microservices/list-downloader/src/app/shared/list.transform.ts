import { parse, GeoJSONGeometryOrNull } from 'wellknown';
import { Transform } from 'stream';

class FilterObject extends Transform {
  constructor(private allFields: string[]) {
    super({objectMode: true});
  }

  _transform(chunk, _, next) {
    const newChunk = this.allFields.reduce((obj, key) => { return Object.assign(obj, { [key]: chunk[key], }); }, {});
    next(null,
      newChunk
    );
  }
}


class FilterSelection extends Transform {
  constructor(private selectedLocationsList: number[]) {
    super({objectMode: true});
  }

  _transform(chunk, _, next) {
    if (this.selectedLocationsList.length == 0 || this.selectedLocationsList.includes(chunk.location_id)) {
      return next(null,
        chunk
      );
    }
    next();
  }
}

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

class GetLastValue extends Transform {

  constructor(private fields: string[]) {
    super({objectMode: true});
  }

  _transform(chunk, _, next) {
    console.log(chunk)
    console.log(this.fields)

    let result = { ...chunk }
    this.fields.forEach(field => {
      const value = JSON.parse(result[field])
        if(typeof value != 'number'){

          const key = Object.entries(value).filter(([, value]) => value > 0).map(([key]) => parseFloat(key)).reduce((a, b) => Math.max(a, b), -Infinity);
          result = {
            ...result,
            [field]: value[key] ?? ''
          }
      }
    });
    console.log(result)
    next(null, result);

  }
}

export {
  FilterObject,
  FilterSelection,
  ConvertToGeoJSON,
  ConvertObjectToString,
  GetLastValue
}
