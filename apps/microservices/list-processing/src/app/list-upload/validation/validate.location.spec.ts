import { validateLocation } from './validate.location';

describe('Validate List attributes', () => {
  // Location Name
  it.each(['', undefined])('[Location Name] should not accept the following value: %p', (value) => {
    const errorListSize = 1;
    const attributes = [{ 'Location Name': value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toContain('Location Name');
  });

  it.each(['ID_123', 'ID-123', 'ID 123', 'TEST NAME', '1234'])(
    '[Location Name] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Location Name': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Volume
  it.each([undefined, -20, 'test'])(
    '[Volume] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ Volume: value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Volume');
    }
  );

  it.each([0, 10, 1.7, '1.7'])('[Volume] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ Volume: value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Facility Code
  it.each(['gfw-pro', '3.3', 3.3])(
    '[Facility Code] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Facility Code': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Facility Code');
    }
  );

  it.each([10, 'gfwpro10', '33', undefined])(
    '[Facility Code] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Facility Code': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Facility Email
  it.each([undefined, 'teste', 1234])(
    '[Facility Email] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Facility Email': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Facility Email');
    }
  );

  it.each(['test@wri.com', 'test@cardio.br'])(
    '[Facility Email] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Facility Email': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Analysis Radius
  it.each([undefined, -1234])(
    '[Analysis Radius] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Analysis Radius': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Analysis Radius');
    }
  );

  it.each([123, ''])('[Analysis Radius] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ 'Analysis Radius': value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Commodity
  it.each(['Select...', undefined, ''])(
    '[Commodity] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ Commodity: value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Commodity');
    }
  );

  it.each([123, '123'])('[Commodity] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ Commodity: value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Company ID
  it.each([undefined, ''])('[Company ID] should not accept the following value: %p', (value) => {
    const errorListSize = 1;
    const attributes = [{ 'Company ID': value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toContain('Company ID');
  });

  it.each([123, '123', 'Select...', 'gfw-pro', -123])(
    '[Company ID] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Company ID': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Location Classification
  it.each(['teste124', undefined, ''])(
    '[Location Classification] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Location Classification': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Location Classification');
    }
  );

  it.each(['property', 'supply shed', 'administrative area'])(
    '[Location Classification] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Location Classification': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Time Horizon
  it.each(['teste124', '123', 123])(
    '[Time Horizon] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Time Horizon': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Time Horizon');
    }
  );

  it.each(['3 months', '6 months', '1 year', undefined, ''])(
    '[Time Horizon] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Time Horizon': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(0).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Accuracy Rating of Location Entered
  it.each(['123', 123])(
    '[Accuracy Rating of Location Entered] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Accuracy Rating of Location Entered': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Accuracy Rating');
    }
  );

  it.each(['very confident', 'moderately confident', 'not confident', "don't know", '', undefined])(
    '[Accuracy Rating of Location Entered] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Accuracy Rating of Location Entered': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Latitude
  it.each([-180, 180, '', undefined, 'teste'])(
    '[Latitude] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ Latitude: value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Latitude');
    }
  );

  it.each(['20', 20, -21])('[Latitude] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ Latitude: value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Longitude
  it.each([-270, 270, '', undefined, 'teste'])(
    '[Longitude] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ Longitude: value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Longitude');
    }
  );

  it.each(['180', 180, -120])('[Longitude] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ Longitude: value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // End Date
  it.each(['31/10/2023', 'teste123'])(
    '[End Date] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'End Date': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('End Date');
    }
  );

  it.each(['10/10/2023', '12/30/2023', '', undefined])(
    '[End Date] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'End Date': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Start Date
  it.each([
    ['11/10/2023', '10/10/2023'],
    ['teste123', '10/10/2023'],
  ])('[Start Date] should not accept the following value: %p - %p', (value1, value2) => {
    const errorListSize = 1;
    const attributes = [{ 'Start Date': value1, 'End Date': value2 }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toContain('Start Date');
  });

  it.each([
    ['10/10/2023', '10/10/2023'],
    ['09/10/2023', '10/10/2023'],
    ['', '10/10/2023'],
    [undefined, '10/10/2023'],
  ])('[Start Date] should accept the following value: %p - %p', (value1, value2) => {
    const errorListSize = 0;
    const attributes = [{ 'Start Date': value1, 'End Date': value2 }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Smallholder Number
  it.each([undefined, '10.5', '10.5.5', 10.5])(
    '[Smallholder Number] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Smallholder Number': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Smallholder Number');
    }
  );

  it.each(['10', '', 10])('[Smallholder Number] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ 'Smallholder Number': value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Risk Level
  it.each(['10.5', 'test'])('[Risk Level] should not accept the following value: %p', (value) => {
    const errorListSize = 1;
    const attributes = [{ 'Risk Level': value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toContain('Risk Level');
  });

  it.each(['medium', undefined, 'high', 'low'])(
    '[Risk Level] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Risk Level': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // CCY
  it.each(['10.5', 'test'])('[CCY] should not accept the following value: %p', (value) => {
    const errorListSize = 1;
    const attributes = [{ CCY: value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toContain('CCY');
  });

  it.each([
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
    '',
    undefined,
    null,
  ])('[Risk Level] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ CCY: value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Company Policy Ranking
  it.each(['test', 10.5])(
    '[Company Policy Ranking] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Company Policy Ranking': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Company Policy Ranking');
    }
  );

  it.each(['a', 'b', 'c', undefined, null, ''])(
    '[Company Policy Ranking] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Company Policy Ranking': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Company Policy Ranking
  it.each(['test', 10.5])(
    '[Type of Investment] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Type of Investment': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Type of Investment');
    }
  );

  it.each(['new investment', 'renewal', undefined])(
    '[Type of Investment] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Type of Investment': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Verified?
  it.each(['test', 10.5, undefined])(
    '[Verified?] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Verified?': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Verified?');
    }
  );

  it.each(['yes', 'no'])('[Verified?] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ 'Verified?': value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Country
  it.each(['none', 10.5, undefined])(
    '[Country] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ Country: value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Country');
    }
  );

  it.each(['Brazil', 'test'])('[Country] should accept the following value: %p', (value) => {
    const errorListSize = 0;
    const attributes = [{ Country: value }];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toEqual(errorListSize);
    const [error] = errors;
    expect(error).toBe(undefined);
  });

  // Oil Type
  it.each(['none', 'test', '10.5'])(
    '[Oil Type] should not accept the following value: %p',
    (value) => {
      const errorListSize = 1;
      const attributes = [{ 'Oil Type': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Oil Type');
    }
  );

  it.each(['Palm Kernel Oil', 'palm oil', ' ', '', undefined])(
    '[Oil Type] should accept the following value: %p',
    (value) => {
      const errorListSize = 0;
      const attributes = [{ 'Oil Type': value }];
      const errors = validateLocation(attributes, 'cocoa generic');
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // Certification
  it.each([
    ['test', 'cattleGeneric'],
    ['test', 'cocoaFarms'],
    ['test', 'cocoa'],
    ['test', 'cocoaGeneric'],
    ['test', 'generic'],
    ['test', 'other'],
    ['test', 'investment'],
    ['test', 'palmGeneric'],
    ['test', 'palmMill'],
    ['test', 'palmPlantation'],
    ['test', 'palmFarm'],
    ['test', 'soyFarm'],
    ['test', 'soyGeneric'],
    ['test', 'soySilo'],
    ['rspo', 'cattleGeneric'],
    ['rspo', 'cocoaGeneric'],
    ['rspo', 'generic'],
    ['rspo', 'other'],
    ['rspo', 'palmGeneric'],
    ['rspo', 'soyGeneric'],
  ])(
    '[Certification] should not accept the following value: %p using the following template %p',
    (value, activeTemplate) => {
      const errorListSize = 1;
      const attributes = [{ Certification: value }];
      const errors = validateLocation(attributes, activeTemplate);
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('Certification');
    }
  );

  it.each([
    ['yes', 'cattleGeneric'],
    ['no', 'cattleGeneric'],
    ['utz', 'cocoaFarms'],
    ['fairtrade', 'cocoaFarms'],
    ['rainforest alliance', 'cocoaFarms'],
    ['other standard', 'cocoaFarms'],
    ['none', 'cocoaFarms'],
    ['utz', 'cocoa'],
    ['fairtrade', 'cocoa'],
    ['rainforest alliance', 'cocoa'],
    ['other standard', 'cocoa'],
    ['none', 'cocoa'],
    ['yes', 'cocoaGeneric'],
    ['no', 'cocoaGeneric'],
    ['yes', 'generic'],
    ['no', 'generic'],
    ['yes', 'other'],
    ['no', 'other'],
    ['none', 'investment'],
    ['rspo', 'investment'],
    ['ispo', 'investment'],
    ['mspo', 'investment'],
    ['san', 'investment'],
    ['iscc', 'investment'],
    ['rtrs', 'investment'],
    ['iscc', 'investment'],
    ['aapresid', 'investment'],
    ['utz', 'investment'],
    ['fairtrade', 'investment'],
    ['rainforest alliance', 'investment'],
    ['other standard', 'investment'],
    ['yes', 'palmGeneric'],
    ['no', 'palmGeneric'],
    ['yes', 'palmGeneric'],
    ['no', 'palmGeneric'],
    ['none', 'palmMill'],
    ['rspo', 'palmMill'],
    ['ispo', 'palmMill'],
    ['mspo', 'palmMill'],
    ['san', 'palmMill'],
    ['iscc', 'palmMill'],
    ['other standard', 'palmMill'],
    ['none', 'palmPlantation'],
    ['rspo', 'palmPlantation'],
    ['ispo', 'palmPlantation'],
    ['mspo', 'palmPlantation'],
    ['san', 'palmPlantation'],
    ['iscc', 'palmPlantation'],
    ['other standard', 'palmPlantation'],
    ['none', 'palmFarm'],
    ['rspo', 'palmFarm'],
    ['ispo', 'palmFarm'],
    ['mspo', 'palmFarm'],
    ['san', 'palmFarm'],
    ['iscc', 'palmFarm'],
    ['other standard', 'palmFarm'],
    ['none', 'palmFarm'],
    ['rspo', 'palmFarm'],
    ['ispo', 'palmFarm'],
    ['mspo', 'palmFarm'],
    ['san', 'palmFarm'],
    ['iscc', 'palmFarm'],
    ['other standard', 'palmFarm'],
    ['none', 'soyFarm'],
    ['iscc', 'soyFarm'],
    ['other standard', 'soyFarm'],
    ['aapresid', 'soyFarm'],
    ['rtrs, iscc', 'soyFarm'],
    ['yes', 'soyGeneric'],
    ['no', 'soyGeneric'],
    ['none', 'soySilo'],
    ['iscc', 'soySilo'],
    ['other standard', 'soySilo'],
    ['aapresid', 'soySilo'],
    ['rtrs, iscc', 'soySilo'],
    ['', 'soySilo'],
  ])(
    '[Certification] should accept the following value: %p using the following template %p',
    (value, activeTemplate) => {
      const errorListSize = 0;
      const attributes = [{ Certification: value }];
      const errors = validateLocation(attributes, activeTemplate);
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  // 'RSPO Model'
  it.each([
    ['test', 'palmGeneric'],
    ['none', 'palmGeneric'],
    ['test', 'palmMill'],
    ['none', 'palmMill'],
    ['test', 'palmPlantation'],
    ['none', 'palmPlantation'],
    ['test', 'palmFarm'],
    ['none', 'palmFarm'],
  ])(
    '[RSPO Model] should not accept the following value: %p using the following template %p',
    (value, activeTemplate) => {
      const errorListSize = 1;
      const attributes = [{ 'RSPO Model': value }];
      const errors = validateLocation(attributes, activeTemplate);
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toContain('RSPO model');
    }
  );

  it.each([
    ['sg', 'palmMill'],
    ['ip', 'palmMill'],
    ['mb/sg', 'palmMill'],
    ['mb/ip', 'palmMill'],
    ['sg', 'palmGeneric'],
    ['ip', 'palmGeneric'],
    ['mb/sg', 'palmGeneric'],
    ['mb/ip', 'palmGeneric'],
    ['sg', 'palmPlantation'],
    ['ip', 'palmPlantation'],
    ['mb/sg', 'palmPlantation'],
    ['mb/ip', 'palmPlantation'],
    ['sg', 'palmFarm'],
    ['ip', 'palmFarm'],
    ['mb/sg', 'palmFarm'],
    ['mb/ip', 'palmFarm'],
    ['test', 'cocoaGeneric'],
    ['none', 'cocoaGeneric'],
    ['sg', 'cocoaGeneric'],
  ])(
    '[RSPO Model] should accept the following value: %p using the following template %p',
    (value, activeTemplate) => {
      const errorListSize = 0;
      const attributes = [{ 'RSPO Model': value }];
      const errors = validateLocation(attributes, activeTemplate);
      expect(errors.length).toEqual(errorListSize);
      const [error] = errors;
      expect(error).toBe(undefined);
    }
  );

  it('returns multiple validation errors', () => {
    const attributes = [
      {
        'Location Name': '',
        'Location Classification': '',
      },
    ];
    const errors = validateLocation(attributes, 'cocoa generic');
    expect(errors.length).toBe(2);
  });
});
