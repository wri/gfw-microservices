import { Transform } from 'stream';

class OrganizeGreenHouseGasEmissionsResponse extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }
    const { listName, locationId, totalAreaHa, commodity, emissionsFactorByYear } = chunk;
    const csvArray = [];

    if (listName && locationId && totalAreaHa && commodity && emissionsFactorByYear) {
      const sharedInfo = [listName, locationId, totalAreaHa, commodity, 'dLUC'];

      Object.entries(JSON.parse(emissionsFactorByYear)).forEach(([year, value]) => {
        csvArray.push([...sharedInfo, value, year]);
      });
    }

    next(null, csvArray);
  }
}

export { OrganizeGreenHouseGasEmissionsResponse };
