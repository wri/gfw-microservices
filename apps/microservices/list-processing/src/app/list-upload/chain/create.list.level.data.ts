import { FeatureFlag, SQLUtils } from '@wri-monorepos/sql';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { CreateListResult } from '@wri-monorepos/geo';
import * as sql from 'mssql';
import { featureFlagsService } from '@wri-monorepos/shared';
import { Logger } from '@nestjs/common';
import { listStatus } from '@wri-monorepos/constants';

const LIST_UPLOAD_VERSION = 2;
const LIST_UPLOAD_LEGACY_VERSION = 0;

export class CreateListLevelData extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(CreateListLevelData.name);
  private createSqlParameter(
    field: string,
    type: sql.ISqlType | sql.ISqlTypeFactoryWithNoParams,
    value: string | number
  ) {
    return { field, type, value };
  }

  private async executeQueryWithParams<T>(
    connection: SQLUtils,
    procedureName: string,
    parameters: {
      field: string;
      type: sql.ISqlType | sql.ISqlTypeFactoryWithNoParams;
      value: string | number;
    }[]
  ): Promise<T> {
    try {
      return await connection.executeQuery<T>(procedureName, parameters);
    } catch (error) {
      throw new Error(`Failed to execute ${procedureName}: ${error.message}`);
    }
  }

  async insertListInListTable(
    connection: SQLUtils,
    userId: number,
    listName: string,
    listTable: string,
    analysisTable: string,
    listStatusId: number,
    locationClassification: string,
    customAttributeNames: string,
    customAttributeTypes: string,
    gfwListId: number = null,
    isUploadListLpFlagEnabled: boolean,
    commodity: string = null
  ): Promise<CreateListResult> {
    const parameters = [
      this.createSqlParameter('user_id', sql.Int, userId),
      this.createSqlParameter('list_name', sql.NVarChar(150), listName),
      this.createSqlParameter('list_table_name', sql.NVarChar(150), listTable),
      this.createSqlParameter('list_analysis_table_name', sql.NVarChar(150), analysisTable),
      this.createSqlParameter('list_status_id', sql.Int, listStatusId),
      this.createSqlParameter('location_classification', sql.NVarChar(150), locationClassification),
      this.createSqlParameter('custom_attribute_names', sql.NVarChar(2000), customAttributeNames),
      this.createSqlParameter('custom_attribute_types', sql.NVarChar(2000), customAttributeTypes),
      this.createSqlParameter('associated_gfwlist', sql.TinyInt, gfwListId),
      this.createSqlParameter('commodity', sql.NVarChar(150), commodity),
      this.createSqlParameter(
        'version',
        sql.Int,
        isUploadListLpFlagEnabled ? LIST_UPLOAD_VERSION : LIST_UPLOAD_LEGACY_VERSION
      ),
    ];

    const result = await this.executeQueryWithParams<CreateListResult>(
      connection,
      'uspCreateList',
      parameters
    );
    return result;
  }

  async addListToAnalysesTable(connection: SQLUtils, listId: number): Promise<void> {
    const parameters = [this.createSqlParameter('list_id', sql.Int, listId)];

    await this.executeQueryWithParams<void>(connection, 'uspAddListToAnalyses', parameters);
  }

  async handle(request: ChainType): Promise<ChainType> {
    const {
      list_name: listName,
      organization_database: clientDatabase,
      listTable,
      analysisTable,
      saveAsDraft,
      locationClassification,
      customAttributeNames,
      customAttributeTypes,
      gfwListId,
      user_id: userId,
      commodity = '',
    } = request.request as RequestNewList;

    const { getFeatureFlagsForCurrentOrg, getClientIdByClientStoreDatabaseName } =
      await featureFlagsService();
    const orgId = await getClientIdByClientStoreDatabaseName(clientDatabase);
    const flags = await getFeatureFlagsForCurrentOrg(orgId);

    const uploadListLpFlag = flags.find((f) => f.flagId === 'UploadListLp') as FeatureFlag;

    const connection = new SQLUtils();

    const listStatusId = saveAsDraft ? listStatus.Draft : listStatus.Pending;

    try {
      await connection.connect(clientDatabase);

      const createListResult = await this.insertListInListTable(
        connection,
        userId,
        listName,
        listTable,
        analysisTable,
        listStatusId,
        locationClassification,
        customAttributeNames,
        customAttributeTypes,
        gfwListId,
        uploadListLpFlag?.flagState,
        commodity
      );

      this.logger.log(`List created with id: ${createListResult.list_id} in ${clientDatabase}`);

      await this.addListToAnalysesTable(connection, createListResult.list_id);

      this.logger.log(
        `Add list to analysis table: ${createListResult.list_id} in ${clientDatabase}`
      );

      return {
        ...request,
        request: { ...request.request, list_id: createListResult.list_id },
      };
    } finally {
      await connection.disconnect();
    }
  }
}
