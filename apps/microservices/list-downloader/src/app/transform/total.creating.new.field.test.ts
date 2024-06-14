import { TotalCreatingNewField } from './total.creating.new.field';

describe('Total Creating New Field', () => {
  test('Should return undefined when list to filter de object is undefined', () => {
    const total = new TotalCreatingNewField(undefined);
    total._transform({}, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return undefined when receive undefined as data', () => {
    const total = new TotalCreatingNewField([
      {
        input: 'yearly',
        output: 'total',
      },
    ]);
    total._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return the sum of all values', () => {
    const total = new TotalCreatingNewField([
      {
        input: 'yearly',
        output: 'total',
      },
    ]);
    total._transform(
      {
        yearly: '{"2020": 1, "2021": 2, "2023": 2}',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly: '{"2020": 1, "2021": 2, "2023": 2}', total: 5 });
      }
    );
  });

  test('Should return the sum of all values', () => {
    const total = new TotalCreatingNewField([
      {
        input: 'yearly',
        output: 'total',
      },
    ]);
    total._transform(
      {
        yearly: '{"2019": 0.25, "2020": 0, "2021": 0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly: '{"2019": 0.25, "2020": 0, "2021": 0}', total: 0.25 });
      }
    );
  });

  test('Should work when dont receive a valid json', () => {
    const total = new TotalCreatingNewField([
      {
        input: 'yearly',
        output: 'total',
      },
    ]);
    total._transform(
      {
        yearly: '',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly: '' });
      }
    );
  });

  test('Should work when receive an input field that dont exist on the object', () => {
    const total = new TotalCreatingNewField([
      {
        input: 'yearly',
        output: 'total',
      },
    ]);
    total._transform(
      {
        yearly1: '{"2019": 0.25, "2020": 0, "2021": 0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly1: '{"2019": 0.25, "2020": 0, "2021": 0}' });
      }
    );
  });
});
