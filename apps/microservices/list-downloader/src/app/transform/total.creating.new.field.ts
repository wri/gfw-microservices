import { Transform } from 'stream';
import { Logger } from '@nestjs/common';

type FieldType = {
  input: string;
  output: string;
};

class TotalCreatingNewField extends Transform {
  constructor(private fields: FieldType[]) {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!this.fields) return next(null, undefined);
    if (!chunk) return next(null, undefined);

    for (let i = 0; i < this.fields.length; i++) {
      const { input, output } = this.fields[i];

      if (!Object.prototype.hasOwnProperty.call(chunk, input)) {
        continue;
      }

      try {
        const yearlyData = JSON.parse(chunk[input]);
        chunk[output] = Object.values(yearlyData).reduce((acc: number, curr) => {
          if (typeof curr === 'number') {
            acc = acc + curr;
          }
          return acc;
        }, 0);
      } catch (err) {
        Logger.error(`Transform - TotalCreatingNewField - ${chunk[input]}`);
      }
    }

    next(null, chunk);
  }
}

export { TotalCreatingNewField };
