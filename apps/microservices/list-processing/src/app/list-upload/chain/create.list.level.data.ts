import { SQLUtils } from '@wri-monorepos/sql';
import { AbstractHandler, ChainType } from './types';
import { CreateListResult } from '@wri-monorepos/geo';
import * as sql from 'mssql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { sqlConfig } from '../shared/config';

export class CreateList extends AbstractHandler<ChainType> {
  async insertListInListTable(
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
  ) {
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
  }

  async addListToAnalysesTable(listId: number) {
    const connection = new SQLUtils(sqlConfig);
    await connection.connect();

    try {
      await connection.executeQuery('uspAddListToAnalyses', [
        {
          field: 'list_id',
          type: sql.Int,
          value: listId,
        },
      ]);
    } catch (error) {
      throw new Error('Failed add list to analysis table: ' + error.message);
    }
  }

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

    const createListResult = await this.insertListInListTable(
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

    super.handle({ ...input, request: { ...input.request, listId: createListResult.list_id } });

    await this.addListToAnalysesTable(createListResult.list_id);
    await updateListsUploadStatus(
      connection.databaseName,
      createListResult.list_id,
      'Add list to analysis table'
    );
  }
}
