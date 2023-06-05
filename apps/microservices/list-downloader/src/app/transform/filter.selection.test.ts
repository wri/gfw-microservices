import { FilterSelection } from './filter.selection';

describe('FilterObject', () => {
  test('Should filter a object based on a array', () => {
    const filterSelection = new FilterSelection(undefined);
    filterSelection._transform(
      {
        name: 'test',
        status: 'test',
        location_id: 1,
      },
      '',
      (err, data) => {
        expect(data).toEqual(undefined);
      }
    );
  });

  test('Should return the locations with specific id', () => {
    const filterSelection = new FilterSelection([1, 2]);
    filterSelection._transform(
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

  test('Should return undefined if the id is not in the list', () => {
    const filterSelection = new FilterSelection([1, 2]);
    filterSelection._transform(
      {
        name1: 'test',
        status1: 'test',
        location_id: 3,
      },
      '',
      (err, data) => {
        expect(data).toEqual(undefined);
      }
    );
  });

  test('Should return undefined when receive undefined as input data', () => {
    const filterSelection = new FilterSelection([1, 2]);
    filterSelection._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });
});
