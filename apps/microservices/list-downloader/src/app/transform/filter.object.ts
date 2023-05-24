import { Transform } from 'stream';

class FilterObject extends Transform {
  constructor(private allFields: string[]) {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }
    const newChunk = this.allFields?.reduce((obj, key) => {
      return Object.assign(obj, { [key]: chunk[key] });
    }, {});
    next(null, newChunk);
  }
}

export { FilterObject };
