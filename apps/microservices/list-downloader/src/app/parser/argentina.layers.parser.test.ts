import { argentinaLayers } from './argentina.layers.parser';

describe('Argentina Layers Parser', () => {
  it('should all input parameters is empty', () => {
    const csvData = [];

    argentinaLayers({
      operation: {},
      data: {},
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([]);
  });

  it('should composites inside  operation is empty', () => {
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

  it('should layer has more than 5 category ', () => {
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
        country_area: '{ "ARG": 15 }',
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3, "cat4": 4, "cat5": 5  }',
      },
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['Argentina OTBN', 'cat1', 1, 6.666666666666667],
      ['Argentina OTBN', 'cat2', 2, 13.333333333333334],
      ['Argentina OTBN', 'cat3', 3, 20],
      ['Argentina OTBN', 'cat4', 4, 26.666666666666668],
      ['Argentina OTBN', 'cat5', 5, 33.33333333333333],
    ]);
  });

  it('should arg_otbn_area have more than 5 category  and limit to 3', () => {
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
        country_area: '{ "ARG": 15 }',
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3, "cat4": 4, "cat5": 5  }',
      },
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['Argentina OTBN', 'cat1', 1, 6.666666666666667],
      ['Argentina OTBN', 'cat2', 2, 13.333333333333334],
      ['Argentina OTBN', 'Other', 12, 80],
    ]);
  });

  it('should pass data for more than one layer', () => {
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
            type: 'country',
            label: 'Argentina Protected Areas',
          },
          {
            attribute: 'landmark_by_category_area',
            type: 'country',
            label: 'Argentina Indigenous Territories',
          },
        ],
      },
      data: {
        country_area: '{ "ARG": 5 }',
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3 }',
        protected_areas_by_category_area: '{ "cat1": 1, "cat2": 2 }',
        landmark_by_category_area: '{ "Not Reported": 1 }',
      },
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['Argentina OTBN', 'cat1', 1, 20],
      ['Argentina OTBN', 'Other', 5, 100],
      ['Argentina Protected Areas', 'cat1', 1, 20],
      ['Argentina Protected Areas', 'cat2', 2, 40],
      ['Argentina Protected Areas', 'Non-Overlap', 2, 40],
      ['Argentina Indigenous Territories', 'Overlap', 1, 20],
      ['Argentina Indigenous Territories', 'Non-Overlap', 4, 80],
    ]);
  });

  it('should pass data for more than one layer', () => {
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
            type: 'country',
            label: 'Argentina Protected Areas',
          },
          {
            attribute: 'landmark_by_category_area',
            type: 'country',
            label: 'Argentina Indigenous Territories',
          },
        ],
      },
      data: {
        country_area: '{ "ARG": 5 }',
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3 }',
        protected_areas_by_category_area: '{ "cat1": 1, "cat2": 2 }',
        landmark_by_category_area: '{ "Not Reported": 1 }',
      },
      dataRow: [],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['Argentina OTBN', 'cat1', 1, 20],
      ['Argentina OTBN', 'Other', 5, 100],
      ['Argentina Protected Areas', 'cat1', 1, 20],
      ['Argentina Protected Areas', 'cat2', 2, 40],
      ['Argentina Protected Areas', 'Non-Overlap', 2, 40],
      ['Argentina Indigenous Territories', 'Overlap', 1, 20],
      ['Argentina Indigenous Territories', 'Non-Overlap', 4, 80],
    ]);
  });

  it('should receive data inside dataRow parameter', () => {
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
        country_area: '{ "ARG": 15 }',
        arg_otbn_area: '{ "cat1": 1, "cat2": 2, "cat3": 3, "cat4": 4, "cat5": 5  }',
      },
      dataRow: ['test', 'wri', 1],
      csvData,
    });
    expect(csvData).toStrictEqual([
      ['test', 'wri', 1, 'Argentina OTBN', 'cat1', 1, 6.666666666666667],
      ['test', 'wri', 1, 'Argentina OTBN', 'cat2', 2, 13.333333333333334],
      ['test', 'wri', 1, 'Argentina OTBN', 'Other', 12, 80],
    ]);
  });

  it('should receive all data equals to 0', () => {
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
        arg_otbn_area: '{ "cat1": 0, "cat2": 0, "cat3": 0, "cat4": 0, "cat5": 0  }',
        country_area: '{}',
        protected_areas_by_category_area: '{ "cat1": 1, "cat2": 2 }',
        landmark_by_category_area: '{ "Not Reported": 0 }',
      },
      dataRow: ['wri', 1],
      csvData,
    });

    expect(csvData).toStrictEqual([]);
  });

  it('should return data from ARG obj when fields are in country format', () => {
    const csvData = [];

    argentinaLayers({
      operation: {
        name: 'argentinaLayers',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'protected_areas_by_category_area',
            type: 'country',
            label: 'Argentina Protected Areas',
          },
          {
            attribute: 'landmark_by_category_area',
            type: 'country',
            label: 'Argentina Indigenous Territories',
          },
        ],
      },
      data: {
        protected_areas_by_category_area:
          '{ "ARG": { "cat1": 10, "cat2": 35, "cat3": 5 }, "COL": { "cat1": 1, "cat2": 2, "cat3": 3 } }',
        landmark_by_category_area:
          '{ "ARG": { "dog1": 30, "dog2": 5, "dog3": 15 }, "COL": { "dog1": 1, "dog2": 2, "dog3": 3 } }',
        country_area: '{ "ARG": 50 }',
      },
      dataRow: ['wri', 1],
      csvData,
    });

    expect(csvData).toStrictEqual([
      ['wri', 1, 'Argentina Protected Areas', 'cat1', 10, 20],
      ['wri', 1, 'Argentina Protected Areas', 'cat2', 35, 70],
      ['wri', 1, 'Argentina Protected Areas', 'cat3', 5, 10],
      ['wri', 1, 'Argentina Indigenous Territories', 'dog1', 30, 60],
      ['wri', 1, 'Argentina Indigenous Territories', 'dog2', 5, 10],
      ['wri', 1, 'Argentina Indigenous Territories', 'dog3', 15, 30],
    ]);
  });

  it('should use the composite nonOverlapLabel for the non-overlap row when provided', () => {
    const csvData = [];

    argentinaLayers({
      operation: {
        name: 'argentinaLayers',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'protected_areas_by_category_area',
            type: 'country',
            label: 'Argentina Protected Areas',
            nonOverlapLabel: 'Non-overlap with Protected Areas',
          },
        ],
      },
      data: {
        country_area: '{ "ARG": 5 }',
        protected_areas_by_category_area: '{ "cat1": 1, "cat2": 2 }',
      },
      dataRow: [],
      csvData,
    });

    expect(csvData).toStrictEqual([
      ['Argentina Protected Areas', 'cat1', 1, 20],
      ['Argentina Protected Areas', 'cat2', 2, 40],
      ['Argentina Protected Areas', 'Non-overlap with Protected Areas', 2, 40],
    ]);
  });
});
