import { SouthAmericaLossService } from './south.america.loss.service';

describe('South America Loss Service', () => {
  let southAmericaLossService: SouthAmericaLossService;

  beforeEach(() => {
    southAmericaLossService = new SouthAmericaLossService();
  });

  test('Receive an empty input and return just the header', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_soy_yearly: '{}',
        tree_cover_loss_total_yearly: '{}',
        tree_cover_loss_brazil_biomes_yearly: '{}',
        tree_cover_loss_prodes_yearly: '{}',
        tree_cover_loss_prodes_primary_forest_yearly: '{}',
        tree_cover_loss_prodes_wdpa_yearly: '{}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  describe('Argentina OTBN (tree_cover_loss_arg_otbn_yearly)', () => {
    test('canonical {Category: {year: number}} shape produces per-category rows', () => {
      const returnData = southAmericaLossService.generateAggregate(
        'sAmericaLossAggregate',
        'south_america_loss_of_forests_aggregate',
        {
          tree_cover_loss_arg_otbn_yearly:
            '{"Category I":{"2008":1,"2009":2},"Category II":{"2008":0.5,"2009":0.5}}',
        }
      );

      expect(returnData).toContainEqual([
        'south_america_loss_of_forests_aggregate',
        'Argentina OTBN - Category I',
        1,
        '2008',
        '3.00',
      ]);
      expect(returnData).toContainEqual([
        'south_america_loss_of_forests_aggregate',
        'Argentina OTBN - Category I',
        2,
        '2009',
        '3.00',
      ]);
      expect(returnData).toContainEqual([
        'south_america_loss_of_forests_aggregate',
        'Argentina OTBN - Category II',
        0.5,
        '2008',
        '1.00',
      ]);
      expect(returnData).toContainEqual([
        'south_america_loss_of_forests_aggregate',
        'Argentina OTBN - Category II',
        0.5,
        '2009',
        '1.00',
      ]);
    });

    test('country-enveloped {"ARG":{Category:{...}}} shape unwraps and produces per-category rows', () => {
      const returnData = southAmericaLossService.generateAggregate(
        'sAmericaLossAggregate',
        'south_america_loss_of_forests_aggregate',
        {
          tree_cover_loss_arg_otbn_yearly:
            '{"ARG":{"Category I":{"2008":1,"2009":2},"Category II":{"2008":0.5,"2009":0.5}}}',
        }
      );

      expect(returnData).toContainEqual([
        'south_america_loss_of_forests_aggregate',
        'Argentina OTBN - Category I',
        1,
        '2008',
        '3.00',
      ]);
      expect(returnData).toContainEqual([
        'south_america_loss_of_forests_aggregate',
        'Argentina OTBN - Category II',
        0.5,
        '2009',
        '1.00',
      ]);
    });

    test('empty payload produces no OTBN rows and does not throw', () => {
      const run = () =>
        southAmericaLossService.generateAggregate(
          'sAmericaLossAggregate',
          'south_america_loss_of_forests_aggregate',
          { tree_cover_loss_arg_otbn_yearly: '{}' }
        );

      expect(run).not.toThrow();
      expect(run().some((row) => String(row[1]).startsWith('Argentina OTBN'))).toBe(false);
    });

    test('empty envelope {"ARG":{}} produces no OTBN rows and does not throw', () => {
      const run = () =>
        southAmericaLossService.generateAggregate(
          'sAmericaLossAggregate',
          'south_america_loss_of_forests_aggregate',
          { tree_cover_loss_arg_otbn_yearly: '{"ARG":{}}' }
        );

      expect(run).not.toThrow();
      expect(run().some((row) => String(row[1]).startsWith('Argentina OTBN'))).toBe(false);
    });

    test('missing payload produces no OTBN rows and does not throw', () => {
      const run = () =>
        southAmericaLossService.generateAggregate(
          'sAmericaLossAggregate',
          'south_america_loss_of_forests_aggregate',
          {}
        );

      expect(run).not.toThrow();
      expect(run().some((row) => String(row[1]).startsWith('Argentina OTBN'))).toBe(false);
    });
  });

  test('Receive an input with just one year', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_soy_yearly: '{"2018": 30}',
        tree_cover_loss_total_yearly: '{"2018": 20}',
        tree_cover_loss_brazil_biomes_yearly: '{"2018": 20}',
        tree_cover_loss_prodes_yearly: '{"2018": 20}',
        tree_cover_loss_prodes_primary_forest_yearly: '{"2018": 20}',
        // Note: Not including tree_cover_loss_prodes_wdpa_yearly to avoid filling 2008-2025 range
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_america_loss_of_forests_aggregate', 'Soy on Tree Cover Loss', 30, '2018', '30.00'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 20, '2018', '20.00'],
      // PRODES will have 18 years (2008-2025) with only 2018 having data
      ...Array.from({ length: 18 }, (_, i) => {
        const year = 2008 + i;
        return [
          'south_america_loss_of_forests_aggregate',
          'PRODES',
          year === 2018 ? 20 : 0,
          year.toString(),
          '20.00',
        ];
      }),
      ['south_america_loss_of_forests_aggregate', 'Primary Forest', 20, '2018', '20.00'],
    ]);
  });

  test('Receive an input with two year', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_soy_yearly: '{"2018": 30, "2019": 20}',
        tree_cover_loss_total_yearly: '{"2018": 20, "2019": 10}',
        tree_cover_loss_brazil_biomes_yearly: '{"2018": 20, "2019": 30}',
        tree_cover_loss_prodes_yearly: '{"2018": 20, "2019": 20}',
        tree_cover_loss_prodes_primary_forest_yearly: '{"2018": 20, "2019": 15}',
        // Note: Not including tree_cover_loss_prodes_wdpa_yearly to avoid filling 2008-2025 range
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_america_loss_of_forests_aggregate', 'Soy on Tree Cover Loss', 30, '2018', '50.00'],
      ['south_america_loss_of_forests_aggregate', 'Soy on Tree Cover Loss', 20, '2019', '50.00'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 20, '2018', '30.00'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 10, '2019', '30.00'],
      // PRODES will have 18 years (2008-2025) with only 2018 and 2019 having data
      ...Array.from({ length: 18 }, (_, i) => {
        const year = 2008 + i;
        return [
          'south_america_loss_of_forests_aggregate',
          'PRODES',
          year === 2018 || year === 2019 ? 20 : 0,
          year.toString(),
          '40.00',
        ];
      }),
      ['south_america_loss_of_forests_aggregate', 'Primary Forest', 20, '2018', '35.00'],
      ['south_america_loss_of_forests_aggregate', 'Primary Forest', 15, '2019', '35.00'],
    ]);
  });

  test('Receive an input empty object', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {}
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Receive an undefined input', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      undefined
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Receive a property with null', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_soy_yearly: null,
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Uses BRA-specific WDPA when available, else falls back (backward compatibility)', () => {
    // Prefer BRA WDPA from country_specific_deforestation_wdpa_yearly
    let returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_total_yearly: JSON.stringify({ 2018: 100 }),
        country_specific_deforestation_wdpa_yearly: JSON.stringify({ BRA: { 2018: 55 } }),
        tree_cover_loss_prodes_wdpa_yearly: JSON.stringify({ 2018: 20 }),
      }
    );

    // Should have Tree Cover Loss for 2018 and Protected Areas for all years 2008-2025
    const expectedRows = [
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 100, '2018', '100.00'],
      // Protected Areas will have 18 years (2008-2025) with only 2018 having data
      ...Array.from({ length: 18 }, (_, i) => {
        const year = 2008 + i;
        return [
          'south_america_loss_of_forests_aggregate',
          'Protected Areas',
          year === 2018 ? 55 : 0,
          year.toString(),
          '55.00',
        ];
      }),
    ];
    expect(returnData).toEqual(expectedRows);

    // Fallback to tree_cover_loss_prodes_wdpa_yearly if BRA not present
    returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_total_yearly: JSON.stringify({ 2018: 100 }),
        country_specific_deforestation_wdpa_yearly: JSON.stringify({}),
        tree_cover_loss_prodes_wdpa_yearly: JSON.stringify({ 2018: 20 }),
      }
    );

    const fallbackExpectedRows = [
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 100, '2018', '100.00'],
      // Protected Areas will have 18 years (2008-2025) with only 2018 having data
      ...Array.from({ length: 18 }, (_, i) => {
        const year = 2008 + i;
        return [
          'south_america_loss_of_forests_aggregate',
          'Protected Areas',
          year === 2018 ? 20 : 0,
          year.toString(),
          '20.00',
        ];
      }),
    ];
    expect(returnData).toEqual(fallbackExpectedRows);
  });

  test('Aggregates all WDPA categories when multiple categories are present', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_total_yearly: JSON.stringify({ 2018: 100 }),
        country_specific_deforestation_wdpa_yearly: JSON.stringify({
          BRA: {
            'Category I': {
              2018: 10,
              2019: 5,
            },
            'Category II': {
              2018: 35,
              2019: 25,
            },
            'Category III': {
              2018: 15,
              2019: 10,
            },
            'Category VI': {
              2018: 20,
              2019: 15,
            },
          },
        }),
        tree_cover_loss_prodes_wdpa_yearly: JSON.stringify({ 2018: 20 }),
      }
    );

    const expectedRows = [
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 100, '2018', '100.00'],
      // Protected Areas will have 18 years (2008-2025) with 2018 and 2019 having aggregated data
      ...Array.from({ length: 18 }, (_, i) => {
        const year = 2008 + i;
        let value = 0;
        if (year === 2018) {
          value = 80;
        } // 10+35+15+20
        if (year === 2019) {
          value = 55;
        } // 5+25+10+15
        return [
          'south_america_loss_of_forests_aggregate',
          'Protected Areas',
          value,
          year.toString(),
          '135.00', // Total = 80 + 55
        ];
      }),
    ];
    expect(returnData).toEqual(expectedRows);
  });

  test('PRODES data filters years outside the PRODES date range and fills in missing years with 0', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        // Include years outside range (2007, 2026) and skip some years in range (2010, 2024)
        tree_cover_loss_prodes_yearly: JSON.stringify({
          2007: 100, // Should be filtered out (before start year 2008)
          2008: 50,
          2009: 60,
          // 2010 missing - should be filled with 0
          2011: 70,
          2023: 80,
          // 2024 missing - should be filled with 0
          2025: 90,
          2026: 110, // Should be filtered out (after end year 2025)
        }),
      }
    );

    // Should include all years from 2008-2025 with 0 for missing years
    const prodesRows = returnData.filter((row) => row[1] === 'PRODES');
    expect(prodesRows.length).toBe(18); // 2008-2025 = 18 years

    // Check specific years
    expect(prodesRows.find((row) => row[3] === '2007')).toBeUndefined(); // Filtered out
    expect(prodesRows.find((row) => row[3] === '2008')).toEqual([
      'south_america_loss_of_forests_aggregate',
      'PRODES',
      50,
      '2008',
      expect.any(String),
    ]);
    expect(prodesRows.find((row) => row[3] === '2010')).toEqual([
      'south_america_loss_of_forests_aggregate',
      'PRODES',
      0,
      '2010',
      expect.any(String),
    ]); // Filled with 0
    expect(prodesRows.find((row) => row[3] === '2024')).toEqual([
      'south_america_loss_of_forests_aggregate',
      'PRODES',
      0,
      '2024',
      expect.any(String),
    ]); // Filled with 0
    expect(prodesRows.find((row) => row[3] === '2025')).toEqual([
      'south_america_loss_of_forests_aggregate',
      'PRODES',
      90,
      '2025',
      expect.any(String),
    ]);
    expect(prodesRows.find((row) => row[3] === '2026')).toBeUndefined(); // Filtered out
  });

  test('PRODES WDPA data filters years outside the PRODES date range and fills in missing years with 0', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_prodes_wdpa_yearly: JSON.stringify({
          2007: 40, // Should be filtered out
          2008: 30,
          2015: 35,
          2025: 45,
          2026: 50, // Should be filtered out
        }),
      }
    );

    const wdpaRows = returnData.filter((row) => row[1] === 'Protected Areas');
    expect(wdpaRows.length).toBe(18); // 2008-2025 = 18 years

    // Check years are within range
    expect(wdpaRows.find((row) => row[3] === '2007')).toBeUndefined();
    expect(wdpaRows.find((row) => row[3] === '2008')).toEqual([
      'south_america_loss_of_forests_aggregate',
      'Protected Areas',
      30,
      '2008',
      expect.any(String),
    ]);
    expect(wdpaRows.find((row) => row[3] === '2009')).toEqual([
      'south_america_loss_of_forests_aggregate',
      'Protected Areas',
      0,
      '2009',
      expect.any(String),
    ]); // Filled with 0
    expect(wdpaRows.find((row) => row[3] === '2025')).toEqual([
      'south_america_loss_of_forests_aggregate',
      'Protected Areas',
      45,
      '2025',
      expect.any(String),
    ]);
    expect(wdpaRows.find((row) => row[3] === '2026')).toBeUndefined();
  });
});
