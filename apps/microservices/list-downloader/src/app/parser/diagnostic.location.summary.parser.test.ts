import { diagnosticLocationSummaryParser } from './diagnostic.location.summary.parser';

describe('Diagnostic Location Summary Parser', () => {
  test('Receive empty and get ["0.00", "0.00", ""]', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        fields: [
          { attribute: 'tree_cover_extent_total', parsed: 'percent' },
          { attribute: 'tree_cover_extent_total', parsed: 'aggregate' },
        ],
        additionalFields: [{ attribute: 'Volume', parsed: 'aggregate' }],
      },
      data: {},
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['0.00', '0.00', '']);
  });

  test('Need field value and total area as you chosen to be parsed as percent', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        fields: [{ attribute: 'tree_cover_extent_total', parsed: 'percent' }],
      },
      data: {
        Country: 'Brazil',
        State: 'Rio de Janeiro',
        tree_cover_extent_total: '1000',
        total_area: 2000,
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['Rio de Janeiro', 'Brazil', '50.00']);
  });

  test('Need just the field value as you chosen to be parsed as aggregate', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        fields: [{ attribute: 'tree_cover_extent_total', parsed: 'aggregate' }],
      },
      data: {
        Country: 'Brazil',
        State: 'Rio de Janeiro',
        tree_cover_extent_total: '100.21543',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['Rio de Janeiro', 'Brazil', '100.22']);
  });

  test('Receive Additional fields as string and just return it ', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        additionalFields: [{ attribute: 'Volume', parsed: 'aggregate' }],
      },
      data: {
        Volume: '100.21543',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['100.21543']);
  });

  test('Receive Additional fields as object and aggregate it ', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        additionalFields: [{ attribute: 'Volume', parsed: 'aggregate' }],
      },
      data: {
        Volume: { value: 100.21543 },
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['100.22']);
  });

  test('Receive Additional fields as object and calculate percent ', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        additionalFields: [{ attribute: 'Volume', parsed: 'percent' }],
      },
      data: {
        total_area: 1000,
        Volume: { value: 100.21543 },
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['10.02']);
  });

  test('Receive Additional fields as null and return empty', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        additionalFields: [{ attribute: 'Volume', parsed: 'percent' }],
      },
      data: {
        Volume: null,
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['']);
  });

  test('Receive Additional fields receive zero parse it as aggregate ', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        additionalFields: [{ attribute: 'Volume', parsed: 'aggregate' }],
      },
      data: {
        Volume: '0',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['0']);
  });

  test('Receive Additional fields receive zero parse it as percent', () => {
    const dataRow = [];
    const csvData = [];
    diagnosticLocationSummaryParser({
      operation: {
        additionalFields: [{ attribute: 'Volume', parsed: 'percent' }],
      },
      data: {
        Volume: '0',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['0']);
  });
});
