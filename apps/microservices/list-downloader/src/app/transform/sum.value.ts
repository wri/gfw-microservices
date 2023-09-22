import { Transform } from 'stream';

class SumValue extends Transform {
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
        const total = Object.entries(values)
          .filter(([, value]) => {
            if (typeof value === 'number') {
              return value > 0;
            }
            return false;
          })
          .map(([, value]) => {
            if (typeof value === 'number') {
              return value;
            }
          })
          .reduce((acc, curr) => acc + curr, 0);
        result = {
          ...result,
          [field]: total ?? '',
        };
      }
    });
    next(null, result);
  }
}

export { SumValue };
