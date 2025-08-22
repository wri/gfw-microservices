import { Transform } from 'stream';
import { MAPSPAM_COMMODITY } from '@wri-monorepos/constants';
class OrganizeGHGRawEmissionsResponse extends Transform {
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
      co2RawEmissions,
      ch4RawEmissions,
      n2oRawEmissions,
      CombinedRawEmissions,
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
      ];

      const co2Emissions = JSON.parse(co2RawEmissions || '{}');
      const ch4Emissions = JSON.parse(ch4RawEmissions || '{}');
      const n2oEmissions = JSON.parse(n2oRawEmissions || '{}');
      const combinedEmissions = JSON.parse(CombinedRawEmissions || '{}');

      const years = new Set([
        ...Object.keys(co2Emissions),
        ...Object.keys(ch4Emissions),
        ...Object.keys(n2oEmissions),
        ...Object.keys(combinedEmissions),
      ]);

      // if has no year, set the current year
      if (years.size === 0) {
        years.add(new Date().getFullYear().toString());
      }

      years.forEach((year) => {
        csvArray.push([
          ...sharedInfo,
          parseInt(co2Emissions[year] || 0) ,
          parseInt(ch4Emissions[year] || 0) ,
          parseInt(n2oEmissions[year] || 0) ,
          parseInt(combinedEmissions[year] || 0) ,
          year,
        ]);
      });
    }
    next(null, csvArray);
  }
}

export { OrganizeGHGRawEmissionsResponse };
