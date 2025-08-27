import { Transform } from 'stream';
import { MAPSPAM_COMMODITY } from '@wri-monorepos/constants';
class OrganizeGHGIntermediateOutputsResponse extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }
    const {
      listName,
      locationName,
      totalAreaHa,
      commodity,
      weightedAvgYield,
      production,
      co2EmissionsFactor,
      ch4EmissionsFactor,
      n2oEmissionsFactor,
      combinedEmissionsFactor,
    } = chunk;
    const csvArray = [];

    // Convert Commodity to Human Readable
    let commodityHumanReadable = MAPSPAM_COMMODITY[commodity] || commodity;

    // Remove GFWP_ prefix if it exists
    commodityHumanReadable = commodityHumanReadable
      ? commodityHumanReadable.replace('GFWP_', '')
      : null;

    if (listName && locationName && totalAreaHa && commodity) {
      const sharedInfo = [
        listName,
        locationName,
        totalAreaHa,
        commodityHumanReadable,
        'dLUC',
        weightedAvgYield || 0,
        production || 0,
      ];

      const co2LinearDiscountedEmission = JSON.parse(co2EmissionsFactor || '{}');
      const ch4LinearDiscountedEmission = JSON.parse(ch4EmissionsFactor || '{}');
      const n2oLinearDiscountedEmission = JSON.parse(n2oEmissionsFactor || '{}');
      const CombinedLinearDiscountedEmission = JSON.parse(combinedEmissionsFactor || '{}');

      const years = new Set([
        ...Object.keys(co2LinearDiscountedEmission),
        ...Object.keys(ch4LinearDiscountedEmission),
        ...Object.keys(n2oLinearDiscountedEmission),
        ...Object.keys(CombinedLinearDiscountedEmission),
      ]);

      years.forEach((year) => {
        csvArray.push([
          ...sharedInfo,
          parseFloat(co2LinearDiscountedEmission[year]) * production || 0,
          parseFloat(ch4LinearDiscountedEmission[year]) * production || 0,
          parseFloat(n2oLinearDiscountedEmission[year]) * production || 0,
          parseFloat(CombinedLinearDiscountedEmission[year]) * production || 0,
          year,
        ]);
      });
    }
    next(null, csvArray);
  }
}

export { OrganizeGHGIntermediateOutputsResponse };
