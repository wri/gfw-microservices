const utils = {
  /**
   * Retrieve the object from a given array based on id and value
   * @param {array} - items - Array to search
   * @param {string} - field - Property of unique identifier in object
   * @param {string} - value - value of the unique id
   * @return {Any} - Return whatever object is matched
   */
  getObject: (items, field, value) => {
    let obj;
    items.some((item) => {
      if (item[field] === value) {
        obj = item;
        return true;
      }
    });
    return obj;
  },

  /**
   * Retrieve the object from a given array based on id and value
   * @param {array} - items - Array to search
   * @param {string} - field - Property of unique identifier in object
   * @param {string} - value - value of the unique id
   * @return {boolean} - Return true if object is matched
   */
  containsObject: (items, field, value) => {
    return items.some((item) => item[field] === value);
  },

  /**
   * Checks to make sure lat and lng are within global bounds
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @return {boolean}
   */
  validLatLng: (lat, lon) => {
    return lat > -90 && lat < 90 && lon > -180 && lon < 180;
  },

  /**
   * Round down to the nearest 100s
   */
  roundToHundred: (value) => Math.floor(value / 100) * 100,

  /**
   * Return true if the document.execCommand exists
   * @return {boolean}
   */
  supportsExecCommand: () => typeof document !== 'undefined' && !!document.execCommand,

  /**
   * Return true if we can succesfully copy item to clipboard, this will query element
   * and try to put the focus on it so we can copy it correctly
   * @param {HTML element} el - Input element
   * @return {boolean}
   */
  copySelectionFrom: (el) => {
    let status = false;
    if (!utils.supportsExecCommand()) {
      return status;
    }
    // Highlight the input
    el.select();
    // This may not work in all scenarios, wrap in a try catch to prevent any errors
    // and handle accordingly
    try {
      status = document.execCommand('copy');
    } catch (err) {
      console.error(err);
    }
    return status;
  },

  clone: (sourceObject) => {
    return JSON.parse(JSON.stringify(sourceObject));
  },

  /**
   * Universal pad function, takes pad(12, '*', 5) and return '***12'
   */
  pad: (content, padding, length) => {
    let item = content.toString(),
      i = 0;
    while (i < length) {
      item = padding + item;
      i++;
    }
    return item.slice(item.length - length);
  },

  getJulianDate: (timestamp) => {
    const day = 1000 * 60 * 60 * 24;
    const newDate = new Date(timestamp);
    const year = new Date(newDate.getFullYear(), 0, 0);
    const currentDay = Math.ceil((newDate - year) / day);
    //- Year should be 15000 or 16000
    const julianYear = (newDate.getFullYear() - 2000) * 1000;
    return julianYear + currentDay;
  },

  /**
   * Inclusive Array generator
   */
  range: (start, end) => {
    const result = [];
    let min = start;
    while (min <= end) {
      result.push(min);
      ++min;
    }
    return result;
  },

  /**
   * Convert a paramterized string to an object
   * @param {string} querystring - Query string to be expanded into an object
   */
  toObject: (querystring) => {
    if (!querystring) {
      return {};
    }
    const result = {};
    const pairs = querystring.split('&').map((item) => {
      return item.split('=').map((str) => decodeURIComponent(str));
    });
    // Should have an array of arrays now, ex: [['a','b'], ['foo','bar']]
    pairs.forEach((pair) => {
      if (
        pair[0] === null ||
        typeof pair[0] === 'undefined' ||
        pair[0] === null ||
        typeof pair[0] === 'undefined'
      ) {
        console.warn(`You provided an invalid key-value pair, ${pair[0]} is being omitted.`);
        return;
      }
      result[pair[0]] = pair[1];
    });
    return result;
  },

  /**
   * Convert an object to a string, not the same as JSON.stringify, converts to POST format, ex: key=value&foo=bar
   * @param {object} json - A json object to be flattened into a string
   */
  toQuerystring: (json, noEncode) => {
    const errorMsg =
      'You should not be converting nested objects as they wont encode properly. Try making it a string first.';
    const result = [];
    for (const key in json) {
      if (Object.prototype.toString.call(json[key]) === '[object Object]') {
        throw new Error(errorMsg);
      }
      if (noEncode) {
        result.push(`${key}=${json[key]}`);
      } else {
        result.push(`${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`);
      }
    }
    return result.join('&');
  },

  /**
   * Return the query parameters from the provided string
   * @param {string} path - Path to pull querystring from, should be location.href
   * @return {object} - Dictionary containiner the url parameters
   */
  getUrlParams: (path) => {
    if (!path) {
      return {};
    }
    const bits = path.split('?');
    const querystring = bits.length > 1 ? bits[1] : '';
    return utils.toObject(querystring);
  },

  /**
   * Returns the proper label to display on analysis panel
   * @param {string}  - label that determines the unit
   * @param {object}  - props to get proper dates
   * @return {string} - Label to display on analysis panel
   */
  setValueLabel: (label, props) => {
    let date = '';
    let startDate = '';
    let endDate = '';
    let valueLabel = '';
    switch (label) {
      case 'GLAD':
        date = props.gladDateRange;
        startDate = `${date.start.toLocaleString('en-us', {
          month: 'short',
        })}-${date.start.toLocaleString('en-us', {
          year: 'numeric',
        })}`;
        endDate = `${date.end.toLocaleString('en-us', {
          month: 'short',
        })}-${date.end.toLocaleString('en-us', {
          year: 'numeric',
        })}`;
        valueLabel = `total alerts (${startDate} to ${endDate})`;
        break;
      case 'LOSS':
        date = props.treeCoverLossDateRange;
        startDate = `${date.startYear}`;
        endDate = `${date.endYear}`;
        valueLabel = `loss ${date.startYear}-${date.endYear} with >${props.canopyDensity}% canopy density`;
        break;
      case 'COVER':
        valueLabel = `tree cover (2000) with >${props.canopyDensity}% canopy density`;
        break;
      case 'VIIRS':
        valueLabel =
          props.fireDays < 7
            ? `total alerts (${props.fireDays * 24} hours)`
            : 'total alerts (past week)';
        break;
      default:
        valueLabel = label;
    }
    return valueLabel;
  },

  /**
   * Returns the proper value and unit to display on analysis panel
   * @param {string}  - label that determines the unit
   * @param {integer}  - Value to attach the unit to
   * @return {string} - Value to display on analysis panel
   */
  setValue: (label, value) => {
    let valueUnit = value;
    switch (label) {
      case 'GLAD':
        valueUnit = `${value} [${label} tree cover loss alerts]`;
        break;
      case 'VIIRS':
        valueUnit = `${value} [VIIRS active fires alerts]`;
        break;
      case 'FORMA':
        valueUnit = value;
        break;
      default:
        valueUnit = `${value} ha`;
    }
    return valueUnit;
  },
};

export { utils as default };
