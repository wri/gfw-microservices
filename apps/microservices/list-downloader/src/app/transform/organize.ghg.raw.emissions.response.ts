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
      emissions_co2_yearly,
      emissions_ch4_yearly,
      emissions_n2o_yearly,
      emissions_yearly,
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

      const co2Emissions = JSON.parse(emissions_co2_yearly || '{}');
      const ch4Emissions = JSON.parse(emissions_ch4_yearly || '{}');
      const n2oEmissions = JSON.parse(emissions_n2o_yearly || '{}');
      const combinedEmissions = JSON.parse(emissions_yearly || '{}');

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
