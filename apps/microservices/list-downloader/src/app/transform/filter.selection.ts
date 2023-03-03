import { Transform } from 'stream';

class FilterSelection extends Transform {
  constructor(private selectedLocationsList: number[]) {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (
      this.selectedLocationsList.length == 0 ||
      this.selectedLocationsList.includes(chunk.location_id)
    ) {
      return next(null, chunk);
    }
    next();
  }
}

export { FilterSelection };
