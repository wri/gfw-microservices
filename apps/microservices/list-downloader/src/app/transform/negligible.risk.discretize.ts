import { Transform } from 'stream';

class NegligibleRiskDiscretize extends Transform {
  constructor(private key: string = 'negligibleRisk') {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }

    if (!chunk[this.key]) {
      return next(null, chunk);
    }
    chunk[this.key] = chunk[this.key] < 0.5 ? 'no' : 'yes';

    next(null, chunk);
  }
}

export { NegligibleRiskDiscretize };
