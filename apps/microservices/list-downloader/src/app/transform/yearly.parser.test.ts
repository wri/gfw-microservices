import { yearlyParser } from './yearly.parser';

describe('Transform yearly.parser (WDPA preference and fallback)', () => {
  test('Uses country_specific_deforestation_wdpa_yearly.BRA when present', () => {
    const dataRow: Array<string | number> = [];
    const csvData: Array<Array<string | number>> = [];
    const operation = {
      composites: [
        {
          attribute: 'tree_cover_loss_prodes_wdpa_yearly',
          label: 'Protected Areas',
        },
      ],
      following: [],
    };

    yearlyParser(
      operation,
      dataRow,
      {
        country_specific_deforestation_wdpa_yearly: JSON.stringify({ BRA: { 2018: 10, 2019: 20 } }),
        tree_cover_loss_prodes_wdpa_yearly: '{"2018": 999}',
      },
      csvData
    );

    expect(csvData.length).toBe(2);
    expect(csvData[0]).toEqual(['Protected Areas', 10, '2018']);
    expect(csvData[1]).toEqual(['Protected Areas', 20, '2019']);
  });

  test('Falls back to tree_cover_loss_prodes_wdpa_yearly when BRA WDPA absent', () => {
    const dataRow: Array<string | number> = [];
    const csvData: Array<Array<string | number>> = [];
    const operation = {
      composites: [
        {
          attribute: 'tree_cover_loss_prodes_wdpa_yearly',
          label: 'Protected Areas',
        },
      ],
      following: [],
    };

    yearlyParser(
      operation,
      dataRow,
      {
        country_specific_deforestation_wdpa_yearly: '{}',
        tree_cover_loss_prodes_wdpa_yearly: '{"2018": 5, "2019": 6}',
      },
      csvData
    );

    expect(csvData.length).toBe(2);
    expect(csvData[0]).toEqual(['Protected Areas', 5, '2018']);
    expect(csvData[1]).toEqual(['Protected Areas', 6, '2019']);
  });
});
