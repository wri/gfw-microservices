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
    const {
      listName,
      locationName,
      country,
      state,
      subState,
      totalAreaHa,
      commodity,
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

    if (listName && locationName && totalAreaHa && commodity && combinedEmissionsFactor) {
      const sharedInfo = [
        listName,
        locationName,
        country,
        state,
        subState,
        totalAreaHa,
        commodityHumanReadable,
        'dLUC',
      ];

      const co2Emissions = JSON.parse(co2EmissionsFactor || '{}');
      const ch4Emissions = JSON.parse(ch4EmissionsFactor || '{}');
      const n2oEmissions = JSON.parse(n2oEmissionsFactor || '{}');
      const combinedEmissions = JSON.parse(combinedEmissionsFactor || '{}');

      const years = new Set([
        ...Object.keys(co2Emissions),
        ...Object.keys(ch4Emissions),
        ...Object.keys(n2oEmissions),
        ...Object.keys(combinedEmissions),
      ]);

      years.forEach((year) => {
        csvArray.push([
          ...sharedInfo,
          co2Emissions[year] || 0,
          ch4Emissions[year] || 0,
          n2oEmissions[year] || 0,
          combinedEmissions[year] || 0,
          year,
        ]);
      });
    }

    next(null, csvArray);
  }
}

export { OrganizeGreenHouseGasEmissionsResponse };
