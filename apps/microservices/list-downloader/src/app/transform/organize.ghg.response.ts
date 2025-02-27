import { Transform } from 'stream';
import { MAPSPAM_COMMODITY } from '@wri-monorepos/constants';
class OrganizeGreenHouseGasEmissionsResponse extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }
    const { listName, locationId, totalAreaHa, commodity, emissionsFactorByYear, efCo2ByYear } = chunk;
    const csvArray = [];

    // Convert Commodity to Human Readable
    let commodityHumanReadable = MAPSPAM_COMMODITY[commodity] || commodity;

    // Remove GFWP_ prefix if it exists
    commodityHumanReadable = commodityHumanReadable
      ? commodityHumanReadable.replace('GFWP_', '')
      : null;

    if (listName && locationId && totalAreaHa && commodity && emissionsFactorByYear && efCo2ByYear) {
      const sharedInfo = [listName, locationId, totalAreaHa, commodityHumanReadable, efCo2ByYear, 'dLUC'];

      Object.entries(JSON.parse(emissionsFactorByYear)).forEach(([year, value]) => {
        csvArray.push([...sharedInfo, value, year]);
      });
    }

    next(null, csvArray);
  }
}

export { OrganizeGreenHouseGasEmissionsResponse };
