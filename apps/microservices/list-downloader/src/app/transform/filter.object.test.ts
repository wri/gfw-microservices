import { FilterObject } from './filter.object';

describe('FilterObject', () => {
  test('Should filter a object based on a array', () => {
    const filterObject = new FilterObject(['name', 'status']);
    filterObject._transform({
      name: 'test',
      status: 'test',
      id: 1,
    }, '', (err, data) => {
      expect(data).toEqual({"name": "test", "status": "test"}
      );
    });
  });

  test('Should return undefined when receive a undefined list to filter', () => {
    const filterObject = new FilterObject(undefined);
    filterObject._transform({
      name: 'test',
      status: 'test',
      id: 1,
    }, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test("Should return empty when the field name didn't exist into the object", () => {
    const filterObject = new FilterObject(['name', 'status']);
    filterObject._transform({
      name1: 'test',
      status1: 'test',
      id: 1,
    }, '', (err, data) => {
      expect(data).toEqual({}
      );
    });
  });

  test("Should return undefined when the object is undefined", () => {
    const filterObject = new FilterObject(['name', 'status']);
    filterObject._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined
      );
    });
  });
});

