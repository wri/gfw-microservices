import { DiscretizeData } from './discretize.data';

describe('DiscretizeData', () => {
  test('Should not convert string values', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform(
      {
        name: 'test',
        status: 'test',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ name: 'test', status: 'test' });
      }
    );
  });

  test('Should return empty object', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform({}, '', (err, data) => {
      expect(data).toEqual({});
    });
  });

  test('Should return undefined', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should discretize an input array considering values 0,1,2', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform(
      {
        name: 'test',
        'Protected Areas': 0,
        'THREATS - Fire': 0,
        'THREATS - Overall': 1,
        'VALUES - Forest': 1,
        'VALUES - Peat': 2,
        'VALUES - Protected Areas': 2,
        'VALUES - Overall': 3,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          'Protected Areas': 'Low',
          'THREATS - Fire': 'Low',
          'THREATS - Overall': 'Medium',
          'VALUES - Forest': 'Medium',
          'VALUES - Overall': 3,
          'VALUES - Peat': 'High',
          'VALUES - Protected Areas': 'High',
          name: 'test',
        });
      }
    );
  });
});
