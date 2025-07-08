import { ConvertObject2CSV } from './convert.object.2.csv';

describe('ConvertObject2CSV', () => {
  test('Should convert array into a string', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('1,2,3\n4,5,6\n');
      }
    );
  });

  test('Should remove lines that do not have the same length of header', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        [1, 2, 3],
        [4, 5],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('1,2,3\n');
      }
    );
  });

  test('Should remove lines that do not have the same length of header', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(undefined, '', (err, data) => {
      expect(data).toEqual('');
    });
  });

  test('Should remove all rows and return empty', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        [1, 2],
        [4, 5],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('');
      }
    );
  });

  test('Should convert array to string', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform([1, 2, 3], '', (err, data) => {
      expect(data).toEqual('1,2,3\n');
    });
  });

  test('Should quote string values that contain commas', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        ['hello', 'world, with comma', 3],
        ['test', 'simple', 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('hello,"world, with comma",3\ntest,simple,6\n');
      }
    );
  });

  test('Should quote string values that contain double quotes', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        ['hello', 'world "with quotes"', 3],
        ['test', 'simple', 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('hello,"world ""with quotes""",3\ntest,simple,6\n');
      }
    );
  });

  test('Should quote string values that contain newlines', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        ['hello', 'world\nwith newline', 3],
        ['test', 'simple', 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('hello,"world\nwith newline",3\ntest,simple,6\n');
      }
    );
  });

  test('Should handle mixed data types including strings', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        [1, 'string value', 3],
        ['another string', 5, 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('1,"string value",3\n"another string",5,6\n');
      }
    );
  });

  test('Should handle null and undefined values', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        [1, null, 3],
        [undefined, 5, 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('1,,3\n,5,6\n');
      }
    );
  });

  test('Should quote string values that contain spaces', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        ['hello', 'world with spaces', 3],
        ['test', 'simple', 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('hello,"world with spaces",3\ntest,simple,6\n');
      }
    );
  });

  test('Should quote string values that contain multiple commas and spaces', () => {
    const convertObject2CSV = new ConvertObject2CSV(['a', 'b', 'c']);
    convertObject2CSV._transform(
      [
        ['hello', 'world, with spaces and commas', 3],
        ['test', 'simple', 6],
      ],
      '',
      (err, data) => {
        expect(data).toEqual('hello,"world, with spaces and commas",3\ntest,simple,6\n');
      }
    );
  });
});
