import { ConvertObject2String } from './convert.object.2.string';

describe('ConvertObject2CSV', () => {
  test('Should convert object to string', () => {
    const geojson = {
      test: 'test',
      total: 20,
    };
    const convertObject2CSV = new ConvertObject2String();
    convertObject2CSV._transform(geojson, '', (err, data) => {
      expect(data).toEqual('{"test":"test","total":20}');
    });
  });

  test('Should return empty json if receive empty json ', () => {
    const geojson = {};
    const convertObject2CSV = new ConvertObject2String();
    convertObject2CSV._transform(geojson, '', (err, data) => {
      expect(data).toEqual('{}');
    });
  });

  test('Should return undefined if receive undefined', () => {
    const geojson = undefined;
    const convertObject2CSV = new ConvertObject2String();
    convertObject2CSV._transform(geojson, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });
});
