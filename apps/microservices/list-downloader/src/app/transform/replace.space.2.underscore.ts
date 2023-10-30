import { Transform } from 'stream';

class ReplaceSpace2Underscore extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }
    const newChunk = Object.entries(chunk).reduce((obj, [key, value]) => {
      return Object.assign(obj, { [key.replace(/\s/g, '_')]: value });
    }, {});
    next(null, newChunk);
  }
}

export { ReplaceSpace2Underscore };
