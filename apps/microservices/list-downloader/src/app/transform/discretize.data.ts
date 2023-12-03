import { Transform } from 'stream';

const mapper = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

class DiscretizeData extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(data, _, next) {
    if (!data) return next(null, undefined);

    const newData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value !== 'number') {
        acc[key] = value;
        return acc;
      }

      if (Object.prototype.hasOwnProperty.call(mapper, value)) {
        acc[key] = mapper[value];
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

    next(null, newData);
  }
}

export { DiscretizeData };
