import { Transform } from 'stream';

class ConvertObject2CSV extends Transform {

  constructor(private readonly header: string[]) {
    super({objectMode: true});
  }

  _transform(data, _, next) {
    const [ first] = data;
    let result = '';
    if ( Array.isArray(first)){
      result = data.filter(item => item.length === this.header.length).map(x => x.join(',')).join('\n');
    } else {
      result = data.map(x => x ?? '').join(',');
    }
    next(null, result ? `${result}\n` : '')
  }
}

export {
  ConvertObject2CSV
}
