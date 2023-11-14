import { FormatNumber } from './format.number';

describe('Format Number Array', () => {
  test('when the input is undefined', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('when the input is empty', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform([], '', (err, data) => {
      expect(data).toEqual([]);
    });
  });

  test('when the input is int', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform([2020], '', (err, data) => {
      expect(data).toEqual([2020]);
    });
  });

  test('when the input is float', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform([100.12678], '', (err, data) => {
      expect(data).toEqual([100.13]);
    });
  });

  test('when the input is Array of Array', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform([[100.12678], [28.94973942508648]], '', (err, data) => {
      expect(data).toEqual([[100.13], [28.95]]);
    });
  });

  test('when the input is string', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform(['100.12678'], '', (err, data) => {
      expect(data).toEqual(['100.12678']);
    });
  });

  test('when the input is an array of [string, float, int]', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform(['100.12678', 100.12678, 100], '', (err, data) => {
      expect(data).toEqual(['100.12678', 100.13, 100]);
    });
  });
});

describe('Format Number Object', () => {
  test('when the input is empty', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform({}, '', (err, data) => {
      expect(data).toEqual({});
    });
  });

  test('when the input value hast type int', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform({ year: 2020 }, '', (err, data) => {
      expect(data).toEqual({ year: 2020 });
    });
  });

  test('when the input value hast type float', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform({ measure: 100.12678 }, '', (err, data) => {
      expect(data).toEqual({ measure: 100.13 });
    });
  });

  test('when the input is string', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform({ test: '100.12678' }, '', (err, data) => {
      expect(data).toEqual({ test: '100.12678' });
    });
  });

  test('when the input is undefined', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('when the input is an array of [string, float, int]', () => {
    const formatNumber = new FormatNumber();
    formatNumber._transform(
      { price: '100.12678', test: 100.12678, amount: 100 },
      '',
      (err, data) => {
        expect(data).toEqual({ price: '100.12678', test: 100.13, amount: 100 });
      }
    );
  });
});
