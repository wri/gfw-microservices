import { ReplaceSpace2Underscore } from './replace.space.2.underscore';

describe('ReplaceSpace2Underscore', () => {
  test('when receive an empty object', () => {
    const replaceSpace2Underscore = new ReplaceSpace2Underscore();
    replaceSpace2Underscore._transform({}, '', (err, data) => {
      expect(data).toEqual({});
    });
  });

  test('When receive an undefined', () => {
    const replaceSpace2Underscore = new ReplaceSpace2Underscore();
    replaceSpace2Underscore._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('When receive an object has keys without space', () => {
    const replaceSpace2Underscore = new ReplaceSpace2Underscore();
    replaceSpace2Underscore._transform(
      {
        name: 'test',
        status: 'test',
        location_id: 1,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          name: 'test',
          status: 'test',
          location_id: 1,
        });
      }
    );
  });

  test('When receive an object has space on some keys', () => {
    const replaceSpace2Underscore = new ReplaceSpace2Underscore();
    replaceSpace2Underscore._transform(
      {
        name: 'test',
        'Company Id': 'test',
        'location id': 1,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          name: 'test',
          Company_Id: 'test',
          location_id: 1,
        });
      }
    );
  });
});
