import { percentParser } from './percent.parser';

describe('Percent Parser', () => {
  test('Receive [tree_cover_extent_total, tree_cover_loss_total_yearly]  and return [ "Tree Cover Extent","100.00",10,5,]', () => {
    const dataRow = [];
    const csvData = [];
    percentParser({
      operation: {
        parsed: 'percent',
        numerators: [
          {
            extentAttribute: 'tree_cover_extent_total',
            tclAttribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Extent',
          },
        ],
      },
      data: {
        tree_cover_extent_total: 5,
        tree_cover_loss_total_yearly: '{"2019": 1,"2020": 2,"2021": 3,"202": 4}',
      },
      dataRow,
      csvData,
    });
    expect(csvData[0]).toEqual(['Tree Cover Extent', '100.00', 10, 5]);
  });

  test('Receive [tree_cover_extent_total, tree_cover_loss_total_yearly]  and return ["100.00",10,5,]', () => {
    const dataRow = [];
    const csvData = [];
    percentParser({
      operation: {
        parsed: 'percent',
        numerators: [
          {
            extentAttribute: 'tree_cover_extent_total',
            tclAttribute: 'tree_cover_loss_total_yearly',
          },
        ],
      },
      data: {
        tree_cover_extent_total: 5,
        tree_cover_loss_total_yearly: '{"2019": 1,"2020": 2,"2021": 3,"202": 4}',
      },
      dataRow,
      csvData,
    });
    expect(csvData[0]).toEqual(['100.00', 10, 5]);
  });

  test('Receive []  and return []', () => {
    const dataRow = [];
    const csvData = [];
    percentParser({
      operation: {
        parsed: 'percent',
        numerators: [
          {
            extentAttribute: 'tree_cover_extent_total',
            tclAttribute: 'tree_cover_loss_total_yearly',
          },
        ],
      },
      data: {},
      dataRow,
      csvData,
    });
    expect(csvData[0]).toEqual(['0.00', 0]);
  });
});
