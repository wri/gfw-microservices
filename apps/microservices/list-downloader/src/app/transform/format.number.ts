import { Transform } from 'stream';

class FormatNumber extends Transform {
  constructor(private decimals: number = 2) {
    super({ objectMode: true });
  }

  isFloat = (n) => Number(n) === n && n % 1 !== 0;

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }

    let newChunk = {};
    if (Array.isArray(chunk)) {
      newChunk = chunk.map((value) => {
        if (this.isFloat(value)) {
          return parseFloat(value.toFixed(this.decimals));
        }
        if (Array.isArray(value)) {
          return value.map((v) => {
            if (this.isFloat(v)) {
              return parseFloat(v.toFixed(this.decimals));
            }
            return v;
          });
        }
        return value;
      });
    } else if (typeof chunk === 'object' && chunk !== null) {
      newChunk = Object.entries(chunk).reduce((acc, [key, value]) => {
        if (typeof value === 'number' && this.isFloat(value)) {
          acc[key] = parseFloat(value.toFixed(this.decimals));
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
    }

    next(null, newChunk);
  }
}

export { FormatNumber };
