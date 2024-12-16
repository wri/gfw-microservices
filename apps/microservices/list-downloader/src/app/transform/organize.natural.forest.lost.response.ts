import { Transform } from 'stream';

class OrganizeNaturalForestLostResponse extends Transform {
  constructor(private level: 'location' | 'list' = 'location') {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (!chunk) {
      return next(null, undefined);
    }
    const {
      listName,
      country,
      state,
      subState,
      totalAreaHa,
      jrcLandAreaHA,
      coverageHA,
      jrcForestLossByYear,
      naturalForestLossByYear,
      locationName,
      jrc_total,
      sbtn_total,
    } = chunk;
    const csvArray = [];

    let sharedInfo = [listName, locationName, country, state, subState, totalAreaHa];

    if (this.level === 'list') {
      sharedInfo = [listName, country, state, subState, totalAreaHa];
    }

    if (jrcForestLossByYear) {
      Object.entries(JSON.parse(jrcForestLossByYear)).forEach(([year, value]) => {
        csvArray.push([...sharedInfo, jrcLandAreaHA, jrc_total, value, year, 'JRC']);
      });
    }

    if (naturalForestLossByYear) {
      Object.entries(JSON.parse(naturalForestLossByYear)).forEach(([year, value]) => {
        csvArray.push([...sharedInfo, coverageHA, sbtn_total, value, year, 'STBN']);
      });
    }
    next(null, csvArray);
  }
}

export { OrganizeNaturalForestLostResponse };
