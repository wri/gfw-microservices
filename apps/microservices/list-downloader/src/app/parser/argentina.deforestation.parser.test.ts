import { argentinaDeforestationParser } from './argentina.deforestation.parser';

describe('ArgentinaDeforestation Parser', () => {
  const input = {
    operation: {
      name: 'argentinaDeforestation',
      parsed: 'overhead',
      composites: [
        {
          attribute: 'country_specific_deforestation_classified_region_yearly',
          label: 'OTBN',
        },
        {
          attribute: 'country_specific_deforestation_wdpa_yearly',
          label: 'Argentina Protected Areas',
        },
        {
          attribute: 'country_specific_deforestation_landmark_yearly',
          label: 'Indigenous territories',
        },
        { attribute: 'country_specific_deforestation_yearly', label: 'Country' },
      ],
    },
    data: {},
    dataRow: [],
    csvData: [],
  };

  it('All input that is null', () => {
    const csvData = argentinaDeforestationParser({
      ...input,
      data: {
        country_specific_deforestation_classified_region_yearly: null,
        country_specific_deforestation_landmark_yearly: null,
        country_specific_deforestation_wdpa_yearly: null,
        country_specific_deforestation_yearly: null,
      },
    });
    expect(csvData).toStrictEqual([]);
  });

  it('Check if works when receive an empty input', () => {
    const csvData = argentinaDeforestationParser(input);
    expect(csvData).toStrictEqual([]);
  });

  it('All inputs are with the default empty value', () => {
    const emptyValueWithArg = {
      ...input,
      data: {
        country_specific_deforestation_classified_region_yearly: '{"ARG":{}}}',
        country_specific_deforestation_landmark_yearly: '{"ARG":{}}}',
        country_specific_deforestation_wdpa_yearly: '{"ARG":{}}}',
        country_specific_deforestation_yearly: '{"ARG": {}}',
      },
    };
    const csvData = argentinaDeforestationParser(emptyValueWithArg);
    expect(csvData).toStrictEqual([]);
  });

  it('All inputs are undefined', () => {
    const allUndefined = {
      ...input,
      data: {
        country_specific_deforestation_classified_region_yearly: undefined,
        country_specific_deforestation_landmark_yearly: undefined,
        country_specific_deforestation_wdpa_yearly: undefined,
        country_specific_deforestation_yearly: undefined,
      },
    };
    const csvData = argentinaDeforestationParser(allUndefined);
    expect(csvData).toStrictEqual([]);
  });

  it('All inputs are empty string', () => {
    const emptyString = {
      ...input,
      data: {
        country_specific_deforestation_classified_region_yearly: '',
        country_specific_deforestation_landmark_yearly: '',
        country_specific_deforestation_wdpa_yearly: '',
        country_specific_deforestation_yearly: '',
      },
    };
    const csvData = argentinaDeforestationParser(emptyString);
    expect(csvData).toStrictEqual([]);
  });

  it('All inputs are string with empty object', () => {
    const emptyObject = {
      ...input,
      data: {
        country_specific_deforestation_classified_region_yearly: '{}',
        country_specific_deforestation_landmark_yearly: '{}',
        country_specific_deforestation_wdpa_yearly: '{}',
        country_specific_deforestation_yearly: '{}',
      },
    };
    const csvData = argentinaDeforestationParser(emptyObject);
    expect(csvData).toStrictEqual([]);
  });

  it('Check when just one input is set', () => {
    const newInput = {
      ...input,
      data: {
        country_specific_deforestation_classified_region_yearly: null,
        country_specific_deforestation_landmark_yearly: null,
        country_specific_deforestation_wdpa_yearly: null,
        country_specific_deforestation_yearly: '{"ARG": {"2022":1.1,"2023":2.2}}',
      },
    };
    const csvData = argentinaDeforestationParser(newInput);
    expect(csvData).toStrictEqual([
      ['Argentina Deforestation Data', 'Country', 1.1, '2022', 3.3, '33.33'],
      ['Argentina Deforestation Data', 'Country', 2.2, '2023', 3.3, '66.67'],
    ]);
  });

  it('All fields are filled out', () => {
    const newInput = {
      ...input,
      data: {
        country_specific_deforestation_classified_region_yearly:
          '{"ARG":{"Category III":{"2022":3.1,"2023":4.2}}}',
        country_specific_deforestation_landmark_yearly:
          '{"ARG":{"Not Reported":{"2022":5.1,"2023":6.2}}}',
        country_specific_deforestation_wdpa_yearly:
          '{"ARG":{"Category VI":{"2022":7.1,"2023":8.2}}}',
        country_specific_deforestation_yearly: '{"ARG": {"2022":1.1,"2023":2.2}}',
      },
    };
    const csvData = argentinaDeforestationParser(newInput);
    expect(csvData).toStrictEqual([
      ['Argentina Deforestation Data', 'Country', 1.1, '2022', 3.3, '33.33'],
      ['Argentina Deforestation Data', 'Country', 2.2, '2023', 3.3, '66.67'],
      ['Argentina Deforestation Data', 'OTBN - Category III', 3.1, '2022', 7.3, '42.47'],
      ['Argentina Deforestation Data', 'OTBN - Category III', 4.2, '2023', 7.3, '57.53'],
      [
        'Argentina Deforestation Data',
        'Argentina Protected Areas - Category VI',
        7.1,
        '2022',
        15.3,
        '46.41',
      ],
      [
        'Argentina Deforestation Data',
        'Argentina Protected Areas - Category VI',
        8.2,
        '2023',
        15.3,
        '53.59',
      ],
      [
        'Argentina Deforestation Data',
        'Indigenous territories - Not Reported',
        5.1,
        '2022',
        11.3,
        '45.13',
      ],
      [
        'Argentina Deforestation Data',
        'Indigenous territories - Not Reported',
        6.2,
        '2023',
        11.3,
        '54.87',
      ],
      ['Argentina Deforestation Data', 'Country', 1.1, '2022', 3.3, '33.33'],
      ['Argentina Deforestation Data', 'Country', 2.2, '2023', 3.3, '66.67'],
    ]);
  });
});
