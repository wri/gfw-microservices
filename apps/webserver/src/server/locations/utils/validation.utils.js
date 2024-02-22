const moment = require('moment');

const DATE_FORMATS = ['MM/DD/YYYY', 'M/D/YYYY', 'MM/D/YYYY'];

const mandatoryLocationName = (str) => {
  let returnValue = true;
  if (str === '') {
    returnValue = false;
  }
  return returnValue;
};

const checkNUllOrUndefined = (str) => {
  let returnValue = false;
  if (str === undefined || str === null || str === '') {
    returnValue = true;
  }
  return returnValue;
};

const mandatoryCheck = (str) => {
  let returnValue = true;
  if (!str && typeof str !== 'number') {
    returnValue = false;
  } else if (str.length === 0) {
    returnValue = false;
  }
  return returnValue;
};

const greaterThanZeroFloats = (value) => {
  const val = typeof value === 'string' && value !== '' && value !== null ? Number(value) : value;
  const regCheck = /^(0*[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*)$/;
  return regCheck.test(val) || val === 0 || val === '' || val === null;
};

const onlyNumber = (value) => {
  const regCheck = /^[0-9]*$/g;
  return regCheck.test(value) || value === '' || value === ' ';
};

const alphanumericSpace = (str) => {
  const regCheck = /^[a-zA-Z0-9.\-_\s\\']*$/;
  return str === '' || regCheck.test(str);
};

const alphanumeric = (str) => {
  const regCheck = /^[a-zA-Z0-9]*$/;
  return regCheck.test(str) || str === '';
};

const analysisCheck = (value) => {
  return value >= 0 || value === '';
};

const companyIdCheck = (str, template) => {
  const optionalTemplates = [
    'rubberGeneric',
    'palmGeneric',
    'soyFarm',
    'soyGeneric',
    'cattle',
    'cattleGeneric',
    'cocoaGeneric',
    'other',
    'generic',
    'investment',
    'pulpGeneric',
    'palmGeneric',
    'rubberGeneric',
    'sugarCaneGeneric',
  ];
  let returnValue = true;
  if (optionalTemplates.indexOf(template) > -1) {
    returnValue = true;
  } else if (!str && typeof str !== 'number') {
    returnValue = false;
  } else if (str.length === 0) {
    returnValue = false;
  }

  return returnValue;
};

const isNotSelect = (value) => {
  return value !== 'Select...';
};

const locationClassCheck = (str) => {
  const newStr = (str ?? '').toLowerCase();
  return (
    mandatoryCheck(newStr) &&
    (newStr === 'property' ||
      newStr === 'supply shed' ||
      newStr === 'administrative area' ||
      newStr === '')
  );
};

const timeHorizon = (str) => {
  if (typeof str === 'number') {
    return false;
  }
  let returnValue = true;
  const newStr = (str ?? '').toLowerCase();
  if (
    str &&
    newStr.toLowerCase() !== '3 months' &&
    newStr.toLowerCase() !== '6 months' &&
    newStr.toLowerCase() !== '1 year'
  ) {
    returnValue = false;
  }
  return returnValue;
};

const latitudeCheck = (value) => {
  const latitude = parseFloat(value);
  if (latitude) {
    return latitude <= 90 && latitude >= -90 && typeof latitude !== 'string';
  }
  return false;
};

const longitudeCheck = (value) => {
  const longitude = parseFloat(value);
  if (longitude) {
    return longitude <= 180 && longitude >= -180 && typeof longitude !== 'string';
  }
  return false;
};

const accuracyOptions = (str) => {
  let returnValue = true;
  if (str && typeof str === 'string') {
    if (
      str.toLowerCase() !== 'very confident' &&
      str.toLowerCase() !== 'moderately confident' &&
      str.toLowerCase() !== 'not confident' &&
      str.toLowerCase() !== "don't know" &&
      str.toLowerCase() !== 'dont know'
    ) {
      returnValue = false;
    }
  } else if (str && typeof str === 'number') {
    if (str !== 0 && str !== 1 && str !== 2 && str !== 3) {
      returnValue = false;
    }
  }
  return returnValue;
};

const validDate = (date) => {
  // Date is not mandatory (empty string or null is valid)
  if (!date || date === '') {
    return true;
  }

  try {
    const momentDate = moment(date,DATE_FORMATS, true);
    if (momentDate.isValid()) {
      return true;
    }

    // Otherwise if it has a year
    const regCheck = /^(0[1-9]|1[0-2]|[1-9])\/(0[1-9]|[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
    return regCheck.test(date);

  } catch (e) {
    return false;
  }
};

const validStartDate = (dateStart, dateEnd) => {
  // Date is not mandatory (empty string or null is valid)
  if (!dateStart || dateStart === '') {
    return true;
  }

  try {
    const momentDateStart = moment(dateStart, DATE_FORMATS, true);
    // Otherwise if it has a year
    if (momentDateStart.year()) {
      if (dateEnd) {
        const momentDateEnd = moment(dateEnd, DATE_FORMATS, true);
        // Check if start date is before end date
        return momentDateStart <= momentDateEnd; // Can be true or false
      }
      return true;
    }
    // Anything else is false
    return false;
  } catch (e) {
    return false;
  }
};

const isNotNone = (value) => {
  if (!value || typeof value === 'number') {
    return false;
  }
  return value.toLowerCase() !== 'none';
};

const existsCheck = (str) => {
  let returnValue = true;
  const passedValue = String(str);
  if (!passedValue || passedValue.length === 0) {
    returnValue = false;
  }
  return returnValue;
};

const riskLevelCheck = (str) => {
  if (
    str &&
    (str === '' ||
      str.toLowerCase() === 'high' ||
      str.toLowerCase() === 'medium' ||
      str.toLowerCase() === 'low')
  ) {
    return true;
  }
  if (str === '' || str === ' ') {
    return true;
  }
  if (!str) {
    return true;
  }
  return false;
};

const currencyCheck = (str) => {
  const validCurrencyValues = [
    'AED',
    'AFN',
    'ALL',
    'AMD',
    'ANG',
    'AOA',
    'ARS',
    'AUD',
    'AWG',
    'AZN',
    'BAM',
    'BBD',
    'BDT',
    'BGN',
    'BHD',
    'BIF',
    'BMD',
    'BND',
    'BOB',
    'BOV',
    'BRL',
    'BSD',
    'BTN',
    'BWP',
    'BYN',
    'BZD',
    'CAD',
    'CDF',
    'CHE',
    'CHF',
    'CHW',
    'CLF',
    'CLP',
    'CNY',
    'COP',
    'COU',
    'CRC',
    'CUC',
    'CUP',
    'CVE',
    'CZK',
    'DJF',
    'DKK',
    'DOP',
    'DZD',
    'EGP',
    'ERN',
    'ETB',
    'EUR',
    'FJD',
    'FKP',
    'GBP',
    'GEL',
    'GHS',
    'GIP',
    'GMD',
    'GNF',
    'GTQ',
    'GYD',
    'HKD',
    'HNL',
    'HRK',
    'HTG',
    'HUF',
    'IDR',
    'ILS',
    'INR',
    'IQD',
    'IRR',
    'ISK',
    'JMD',
    'JOD',
    'JPY',
    'KES',
    'KGS',
    'KHR',
    'KMF',
    'KPW',
    'KRW',
    'KWD',
    'KYD',
    'KZT',
    'LAK',
    'LBP',
    'LKR',
    'LRD',
    'LSL',
    'LYD',
    'MAD',
    'MDL',
    'MGA',
    'MKD',
    'MMK',
    'MNT',
    'MOP',
    'MRU',
    'MUR',
    'MVR',
    'MWK',
    'MXN',
    'MXV',
    'MYR',
    'MZN',
    'NAD',
    'NGN',
    'NIO',
    'NOK',
    'NPR',
    'NZD',
    'OMR',
    'PAB',
    'PEN',
    'PGK',
    'PHP',
    'PKR',
    'PLN',
    'PYG',
    'QAR',
    'RON',
    'RSD',
    'RUB',
    'RWF',
    'SAR',
    'SBD',
    'SCR',
    'SDG',
    'SEK',
    'SGD',
    'SHP',
    'SLL',
    'SOS',
    'SRD',
    'SSP',
    'STN',
    'SVC',
    'SYP',
    'SZL',
    'THB',
    'TJS',
    'TMT',
    'TND',
    'TOP',
    'TRY',
    'TTD',
    'TWD',
    'TZS',
    'UAH',
    'UGX',
    'USD',
    'USN',
    'UYI',
    'UYU',
    'UZS',
    'VEF',
    'VND',
    'VUV',
    'WST',
    'XAF',
    'XAG',
    'XAU',
    'XBA',
    'XBB',
    'XBC',
    'XBD',
    'XCD',
    'XDR',
    'XOF',
    'XPD',
    'XPF',
    'XPT',
    'XSU',
    'XTS',
    'XUA',
    'XXX',
    'YER',
    'ZAR',
    'ZMW',
    'ZWL',
  ];
  return checkNUllOrUndefined(str) || validCurrencyValues.includes(String(str).toUpperCase());
};

const policyRankingCheck = (str) => {
  if (typeof str === 'number') {
    return false;
  }

  if (checkNUllOrUndefined(str)) {
    return true;
  }

  const lcString = str && str.trim().toLowerCase();
  return lcString && (lcString === 'a' || lcString === 'b' || lcString === 'c');
};

const investmentType = (str) => {
  if (typeof str === 'number') {
    return false;
  }
  let returnValue = true;
  if (str && str.toLowerCase() !== 'renewal' && str.toLowerCase() !== 'new investment') {
    returnValue = false;
  }
  return returnValue;
};

const certificationCheck = (value, template) => {
  const certObj = {
    cattleGeneric: ['yes', 'no'],
    cocoaFarms: ['utz', 'fairtrade', 'rainforest alliance', 'other standard', 'none'],
    cocoa: ['utz', 'fairtrade', 'rainforest alliance', 'other standard', 'none'],
    cocoaGeneric: ['yes', 'no'],
    generic: ['yes', 'no'],
    other: ['yes', 'no'],
    investment: [
      'none',
      'rspo',
      'ispo',
      'mspo',
      'san',
      'rtrs',
      'iscc',
      'aapresid',
      'utz',
      'fairtrade',
      'rainforest alliance',
      'other standard',
      'other',
    ],
    palmGeneric: ['yes', 'no'],
    palmMill: ['none', 'rspo', 'ispo', 'mspo', 'san', 'iscc', 'other standard'],
    palmPlantation: ['none', 'rspo', 'ispo', 'mspo', 'san', 'iscc', 'other standard', 'none'],
    palmFarm: ['none', 'rspo', 'ispo', 'mspo', 'san', 'iscc', 'other standard', 'none'],
    soyFarm: ['rtrs', 'iscc', 'aapresid', 'other standard', 'none'],
    soyGeneric: ['yes', 'no'],
    soySilo: ['rtrs', 'iscc', 'aapresid', 'other standard', 'none'],
  };

  let valid = true;

  if (checkNUllOrUndefined(value)) {
    return true;
  }

  if (template) {
    if (value && typeof value === 'string') {
      const valueArray = value.split(',');
      valueArray.forEach((cert) => {
        if (certObj[template] && !certObj[template].includes(cert.toLowerCase().trim())) {
          valid = false;
        } else {
          valid = true;
        }
      });
    } else if (typeof value === 'number') {
      valid = false;
    }
  }
  return valid;
};

const oilTypeCheck = (str) => {
  if (
    str &&
    (str === '' || str.toLowerCase() === 'palm oil' || str.toLowerCase() === 'palm kernel oil')
  ) {
    return true;
  }
  if (str === '' || str === ' ') {
    return true;
  }
  if (!str) {
    return true;
  }
  return false;
};

const rspoTypeCheck = (value, template) => {
  const certObj = {
    palmGeneric: ['ip', 'sg', 'mb', 'mb/sg', 'mb/ip'],
    palmMill: ['ip', 'sg', 'mb', 'mb/sg', 'mb/ip'],
    palmPlantation: ['ip', 'sg', 'mb', 'mb/sg', 'mb/ip'],
    palmFarm: ['ip', 'sg', 'mb', 'mb/sg', 'mb/ip'],
  };

  let valid = true;

  if (template) {
    if (value && typeof value === 'string') {
      const valueArray = value.split(',');
      valueArray.forEach((cert) => {
        if (certObj[template] && !certObj[template].includes(cert.toLowerCase().trim())) {
          valid = false;
        } else {
          valid = true;
        }
      });
    } else if (typeof value === 'number') {
      valid = false;
    }
  }
  return valid;
};

const validEmail = (str) => {
  const regCheck =
    /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regCheck.test(str) || str === '';
};

const yesNoBinaryCheck = (value) =>
  String(value).toLowerCase() === 'yes' || String(value).toLowerCase() === 'no' || value === '';

const fieldValidations = {
  name: {
    validations: [alphanumericSpace],
    text: 'Please ensure that name is populated with text',
  },
  'Location Name': {
    validations: [mandatoryCheck, mandatoryLocationName, alphanumericSpace],
    text: 'Please ensure that Location Name is populated with text',
  },
  Volume: {
    validations: [greaterThanZeroFloats],
    text: 'Please ensure that Volume is populated with a decimal value that is >= 0',
  },
  'Facility Code': {
    validations: [alphanumeric],
    text: 'Please ensure that Facility Code is populated with text',
  },
  'National Facility Code': {
    validations: [alphanumeric],
    text: 'Please ensure that National Facility Code is populated with text',
  },
  'Slaughterhouse Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Name of the Slaughterhouse is populated with text',
  },
  'Name of the Slaughterhouse': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Name of the Slaughterhouse is populated with text',
  },
  'Slaughterhouse Contact': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Slaughterhouse Contact is populated with text',
  },
  'Facility Email': {
    validations: [validEmail],
    text: 'Please ensure that the Facility Email is populated with valid email',
  },
  'Code of the Slaughterhouse': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Code of the Slaughterhouse is populated with text',
  },
  'Analysis Radius': {
    validations: [analysisCheck],
    text: 'Please ensure that Analysis Radius is populated with a decimal value that is >= 0',
  },
  'Analysis Area': {
    validations: [analysisCheck],
    text: 'Please ensure that Analysis Area is populated with a decimal value that is >= 0',
  },
  'Company ID': {
    validations: [companyIdCheck],
    text: 'Please ensure that Company ID is populated with text',
  },
  'Company Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Company Name is populated with text',
  },
  'Supplier Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Supplier Name is populated with text',
  },
  'Facility Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Facility Name is populated with text',
  },
  'Refinery Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Refinery Name is populated with text',
  },
  'Supplier Name 2': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Supplier Name 2 is populated with text',
  },
  'Facility Name 2': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Facility Name 2 is populated with text',
  },
  'Refinery Name 2': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Refinery Name 2 is populated with text',
  },
  'Second Supplier Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Second Supplier Name is populated with text',
  },
  'Second Facility Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Second Facility Name is populated with text',
  },
  'Second Refinery Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Second Refinery Name is populated with text',
  },
  'Owner ID': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Owner ID is populated with text',
  },
  'Owner Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Owner Name is populated with text',
  },
  Commodity: {
    validations: [mandatoryCheck, isNotSelect],
    text: 'Please ensure that Commodity is populated with one of the following: soy, palm oil, cattle, cocoa, rubber, pulp and paper, coffee, sugar cane or other',
  },
  'Location Classification': {
    validations: [mandatoryCheck, isNotSelect, locationClassCheck],
    text: 'Please ensure that Location Classification is populated with one of the following: Property, Supply Shed or Administrative Area',
  },
  'Time Horizon': {
    validations: [timeHorizon],
    text: 'Please ensure that Time Horizon is populated with one of the following: 3 months, 6 months or 1 year',
  },
  'Accuracy Rating of Location Entered': {
    validations: [accuracyOptions],
    text: 'Please ensure that Accuracy Rating is populated with one of the following: very confident, moderately confident, not confident, dont know',
  },
  'Facility Capacity': {
    validations: [greaterThanZeroFloats],
    text: 'Please ensure that facility capacity is populated with a decimal value that is >= 0',
  },
  'Additional Attribute 1 Name': {
    validations: [],
    text: 'Please ensure that additional attribute is populated with text',
  },
  'Additional Attribute 2 Name': {
    validations: [],
    text: 'Please ensure that additional attribute is populated with text',
  },
  'Additional Attribute 3 Name': {
    validations: [],
    text: 'Please ensure that additional attribute is populated with text',
  },
  Attribute1: {
    validations: [],
    text: '',
  },
  Attribute2: {
    validations: [],
    text: '',
  },
  Attribute3: {
    validations: [],
    text: '',
  },
  'Attribute Name 1': {
    validations: [],
    text: '',
  },
  'Attribute Name 2': {
    validations: [],
    text: '',
  },
  'Attribute Name 3': {
    validations: [],
    text: '',
  },
  'Cadaster ID': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Cadaster ID is populated with text',
  },
  Latitude: {
    validations: [latitudeCheck],
    text: 'Please ensure that Latitude is populated with a decimal value between -90.00 and 90.00',
  },
  Longitude: {
    validations: [longitudeCheck],
    text: 'Please ensure that Longitude is populated with a decimal value between -180.00 and 180.00',
  },
  'Monitoring Timeframe - Start Date': {
    validations: [validDate, validStartDate],
    text: 'Please ensure your dates are valid ("MM/DD/YYYY") and Start Date is before End Date',
  },
  'Monitoring Timeframe - End Date': {
    validations: [validDate],
    text: 'Please ensure your dates are valid ("MM/DD/YYYY format)',
  },
  'Start Date': {
    validations: [validDate, validStartDate],
    text: 'Please ensure that Start Date is populated with the date in the following Date format: MM/DD/YYYY (for example: 03/02/2017)',
  },
  'End Date': {
    validations: [validDate],
    text: 'Please ensure that End Date is populated with the date in the following Date format: MM/DD/YYYY (for example: 03/02/2017)',
  },
  'Smallholder Number': {
    validations: [onlyNumber],
    text: 'Smallholder Number must be an integer',
  },
  'Number of Smallholders': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Number of Smallholders is populated with text',
  },
  'Independent Smallholder FFB': {
    validations: [greaterThanZeroFloats],
    text: 'Please ensure that Independent Smallholder FFB is populated with a decimal value that is >= 0',
  },
  'Associated Smallholder FFB': {
    validations: [greaterThanZeroFloats],
    text: 'Please ensure that Associated Smallholder FFB is populated with a decimal value that is >= 0',
  },
  'Other FFB': {
    validations: [greaterThanZeroFloats],
    text: 'Please ensure that Other FFB is populated with a decimal value that is >= 0',
  },
  'Direct FFB': {
    validations: [greaterThanZeroFloats],
    text: 'Please ensure that Direct FFB is populated with a decimal value that is >= 0',
  },
  'Size of Investment': {
    validations: [greaterThanZeroFloats],
    text: 'Please ensure that Size of Investment is populated with a decimal value that is >= 0',
  },
  'Investment Name': {
    validations: [mandatoryCheck, alphanumericSpace],
    text: 'Please ensure that Investment Name is populated with text',
  },
  'Risk Level': {
    validations: [riskLevelCheck],
    text: 'Please ensure that Risk Level is populated with one of the following: High, Medium or Low',
  },
  CCY: {
    validations: [currencyCheck],
    text:
      'Please ensure that CCY is populated with one of the following: ' +
      'AED, AFN, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, ' +
      'BIF, BMD, BND, BOB, BOV, BRL, BSD, BTN, BWP, BYN, BZD, CAD, CDF, CHE, CHF, ' +
      'CHW, CLF, CLP, CNY, COP, COU, CRC, CUC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, ' +
      'EGP, ERN, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, ' +
      'HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, IRR, ISK, JMD, JOD, JPY, KES, KGS, ' +
      'KHR, KMF, KPW, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, ' +
      'MGA, MKD, MMK, MNT, MOP, MRU, MUR, MVR, MWK, MXN, MXV, MYR, MZN, NAD, NGN, ' +
      'NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, ' +
      'RUB, RWF, SAR, SBD, SCR, SDG, SEK, SGD, SHP, SLL, SOS, SRD, SSP, STN, SVC, ' +
      'SYP, SZL, THB, TJS, TMT, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, USN, ' +
      'UYI, UYU, UZS, VEF, VND, VUV, WST, XAF, XAG, XAU, XBA, XBB, XBC, XBD, XCD, ' +
      'XDR, XOF, XPD, XPF, XPT, XSU, XTS, XUA, XXX, YER, ZAR, ZMW, ZWL',
  },
  'Company Policy Ranking': {
    validations: [policyRankingCheck],
    text: 'Please ensure that Company Policy Ranking is populated with one of the following: A, B or C',
  },
  'Commercial Entity - Counterparty': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Commercial Entity - Counterparty is populated with text',
  },
  'Commercial Entity - Parent Company or Group': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Commercial Entity - Parent Company or Group is populated with text',
  },
  Counterparty: {
    validations: [alphanumericSpace],
    text: 'Please ensure that Counterparty is populated with text',
  },
  'Parent Company or Group': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Parent Company or Group is populated with text',
  },
  'Type of Investment': {
    validations: [investmentType],
    text: 'Please ensure that Type of Investment is populated with one of the following: New Investment or Renewal',
  },
  Certification: {
    validations: [isNotSelect, certificationCheck],
    text: 'Please ensure that Certification is populated with one of the following: Yes or No',
    certObj: {
      cattleGeneric: 'Please make sure Certifications are any combination of:  Yes, No',
      cocoaFarms:
        'Please ensure that Certification is populated with one or more of the following: UTZ, Fairtrade, Rainforest Alliance, Other Standard or None.',
      cocoa:
        'Please ensure that Certification is populated with one or more of the following:  UTZ, Fairtrade, Rainforest Alliance, Other Standard, None',
      cocoaGeneric: 'Please make sure Certifications are any combination of:  Yes, No',
      generic: 'Please make sure Certifications are any combination of:  Yes, No',
      other: 'Please make sure Certifications are any combination of:  Yes, No',
      investment:
        'Please ensure that Certification is populated with one or more of the following: NONE, RSPO, ISPO, MSPO, SAN, ISCC, RTRS, ISCC, AAPRESID, UTZ, Fairtrade, Rainforest Alliance, and Other Standard. If more than one Certification is selected, please comma separate',
      palmGeneric: 'Please make sure Certifications are any combination of:  Yes, No',
      palmMill:
        'Please make sure Certifications are any combination of:  None, RSPO, ISPO, MSPO, SAN, ISCC, Other Standard',
      palmPlantation:
        'Please ensure that Certification is populated with one or more of the following: RSPO, ISPO, MSPO, SAN, ISCC, Other Standard or None. If more than one Certification is selected, please comma separate',
      palmFarm:
        'Please ensure that Certification is populated with one or more of the following: RSPO, ISPO, MSPO, SAN, ISCC, Other Standard or None. If more than one Certification is selected, please comma separate',
      soyFarm:
        'Please ensure that Certification is populated with one or more of the following: RTRS, ISCC, AAPRESID, Other Standard or None. If more than one Certification is selected, please comma separate',
      soyGeneric:
        'Please ensure that Certification is populated with one of the following: Yes or No',
      soySilo:
        'Please ensure that Certification is populated with one or more of the following: RTRS, ISCC, AAPRESID, Other Standard or None. If more than one Certification is selected, please comma separate',
    },
  },
  'Parent Company': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Parent Company is populated with text',
  },
  'Verified?': {
    validations: [isNotSelect, yesNoBinaryCheck],
    text: 'Please ensure that Verified? is populated with one of the following: Yes or No',
  },
  'Oil Type': {
    validations: [isNotSelect, oilTypeCheck],
    text: 'Please ensure that Oil Type is populated with one of the following: Palm Oil or Palm Kernel Oil',
  },
  'RSPO Model': {
    validations: [isNotSelect, rspoTypeCheck],
    text: 'RSPO model must be either IP, MB, SG, MB/SG, or MB/IP',
  },
  'Smallholder Type': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Type of Smallholder is populated with text',
  },
  'Type of Smallholder': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Type of Smallholder is populated with text',
  },
  ID: {
    validations: [existsCheck],
    text: 'Please ensure that ID is populated with text',
  },
  'Facility E-mail': {
    validations: [],
    text: 'Please ensure that Facility E-mail is populated with text',
  },
  'Facility Phone': {
    validations: [],
    text: 'Please ensure that Facility Phone is populated with a valid phone number',
  },
  'Facility Type': {
    validations: [alphanumericSpace, isNotSelect],
    text: 'Please ensure that Facility Type is populated with text',
  },
  'Facility Owner': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Facility Owner is populated with text',
  },
  'Business ID': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Business ID is populated with text',
  },
  'Company Contact': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Company Contact is populated with text',
  },
  'Cooperative Name': {
    validations: [alphanumericSpace],
    text: 'Please ensure that Cooperative Name is populated with text',
  },
  'Improvement Programs': {
    validations: [],
    text: 'Please ensure that Improvement Program is populated with text',
  },
  Country: {
    validations: [isNotNone],
    text: 'Country is not on land',
  },
  State: {
    validations: [isNotNone],
    text: 'Location is not on land',
  },
  'Sub State': {
    validations: [],
    text: 'Location is not on land',
  },
};

const validateAttributes = (attributes, activeTemplate) => {
  const errors = new Set();
  attributes.forEach((attribute) => {
    Object.entries(attribute).forEach(([key, value]) => {
      fieldValidations[key]?.validations.forEach((validation) => {
        const comparedKey = key.toLowerCase();
        let valid = true;
        if (['company id', 'rspo model', 'certification'].includes(comparedKey)) {
          valid = validation(value, activeTemplate);
        } else if (comparedKey === 'start date' && attribute['End Date']) {
          valid = validation(value, attribute['End Date']);
        } else {
          valid = validation(value);
        }
        if (!valid) {
          let text = '';
          if (comparedKey === 'certification') {
            text = fieldValidations[key]?.certObj[activeTemplate] ?? '';
          } else {
            text = fieldValidations[key]?.text ?? '';
          }
          errors.add(`${text}`);
        }
      });
    });
  });
  return Array.from(errors);
};

module.exports = {
  validateAttributes,
  validDate,
};
