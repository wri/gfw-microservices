import * as sql from 'mssql';

export const parameters = {
  location: { field: 'location', type: sql.VarChar(255), value: '' },
  expirationDate: {
    field: 'expirationDate',
    type: sql.DateTime,
    value: '',
  },
  listId: { field: 'listId', type: sql.Int, value: '' },
  analysisId: { field: 'analysisId', type: sql.VarChar(10), value: '' },
};
