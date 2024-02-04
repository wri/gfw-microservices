import { Transform } from 'stream';

export class AlertsGetLocationOrListData extends Transform {
  constructor(private isList: boolean = false) {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (chunk === undefined) {
      return next();
    }

    if (this.isList) {
      if (Object.prototype.hasOwnProperty.call(chunk, 'location_id') && chunk.location_id === -1) {
        return next(null, chunk);
      }
    } else {
      if (Object.prototype.hasOwnProperty.call(chunk, 'location_id') && chunk.location_id !== -1) {
        return next(null, chunk);
      }
    }
    return next();
  }
}
