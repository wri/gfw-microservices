import {
  formatPct,
  cloneRow,
  prettifyNum,
  validatePct,
  parseListData,
  parseListTotals,
} from './functions';

describe('formatPct', () => {
  test('Should format 0.55555 to 0.56', () => {
    expect(formatPct(0.55555)).toBe('0.56');
  });

  test('Should accept undefined and return undefined', () => {
    expect(formatPct(undefined)).toBe(undefined);
  });

  test('Should accept "0.5555"  and return 0.56', () => {
    expect(formatPct('0.5555')).toBe('0.56');
  });

  test('Should accept ""  and return ', () => {
    expect(formatPct('')).toBe('NaN');
  });
});

describe('cloneRow', () => {
  test('Should return a cloned array of numbers', () => {
    const row = [1, 2, 3];
    expect(cloneRow(row)).toEqual([1, 2, 3]);
  });

  test('Should return a cloned array of objects', () => {
    const row = [
      { x: 1, y: 2, z: 3 },
      { x: 2, y: 3, z: 4 },
    ];
    expect(cloneRow(row)).toEqual([
      { x: 1, y: 2, z: 3 },
      { x: 2, y: 3, z: 4 },
    ]);
  });

  test('Should return empty array when receive undefined', () => {
    const row = undefined;
    expect(cloneRow(row)).toEqual([]);
  });

  test('Should return empty array when receive string', () => {
    const row = 'test';
    expect(cloneRow(row)).toEqual([]);
  });

  test('Should return empty array when receive number', () => {
    const row = 10;
    expect(cloneRow(row)).toEqual([]);
  });
});

describe('prettifyNum', () => {
  test('Should return number 123,456 formatted when receive 123,456', () => {
    expect(prettifyNum(123456)).toEqual('123,456');
  });

  test('Should return undefined when receive undefined', () => {
    expect(prettifyNum(undefined)).toEqual(undefined);
  });

  test('Should return number "" formatted when receive ""', () => {
    expect(prettifyNum('')).toEqual('');
  });

  test('Should return number 123 formatted when receive 123', () => {
    expect(prettifyNum(123)).toEqual('123');
  });

  test('Should return number "123456"  formatted when receive "123,456"', () => {
    expect(prettifyNum('123456')).toEqual('123,456');
  });
});

describe('validatePct', () => {
  test('Should receive 100 and return 100', () => {
    expect(validatePct(100)).toEqual(100);
  });

  test('Should receive 140 and return 100', () => {
    expect(validatePct(140)).toEqual(100);
  });

  test('Should accept NaN and return 0', () => {
    expect(validatePct(NaN)).toEqual(0);
  });

  test('Should accept Infinity and return 100', () => {
    expect(validatePct(Infinity)).toEqual(100);
  });

  test('Should accept -10 and return 0', () => {
    expect(validatePct(-10)).toEqual(0);
  });
});

describe('parseListData', () => {
  test('Should accept -10 and return 0', () => {
    const listLevelAnalysis = [
      {
        tree_cover_loss_brazil_biomes_yearly:
          '{"Cerrado": {"2000": 1,"2001": 2,"2002": 3,"2003": 4,"2004": 5,"2005": 6,"2006": 7,"2007": 6,"2008": 5,"2009": 4,"2010": 3,"2011": 2}, "Pantanal": {"2000": 1,"2001": 2,"2002": 3,"2003": 4,"2004": 5,"2005": 6,"2006": 7,"2007": 6,"2008": 5,"2009": 4,"2010": 3,"2011": 2}}',
      },
    ];
    expect(
      parseListData('tree_cover_loss_brazil_biomes_yearly', listLevelAnalysis)
    ).toEqual(96);
  });

  test('Should receive a parameter with empty biome', () => {
    const listLevelAnalysis = [
      {
        tree_cover_loss_brazil_biomes_yearly: '{}',
      },
    ];
    expect(
      parseListData('tree_cover_loss_brazil_biomes_yearly', listLevelAnalysis)
    ).toEqual(0);
  });

  test('Should handle empty list level analysis', () => {
    const listLevelAnalysis = [];
    expect(
      parseListData('tree_cover_loss_brazil_biomes_yearly', listLevelAnalysis)
    ).toEqual(0);
  });

  test('Should accept empty json and return 0', () => {
    const listLevelAnalysis = [
      {
        tree_cover_loss_brazil_biomes_yearly: '{}',
      },
    ];
    expect(
      parseListData('tree_cover_loss_brazil_biomes_yearly', listLevelAnalysis)
    ).toEqual(0);
  });

  test('Should accept a number 58 and return 58', () => {
    const listLevelAnalysis = [
      {
        test: 58,
      },
    ];
    expect(parseListData('test', listLevelAnalysis)).toEqual(58);
  });

  test('Should accept json key is the year and return 48', () => {
    const listLevelAnalysis = [
      {
        test: '{"2000": 1,"2001": 2,"2002": 3,"2003": 4,"2004": 5,"2005": 6,"2006": 7,"2007": 6,"2008": 5,"2009": 4,"2010": 3,"2011": 2}',
      },
    ];
    expect(parseListData('test', listLevelAnalysis)).toEqual(48);
  });

  test('Should accept array of results and return 9', () => {
    const listLevelAnalysis = [
      {
        test: '[{"result":1},{"result":2},{"result":3},{"result":2},{"result":1}]',
      },
    ];
    expect(parseListData('test', listLevelAnalysis)).toEqual(9);
  });
});

describe('parseListTotals', () => {
  test('Should receive listAnalysis undefined and receive 0', () => {
    expect(parseListTotals('test', undefined)).toBe(0);
  });

  test('Should parseListTotals from 0.55555 to 0.56', () => {
    expect(parseListTotals('test', { test: 0.55555 })).toBe(0.56);
  });

  test('Should receive listAnalysis key as undefined and should return 0', () => {
    expect(parseListTotals('test', { test: undefined })).toBe(0);
  });
});
