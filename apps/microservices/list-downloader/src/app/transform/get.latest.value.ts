import { Transform } from 'stream';

class GetLatestValue extends Transform {

  constructor(private fields: string[]) {
    super({objectMode: true});
  }

  _transform(chunk, _, next) {
    let result = { ...chunk }
    this.fields.forEach(field => {
      const value = JSON.parse(result[field])
        if(typeof value != 'number'){

          const key = Object.entries(value).filter(([, value]) => value > 0).map(([key]) => parseFloat(key)).reduce((a, b) => Math.max(a, b), -Infinity);
          result = {
            ...result,
            [field]: value[key] ?? ''
          }
      }
    });
    next(null, result);

  }
}

export {
  GetLatestValue
}
