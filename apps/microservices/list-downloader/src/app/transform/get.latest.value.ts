import { Transform } from 'stream';

class GetLatestValue extends Transform {
  constructor(private fields: string[]) {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!this.fields) return next(null, undefined);
    if (!chunk) return next(null, undefined);

    let result = { ...chunk };
    this.fields.forEach((field) => {
      const values = JSON.parse(result[field]);
      if (typeof values != 'number') {
        const key = Object.entries(values)
          .filter(([, value]) => {
            if (typeof value === 'number') {
              return value > 0;
            }
            return false;
          })
          .map(([key]) => parseFloat(key))
          .reduce((a, b) => Math.max(a, b), -Infinity);
        result = {
          ...result,
          [field]: values[key] ?? '',
        };
      }
    });
    next(null, result);
  }
}

export { GetLatestValue };
