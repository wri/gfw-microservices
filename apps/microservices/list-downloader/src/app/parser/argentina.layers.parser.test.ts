import { argentinaLayers } from './argentina.layers.parser';

describe('Argentina Layers Parser', () => {
  test('All input parameters is empty', () => {
    const csvData = [];

    argentinaLayers({
      operation: {},
      data: {},
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([]);
  });

  test('When composites inside  operation is empty', () => {
    const csvData = [];

    argentinaLayers({
      operation: {
        name: 'argentinaLayers',
        parsed: 'overhead',
        composites: [],
      },
      data: {},
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([]);
  });

  test('When arg_otbn_area have more than 5 category ', () => {
    const csvData = [];

    argentinaLayers({
      operation: {
        name: 'argentinaLayers',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'arg_otbn_area',
            type: 'category',
            label: 'Argentina OTBN',
          },
        ],
      },
      data: {
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3, "cat4": 4, "cat5": 5  }',
      },
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['Argentina OTBN', 'cat5', 5, 33.33333333333333],
      ['Argentina OTBN', 'cat4', 4, 26.666666666666668],
      ['Argentina OTBN', 'cat3', 3, 20],
      ['Argentina OTBN', 'cat2', 2, 13.333333333333334],
      ['Argentina OTBN', 'cat1', 1, 6.666666666666667],
    ]);
  });

  test('When arg_otbn_area have more than 5 category  and limit to 3', () => {
    const csvData = [];

    argentinaLayers({
      operation: {
        name: 'argentinaLayers',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'arg_otbn_area',
            type: 'category',
            label: 'Argentina OTBN',
            limit: 3,
          },
        ],
      },
      data: {
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3, "cat4": 4, "cat5": 5  }',
      },
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['Argentina OTBN', 'cat5', 5, 33.33333333333333],
      ['Argentina OTBN', 'cat4', 4, 26.666666666666668],
      ['Argentina OTBN', 'Other', 6, 40],
    ]);
  });

  test('When pass data for more than one layer', () => {
    const csvData = [];

    argentinaLayers({
      operation: {
        name: 'argentinaLayers',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'arg_otbn_area',
            type: 'category',
            label: 'Argentina OTBN',
            limit: 2,
          },
          {
            attribute: 'protected_areas_by_category_area',
            type: 'category',
            label: 'Argentina Protected Areas',
          },
          {
            attribute: 'landmark_by_category_area',
            type: 'category',
            label: 'Argentina Indigenous Territories',
          },
        ],
      },
      data: {
        total_area: 5,
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3 }',
        protected_areas_by_category_area: '{ "cat1": 1, "cat2": 2 }',
        landmark_by_category_area: '{ "Not Reported": 1 }',
      },
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['Argentina OTBN', 'cat3', 3, 50],
      ['Argentina OTBN', 'Other', 3, 50],
      ['Argentina Protected Areas', 'cat2', 2, 66.66666666666666],
      ['Argentina Protected Areas', 'cat1', 1, 33.33333333333333],
      ['Argentina Indigenous Territories', '', 1, 20],
    ]);
  });

  test('When pass data for more than one layer', () => {
    const csvData = [];

    argentinaLayers({
      operation: {
        name: 'argentinaLayers',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'arg_otbn_area',
            type: 'category',
            label: 'Argentina OTBN',
            limit: 2,
          },
          {
            attribute: 'protected_areas_by_category_area',
            type: 'category',
            label: 'Argentina Protected Areas',
          },
          {
            attribute: 'landmark_by_category_area',
            type: 'category',
            label: 'Argentina Indigenous Territories',
          },
        ],
      },
      data: {
        total_area: 5,
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3 }',
        protected_areas_by_category_area: '{ "cat1": 1, "cat2": 2 }',
        landmark_by_category_area: '{ "Not Reported": 1 }',
      },
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['Argentina OTBN', 'cat3', 3, 50],
      ['Argentina OTBN', 'Other', 3, 50],
      ['Argentina Protected Areas', 'cat2', 2, 66.66666666666666],
      ['Argentina Protected Areas', 'cat1', 1, 33.33333333333333],
      ['Argentina Indigenous Territories', '', 1, 20],
    ]);
  });

  test('When receive data inside dataRow parameter', () => {
    const csvData = [];

    argentinaLayers({
      operation: {
        name: 'argentinaLayers',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'arg_otbn_area',
            type: 'category',
            label: 'Argentina OTBN',
            limit: 3,
          },
        ],
      },
      data: {
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3, "cat4": 4, "cat5": 5  }',
      },
      dataRow: ['test', 'wri', 1],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['test', 'wri', 1, 'Argentina OTBN', 'cat5', 5, 33.33333333333333],
      ['test', 'wri', 1, 'Argentina OTBN', 'cat4', 4, 26.666666666666668],
      ['test', 'wri', 1, 'Argentina OTBN', 'Other', 6, 40],
    ]);
  });
});
