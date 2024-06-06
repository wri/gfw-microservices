import { Transform } from 'stream';

class FilterColumnRules extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  run = (chunk) => {
    const analysisRadius = chunk['Analysis Radius'];
    const analysisArea = chunk['Analysis Area'];
  
    if (analysisRadius && analysisArea) {
      chunk['Analysis Radius'] = '';
    }

    return chunk;
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }

    const newChunk = this.run(chunk);

    next(null, newChunk);
  }
}

export { FilterColumnRules };
