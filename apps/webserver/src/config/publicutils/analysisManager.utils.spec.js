const { formatNumber } = require('./analysisManager.utils');

describe('Format Number Array', () => {
  test('when the input is undefined', () => {
    const data = formatNumber(undefined);
    expect(data).toEqual(undefined);
  });

  test('when the input is empty', () => {
    const data = formatNumber([]);
    expect(data).toEqual([]);
  });

  test('when the input is int', () => {
    const data = formatNumber([2020]);
    expect(data).toEqual([2020]);
  });

  test('when the input is float', () => {
    const data = formatNumber([100.12678]);
    expect(data).toEqual([100.13]);
  });

  test('when the input is string', () => {
    const data = formatNumber(['100.12678']);
    expect(data).toEqual(['100.12678']);
  });

  test('when the input is an array of [string, float, int]', () => {
    const data = formatNumber(['100.12678', 100.12678, 100]);
    expect(data).toEqual(['100.12678', 100.13, 100]);
  });
});

describe('Format Number Object', () => {
  test('when the input is empty', () => {
    const data = formatNumber({});
    expect(data).toEqual({});
  });

  test('when the input value hast type int', () => {
    const data = formatNumber({ year: 2020 });
    expect(data).toEqual({ year: 2020 });
  });

  test('when the input value hast type float', () => {
    const data = formatNumber({ measure: 100.12678 });
    expect(data).toEqual({ measure: 100.13 });
  });

  test('when the input is string', () => {
    const data = formatNumber({ test: '100.12678' });
    expect(data).toEqual({ test: '100.12678' });
  });

  test('when the input is an array of [string, float, int]', () => {
    const data = formatNumber({ price: '100.12678', test: 100.12678, amount: 100 });
    expect(data).toEqual({ price: '100.12678', test: 100.13, amount: 100 });
  });
});
