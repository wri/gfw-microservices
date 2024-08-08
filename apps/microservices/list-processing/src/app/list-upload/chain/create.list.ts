import { SQLUtils } from '@wri-monorepos/sql';
import { AbstractHandler, ChainType } from './types';
import { CreateListResult } from '@wri-monorepos/geo';
import * as sql from 'mssql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';

const sqlConfig = {
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOSTNAME,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  port: parseInt(process.env.MSSQL_PORT, 10),
  options: {
    //encrypt: true, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const insertListInListTable = async (
  connection: SQLUtils,
  userId: number,
  templateId: number,
  listName: string,
  listTable: string,
  analysisTable: string,
  listStatusId: number,
  locationClassification: string,
  customAttributeNames: string,
  customAttributeTypes: string,
  gfwListId: number = null
) => {
  try {
    const parameters = [
      { field: 'user_id', type: sql.Int, value: userId },
      { field: 'template_id', type: sql.Int, value: templateId },
      { field: 'list_name', type: sql.NVarChar(150), value: listName },
      {
        field: 'list_table_name',
        type: sql.NVarChar(150),
        value: listTable,
      },
      {
        field: 'list_analysis_table_name',
        type: sql.NVarChar(150),
        value: analysisTable,
      },
      { field: 'list_status_id', type: sql.Int, value: listStatusId },
      {
        field: 'location_classification',
        type: sql.NVarChar(150),
        value: locationClassification,
      },
      {
        field: 'custom_attribute_names',
        type: sql.NVarChar(2000),
        value: customAttributeNames,
      },
      {
        field: 'custom_attribute_types',
        type: sql.NVarChar(2000),
        value: customAttributeTypes,
      },
      { field: 'associated_gfwlist', type: sql.TinyInt, value: gfwListId },
    ];

    const createListResult = await connection.executeQuery<CreateListResult>(
      'uspCreateList',
      parameters
    );

    return createListResult;
  } catch (error) {
    throw new Error('Failed insert row in List Table: ' + error.message);
  }
};

export class CreateList extends AbstractHandler<ChainType> {
  async handle(input: ChainType): Promise<void> {
    const {
      list_name: listName,
      organization_database: clientDatabase,
      listTable,
      analysisTable,
      listStatusId,
      locationClassification,
      customAttributeNames,
      customAttributeTypes,
      gfwListId,
      userId,
      templateId,
    } = input.request;

    const connection = new SQLUtils({
      ...sqlConfig,
      database: clientDatabase,
    });
    await connection.connect();

    const createListResult = await insertListInListTable(
      connection,
      userId,
      templateId,
      listName,
      listTable,
      analysisTable,
      listStatusId,
      locationClassification,
      customAttributeNames,
      customAttributeTypes,
      gfwListId
    );
    await updateListsUploadStatus(
      connection.databaseName,
      createListResult.list_id,
      'Insert row in List table'
    );

    createListResult.list_id;
  }
}
