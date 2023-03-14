import { Transform } from 'stream';

class FilterLocationHaveStatus extends Transform {
  constructor(private status: number) {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (chunk === undefined) {
      return next();
    }

    if (Object.prototype.hasOwnProperty.call(chunk, 'location_status_id') && chunk.location_status_id === this.status) {
      return next(null, chunk);
    }
    next();
  }
}

export { FilterLocationHaveStatus };
