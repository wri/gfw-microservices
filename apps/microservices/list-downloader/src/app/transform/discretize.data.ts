import { Transform } from 'stream';

type Value = 'Low' | 'Medium' | 'High';

type DataToTransform = {
  [key: string]: number | string;
};

type TransformedData = {
  [K in keyof DataToTransform]: DataToTransform[K] extends number
    ? Value | number
    : DataToTransform[K];
};

const mapper: Value[] = ['Low', 'Medium', 'High'];

class DiscretizeData extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  _transform(
    data: DataToTransform,
    _: any,
    next: (arg0: null, arg1: TransformedData | undefined) => void
  ) {
    if (!data) return next(null, undefined);
    const newData: TransformedData = Object.entries(data).reduce(
      (acc: TransformedData, [key, value]) => {
        acc[key] = mapper[value] ?? value;
        return acc;
      },
      {}
    );
    next(null, newData);
  }
}
export { DiscretizeData };
