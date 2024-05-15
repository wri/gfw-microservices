import * as sql from 'mssql';

export type InputDataType = {
  location?: string;
  expirationDate?: Date;
  bundleCreationTime?: Date;
  listId?: number;
  analysisId?: string;
};

export const parameters = {
  location: { field: 'location', type: sql.VarChar(2047), value: '' },
  expirationDate: {
    field: 'expirationDate',
    type: sql.DateTime,
    value: '',
  },
  bundleCreationTime: {
    field: 'bundleCreationTime',
    type: sql.DateTime,
    value: '',
  },
  listId: { field: 'listId', type: sql.Int, value: '' },
  analysisId: { field: 'analysisId', type: sql.VarChar(30), value: '' },
};
