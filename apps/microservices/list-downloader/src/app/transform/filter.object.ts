import { Transform } from 'stream';

class FilterObject extends Transform {
  constructor(private allFields: string[], private table?: string) {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }
    const newChunk = this.allFields?.reduce((obj, key) => {
      return Object.assign(obj, { [key]: chunk[key] });
    }, {}) as any;

    if (this.table === 'sAmericaLoss') {
      const countrySpecificDeforestationBrazil = JSON.parse(
        chunk?.country_specific_deforestation_yearly || '{}'
      )?.BRA;
      if (countrySpecificDeforestationBrazil) {
        newChunk.tree_cover_loss_prodes_yearly = JSON.stringify(countrySpecificDeforestationBrazil);
      }
    }
    next(null, newChunk);
  }
}

export { FilterObject };
