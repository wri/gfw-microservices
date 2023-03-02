import { Transform } from 'stream';

class ConvertObject2String extends Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(geojson, _, next) {
    next(null, JSON.stringify(geojson));
  }
}

export {
  ConvertObject2String
}
