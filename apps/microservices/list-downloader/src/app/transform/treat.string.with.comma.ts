/* eslint-disable no-useless-escape */
import { Transform } from 'stream';

const checkAndFormatStringWithComma = (item) => {
  if (typeof item === 'string' && item.includes(',')) {
    return '"' + item + '"';
  }
  return item;
};

class TreatStringWithComma extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) return next(null, undefined);

    if (Array.isArray(chunk)) {
      const result = chunk.map((item) => {
        if (Array.isArray(item)) {
          return item.map((item) => {
            return checkAndFormatStringWithComma(item);
          });
        } else {
          return checkAndFormatStringWithComma(item);
        }
      });
      next(null, result);
    } else {
      next(null, chunk);
    }
  }
}

export { TreatStringWithComma };
