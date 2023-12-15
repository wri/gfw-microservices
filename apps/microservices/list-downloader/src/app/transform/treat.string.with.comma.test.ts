import { TreatStringWithComma } from './treat.string.with.comma';

describe('SumValue', () => {
  test('Should work when receive undefined', () => {
    const treat = new TreatStringWithComma();
    treat._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return not break when receive an empty array', () => {
    const treat = new TreatStringWithComma();
    treat._transform([], '', (err, data) => {
      expect(data).toEqual([]);
    });
  });

  test('Should not change input when receive an array of numbers', () => {
    const treat = new TreatStringWithComma();
    treat._transform([4, 5], '', (err, data) => {
      expect(data).toEqual([4, 5]);
    });
  });

  test('Should not change input when receive an array within a number array', () => {
    const treat = new TreatStringWithComma();
    treat._transform(
      [
        [4, 5],
        [5, 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual([
          [4, 5],
          [5, 6],
        ]);
      }
    );
  });

  test('Should not change input when receive an array of strings without comma', () => {
    const treat = new TreatStringWithComma();
    treat._transform(['test', 'wri'], '', (err, data) => {
      expect(data).toEqual(['test', 'wri']);
    });
  });

  test('Should not change input when receive an array within a string array without comma', () => {
    const treat = new TreatStringWithComma();
    treat._transform(
      [
        ['test', 'wri'],
        ['blue', 'coding'],
      ],
      '',
      (err, data) => {
        expect(data).toEqual([
          ['test', 'wri'],
          ['blue', 'coding'],
        ]);
      }
    );
  });

  test('Should not change input when receive an array of strings comma', () => {
    const treat = new TreatStringWithComma();
    treat._transform(['cat1, cat2', 'wri'], '', (err, data) => {
      expect(data).toEqual(['"cat1, cat2"', 'wri']);
    });
  });

  test('Should not change input when receive an array within a string array comma', () => {
    const treat = new TreatStringWithComma();
    treat._transform(
      [
        ['cat1, cat2', 'wri'],
        ['blue', 'coding'],
      ],
      '',
      (err, data) => {
        expect(data).toEqual([
          ['"cat1, cat2"', 'wri'],
          ['blue', 'coding'],
        ]);
      }
    );
  });
});
