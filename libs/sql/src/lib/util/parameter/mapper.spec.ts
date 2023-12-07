import { toSqlParameter } from './mapper';
import * as sql from 'mssql';

describe('Parameter Mapper', () => {
  it(`when the input is empty`, () => {
    const input = {};
    expect(toSqlParameter(input)).toStrictEqual([]);
  });

  it(`when the input is undefined`, () => {
    const input = undefined;
    expect(toSqlParameter(input)).toStrictEqual([]);
  });

  it(`when the input is object with [location, expirationDate, listId, analysisId]`, () => {
    const input = {
      location: 'http://www.google.com',
      expirationDate: new Date('2021-01-01'),
      listId: 1,
      analysisId: 'AFI',
    };
    expect(toSqlParameter(input)).toStrictEqual([
      {
        field: 'location',
        type: sql.VarChar(2047),
        value: 'http://www.google.com',
      },
      {
        field: 'expirationDate',
        type: sql.DateTime,
        value: new Date('2021-01-01'),
      },
      {
        field: 'listId',
        type: sql.Int,
        value: 1,
      },
      {
        field: 'analysisId',
        type: sql.VarChar(30),
        value: 'AFI',
      },
    ]);
  });

  it(`when the input is object with [location, expirationDate, listId, analysisId] and location is null`, () => {
    const input = {
      location: null,
      expirationDate: new Date('2021-01-01'),
      listId: 1,
      analysisId: 'AFI',
    };
    expect(toSqlParameter(input)).toStrictEqual([
      {
        field: 'location',
        type: sql.VarChar(2047),
        value: null,
      },
      {
        field: 'expirationDate',
        type: sql.DateTime,
        value: new Date('2021-01-01'),
      },
      {
        field: 'listId',
        type: sql.Int,
        value: 1,
      },
      {
        field: 'analysisId',
        type: sql.VarChar(30),
        value: 'AFI',
      },
    ]);
  });
});
