import { SQLUtils } from '@wri-monorepos/sql';
import { BadRequestException, Logger } from '@nestjs/common';
import { Injectable, Inject } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../models';
import fetch from 'node-fetch';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { createListNameSchema } from '../utils/list.utils';
import { DataSource } from 'typeorm';
import { getListByFilters, getListLocationsCountById } from '@wri-monorepos/sql';
import { getAccountSubscriptionData } from '@wri-monorepos/shared';
import { ProcessingLimitException } from '../app/app.exceptions';

interface CreateListResult {
  list_id: number;
}

interface QueryCreateTableResult {
  query_string: string;
}

@Injectable()
export class LargeListService {
  @Inject(ConfigService)
  private readonly config: ConfigService;
  constructor(private dataSource: DataSource) {}

  async startAnalisysProcessForList(
    request: RequestLargeListProcess
  ): Promise<ResponseLargeListProcess> {
    const largeListProcesingEndPoint = this.config.get<string>('LARGE_LIST_PROCESING_ENDPOINT');

    const microserviceEnvironment = this.config.get<string>('MICROSERVICES_ENV');

    const { isExternalAPIProcess, ...llpRequest } = request;
    const {
      organization_id: organizationId,
      organization_database: databaseName,
      subscription_status_id: subscriptionStatusId,
      list_id: listId,
    } = llpRequest;

    const listLocationsCount = await getListLocationsCountById(listId, databaseName);

    const { accountUsage, accountLimits } = await getAccountSubscriptionData({
      organizationId,
      subscriptionStatusId,
    });

    if (
      accountUsage.locations_analyzed + listLocationsCount >
      accountLimits.max_locations_per_year
    ) {
      throw new ProcessingLimitException();
    }

    const payloadBody = {
      ...llpRequest,
      environment: microserviceEnvironment,
      send_email: isExternalAPIProcess === true ? false : true,
    };

    const requestBody = JSON.stringify(payloadBody);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    };

    const response = await fetch(largeListProcesingEndPoint, options);
    const respondeBody = await response.json();

    return respondeBody;
  }

  async createNewLargeListProcess(
    list_name: string,
    user_id: number,
    clientDatabase: string,
    analysisIds: Array<string>
  ): Promise<CreateListResult> {
    //const user_id = 1999999;
    //const list_name = `My Template Name ${templateUniq}`;
    const template_id = 13; // Cocoa generic template
    const list = createListNameSchema(list_name);
    const list_table = list.list_table;
    const analysis_table = list.analysis_table;
    const list_status_id = 1; // Pending
    const location_classification = 'Property';
    const custom_attribute_names = '';
    const custom_attribute_types = '';
    const gfw_list_id = null;
    let createListResult: CreateListResult;
    const sqlConfig = {
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      database: clientDatabase,
      server: process.env.MSSQL_HOSTNAME,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      port: parseInt(process.env.MSSQL_PORT),
      options: {
        //encrypt: true, // for azure
        trustServerCertificate: true, // change to true for local dev / self-signed certs
      },
    };

    const parameters = [
      { field: 'user_id', type: sql.Int, value: user_id },
      { field: 'template_id', type: sql.Int, value: template_id },
      { field: 'list_name', type: sql.NVarChar(150), value: list_name },
      {
        field: 'list_table_name',
        type: sql.NVarChar(150),
        value: list_table,
      },
      {
        field: 'list_analysis_table_name',
        type: sql.NVarChar(150),
        value: analysis_table,
      },
      { field: 'list_status_id', type: sql.Int, value: list_status_id },
      {
        field: 'location_classification',
        type: sql.NVarChar(150),
        value: location_classification,
      },
      {
        field: 'custom_attribute_names',
        type: sql.NVarChar(2000),
        value: custom_attribute_names,
      },
      {
        field: 'custom_attribute_types',
        type: sql.NVarChar(2000),
        value: custom_attribute_types,
      },
      { field: 'associated_gfwlist', type: sql.TinyInt, value: gfw_list_id },
    ];

    // Create table query string
    //const params = {};
    //"template_id": new MssqlParameter(template_id, 'int').params,

    /*const queryCreateTableResult = await command.query(
      'uspGetTableQueryString @template_id',
      params
    );*/
    const connection = new SQLUtils(sqlConfig);
    await connection.connect();

    const doesListNameAlreadyExist = await getListByFilters(
      { listName: list_name },
      clientDatabase
    );

    if (doesListNameAlreadyExist) {
      throw new BadRequestException('List name already exists');
    }

    try {
      // Create a new list in table
      createListResult = await connection.executeQuery<CreateListResult>(
        'uspCreateList',
        parameters
      );

      await connection.executeQuery('uspAddListToAnalyses', [
        {
          field: 'list_id',
          type: sql.Int,
          value: createListResult.list_id,
        },
      ]);

      const command = this.dataSource.createQueryRunner();
      await command.connect();

      const queryCreateTableResult: QueryCreateTableResult[] = await command.query(
        'uspGetTableQueryString @0',
        [template_id]
      );

      await connection.executeQuery('uspCreateListTable', [
        {
          field: 'table_name',
          type: sql.NVarChar(150),
          value: list.list_table,
        },
        {
          field: 'query_string',
          type: sql.NVarChar(sql.MAX),
          value: queryCreateTableResult[0].query_string,
        },
      ]);

      await connection.executeQuery('uspCreateAnalysisTable', [
        {
          field: 'list_analysis_table_name',
          type: sql.NVarChar(150),
          value: list.analysis_table,
        },
      ]);

      analysisIds.forEach(async (analysisId) => {
        await SQLUtils.queryDB(clientDatabase, 'uspCreateListAnalysisStatus', [
          {
            field: 'ListID',
            type: sql.Int,
            value: createListResult.list_id,
          },
          {
            field: 'AnalysisID',
            type: sql.NVarChar(150),
            value: analysisId,
          },
          {
            field: 'Status',
            type: sql.Int,
            value: list_status_id,
          },
        ]);
      });

      return createListResult;
    } catch (error) {
      await connection.executeQuery('uspDropOrganizationTable', [
        {
          field: 'table_name',
          type: sql.NVarChar(255),
          value: list.list_table,
        },
      ]);

      await connection.executeQuery('uspDropOrganizationTable', [
        {
          field: 'table_name',
          type: sql.NVarChar(255),
          value: list.analysis_table,
        },
      ]);

      const { list_id: listID } = createListResult ?? {};
      if (listID) {
        await connection.executeQuery('dropListAnalysisStatusByListId', [
          {
            field: 'ListID',
            type: sql.Int,
            value: listID,
          },
        ]);
      }

      Logger.error(error);
      return error;
    }
  }
}
