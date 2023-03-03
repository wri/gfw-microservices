import { ConvertObject2CSV } from './convert.object.2.csv';

describe('ConvertObject2CSV', () => {
  test('Should convert array into a string', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform([[1, 2, 3], [4, 5, 6]], '', (err, data) => {
      expect(data).toEqual('1,2,3\n4,5,6\n');
    });
  });

  test('Should remove lines that do not have the same length of header', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform([[1, 2, 3], [4, 5]], '', (err, data) => {
      expect(data).toEqual('1,2,3\n');
    });
  });

  test('Should remove lines that do not have the same length of header', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(undefined, '', (err, data) => {
      expect(data).toEqual('');
    });
  });

  test('Should remove all rows and return empty', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform([[1, 2], [4, 5]], '', (err, data) => {
      expect(data).toEqual('');
    });
  });

  test('Should convert array to string', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform([1,2,3], '', (err, data) => {
      expect(data).toEqual('1,2,3\n');
    });
  });
});
