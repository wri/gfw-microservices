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

  test('Should not break when receive empty object and also return an empty object', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform({}, '', (err, data) => {
      expect(data).toEqual({});
    });
  });

  test('Should not break when receive undefined and also return undefined', () => {
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

  test('Should discretize 0 to Low', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform(
      {
        'Protected Areas': 0,
        'THREATS - Fire': 0,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          'Protected Areas': 'Low',
          'THREATS - Fire': 'Low',
        });
      }
    );
  });

  test('Should discretize 1 to Medium', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform(
      {
        'THREATS - Overall': 1,
        'VALUES - Forest': 1,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          'THREATS - Overall': 'Medium',
          'VALUES - Forest': 'Medium',
        });
      }
    );
  });

  test('Should discretize 2 to High', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform(
      {
        'VALUES - Peat': 2,
        'VALUES - Protected Areas': 2,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          'VALUES - Peat': 'High',
          'VALUES - Protected Areas': 'High',
        });
      }
    );
  });

  test('Should not convert when receive a number that is not mapped like 3', () => {
    const filterObject = new DiscretizeData();
    filterObject._transform(
      {
        'VALUES - Overall': 3,
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          'VALUES - Overall': 3,
        });
      }
    );
  });
});
