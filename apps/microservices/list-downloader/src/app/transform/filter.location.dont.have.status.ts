import { Transform } from 'stream';

class FilterLocationDontHaveStatus extends Transform {
  constructor(private status: number) {
    super({objectMode: true});
  }

  _transform(chunk, _, next) {
    if (chunk.location_status_id === this.status) {
      return next(null,
        chunk
      );
    }
    next();
  }
}

export {
  FilterLocationDontHaveStatus,
}
