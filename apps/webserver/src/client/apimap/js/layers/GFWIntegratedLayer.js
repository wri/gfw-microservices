/**
 * @description This function is used to create a Integrated Alert Layer class that extends the BaseTileLayer class. This class is used to create a Integrated Alert Layer object that is used to display Integrated alerts on the map.
 * The code below is based off of the documentation from https://developers.arcgis.com/javascript/latest/sample-code/layers-custom-tilelayer/
 * @returns {Promise} A promise that resolves to a Integrated Alert Layer class that extends the BaseTileLayer class.
 * */

import PNG from 'png-ts';
import { confidenceLevelConfig } from './confidence-level';
import BaseTileLayer from '@arcgis/core/layers/BaseTileLayer';
import moment from 'moment';
import store from '../store';

// Modify the JS Date object
Date.prototype.getJulian = function () {
  // Convert date into moment Object
  const date = moment(this);
  // Get the year
  const year = date.year();
  // Create a moment object of the beginning of the year
  const startOfYear = moment(`${year}/01/01`, 'YYYY/MM/DD');
  // Find number of days passed
  const daysPassed = date.diff(startOfYear, 'days');
  // Append leading zeros if needed
  let daysPassedFormatted = daysPassed.toString();
  if (daysPassedFormatted.length < 3) {
    while (daysPassedFormatted.length < 3) {
      daysPassedFormatted = `0${daysPassedFormatted}`;
    }
  }
  // Return the correct Julian
  return `${date.format('YY')}${daysPassedFormatted}`;
};

const createGFWIntegratedLayer = BaseTileLayer.createSubclass({
  properties: {
    julianTo: parseInt(new Date().getJulian()),
    julianFrom: parseInt(moment().subtract(2, 'years').toDate().getJulian()),
    showHighConfidenceConfirmed:
      store.getState().showHighConfidenceAlertsOnDeforestationAlertsLayer,
  },
  getTileUrl: function (level, row, column) {
    return this.urlTemplate.replace('{z}', level).replace('{x}', column).replace('{y}', row);
  },
  fetchTile: function (level, row, column) {
    const url = this.getTileUrl(level, row, column);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = this.tileInfo.size[0];
    const height = this.tileInfo.size[0];
    canvas.width = width;
    canvas.height = height;

    return this.fetchTileArrayBuffer(url).then((r) => {
      const data = new Uint8Array(r);
      const png = new PNG(data);
      const pngImage = PNG.load(png.data, canvas);
      const iData = context.createImageData(width, height);
      const pixels = pngImage.decodePixels();
      iData.data.set(this.processData(pixels));
      context.putImageData(iData, 0, 0);
      return canvas;
    });
  },
  fetchTileArrayBuffer: async function (url) {
    const response = await fetch(url);
    return response.arrayBuffer();
  },
  processData: function (data) {
    for (let i = 0; i < data.length; i += 4) {
      //[R, G, B, A]
      // A - integrated confidence (8bit encoding) (what we discussed this morning)
      // RG -- days since 12/31/14 (encoded across two bytes (16 bits) today would be 0B54 (2,900 Days)
      // B - intensity (ranging from 0-55?)
      const slice = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      const values = this.decodeDate(slice);
      // console.log({julianFrom: this.julianFrom, valuesDate: values.date,  julianTo: this.julianTo})
      //   console.log((values.date > this.julianFrom && values.date < this.julianTo))
      //     console.log({"values.date": values.date})
      if (values.date > this.julianFrom && values.date < this.julianTo) {
        data[i + 3] = values.intensity;
        //see notes in confidence-level.ts for breakdown of confidence levels
        if (values.confidence === 'one low') {
          if (this.showHighConfidenceConfirmed) {
            data[i] = 255; // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
            data[i + 3] = 0; // A
          } else {
            data[i] = 237; // R
            data[i + 1] = 164; // G
            data[i + 2] = 194; // B
          }
        } else if (values.confidence === 'one high') {
          data[i] = 220; // R
          data[i + 1] = 102; // G
          data[i + 2] = 153; // B
        } else if (values.confidence === 'multiple') {
          data[i] = 201; // R
          data[i + 1] = 42; // G
          data[i + 2] = 109; // B
        }
      } else {
        data[i] = 255; // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
        data[i + 3] = 0; // A
      }
    }
    return data;
  },
  decodeDate: function (pixel) {
    //days = R*255 + G  is similar in our decimal system to 234 is 2*100 + 34 (think of Red as just more significant digits than Green).
    // In this way, 16 is one place and 255 is two places to the left, so you multiply the first digit (Red) by 255 and add the 2nd two digits
    const total_days = pixel[0] * 255 + pixel[1];
    const year_int = parseInt(total_days / 365) + 15;
    const year = parseInt(year_int * 1000);
    const julian_day = total_days % 365;
    const date = year + julian_day;
    const band3_str = this.pad(pixel[2].toString());
    //using confidence level config to determine confidence level based on alpha value and alpha value determines rgb color above
    const confidence = confidenceLevelConfig[pixel[3]];
    const intensity_raw = parseInt(band3_str.slice(1, 3));
    let intensity = intensity_raw * 50;
    if (intensity > 255) {
      intensity = 255;
    }
    return {
      confidence: confidence,
      intensity: intensity,
      date: date,
    };
  },
  pad: function (num) {
    const str = '00' + num;
    return str.slice(str.length - 3);
  },
});

export default createGFWIntegratedLayer;
