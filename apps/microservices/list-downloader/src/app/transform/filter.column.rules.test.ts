import { FilterColumnRules } from './filter.column.rules';

describe('FilterColumnRules', () => {
  test('Should unset Analysis Radius if both Analysis Radius and Analysis Area have values', (done) => {
    const filterColumnRule = new FilterColumnRules();
    const input = {
      'Analysis Radius': '10',
      'Analysis Area': '20',
      'Other Field': 'value'
    };
    const expectedOutput = {
      'Analysis Area': '20',
      'Analysis Radius': '',
      'Other Field': 'value'
    };

    filterColumnRule._transform(input, '', (err, data) => {
      expect(data).toEqual(expectedOutput);
      done();
    });
  });

  test('Should not modify the chunk if only one of Analysis Radius or Analysis Area has a value', (done) => {
    const filterColumnRule = new FilterColumnRules();
    const input = {
      'Analysis Radius': '10',
      'Analysis Area': '',
      'Other Field': 'value'
    };
    const expectedOutput = { ...input };

    filterColumnRule._transform(input, '', (err, data) => {
      expect(data).toEqual(expectedOutput);
      done();
    });
  });

  test('Should not modify the chunk if neither Analysis Radius nor Analysis Area has a value', (done) => {
    const filterColumnRule = new FilterColumnRules();
    const input = {
      'Analysis Radius': '',
      'Analysis Area': '',
      'Other Field': 'value'
    };
    const expectedOutput = { ...input };

    filterColumnRule._transform(input, '', (err, data) => {
      expect(data).toEqual(expectedOutput);
      done();
    });
  });

  test('Should not modify the chunk if neither Analysis Radius nor Analysis Area fields are present', (done) => {
    const filterColumnRule = new FilterColumnRules();
    const input = {
      'Other Field': 'value'
    };
    const expectedOutput = { ...input };

    filterColumnRule._transform(input, '', (err, data) => {
      expect(data).toEqual(expectedOutput);
      done();
    });
  });
});
