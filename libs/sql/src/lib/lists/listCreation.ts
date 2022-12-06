import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { CreateListNameSchema } from '@wri-monorepos/shared';
import process = require('process');
const PENDING_STATUS_ID = 1;
export interface CreateListResult {
  list_id: number;
}

interface QueryCreateTableResult {
  query_string: string;
}

@Injectable()
export class SPSListCreation {
  async createNewList(
    list_name: string,
    template_id: number,
    location_classification: string,
    user_id: number,
    custom_attributes: string[],
    clientDatabase: string,
    gfw_list_id?: number
  ): Promise<CreateListResult> {
    const list = CreateListNameSchema(list_name);
    const list_table = list.list_table;
    const analysis_table = list.analysis_table;
    const list_status_id = PENDING_STATUS_ID; // Pending
    const custom_attribute_names = '';
    const custom_attribute_types = '';

    /*const custom_attribute_names = custom_attributes
      ? custom_attributes.map((a) => a.column_name).toString()
      : [];
    const custom_attribute_types = custom_attributes
      ? custom_attributes.map((a) => a.column_type).toString()
      : []; */

    let createListResult: CreateListResult;
    const gfwProDatabase = process.env.MSSQL_DATABASE;

    const sqlClientConfig = {
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

    const sqlMainConfig = {
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      database: gfwProDatabase,
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

    let clientConnection = new SQLUtils(sqlClientConfig);
    await clientConnection.connect();

    try {
      // Create a new list in table
      createListResult = await clientConnection.executeQuery<CreateListResult>(
        'uspCreateList',
        parameters
      );

      await clientConnection.executeQuery('uspAddListToAnalyses', [
        {
          field: 'list_id',
          type: sql.Int,
          value: createListResult.list_id,
        },
      ]);

      await clientConnection.disconnect();

      /*const command = this.dataSource.createQueryRunner();
      await command.connect();

      const queryCreateTableResult: QueryCreateTableResult[] =
        await command.query('uspGetTableQueryString @0', [template_id]);
      */

      const mainConnection = new SQLUtils(sqlMainConfig);
      await mainConnection.connect();

      const queryCreateTableResult =
        await mainConnection.executeQuery<QueryCreateTableResult>(
          'uspGetTableQueryString',
          [
            {
              field: 'template_id',
              type: sql.Int,
              value: template_id,
            },
            {
              field: 'custom_attribute_1',
              type: sql.NVarChar(50),
              value: null,
            },
            {
              field: 'custom_attribute_1_type',
              type: sql.NVarChar(50),
              value: null,
            },
            {
              field: 'custom_attribute_2',
              type: sql.NVarChar(50),
              value: null,
            },
            {
              field: 'custom_attribute_2_type',
              type: sql.NVarChar(50),
              value: null,
            },
            {
              field: 'custom_attribute_3',
              type: sql.NVarChar(50),
              value: null,
            },
            {
              field: 'custom_attribute_3_type',
              type: sql.NVarChar(50),
              value: null,
            },
          ]
        );

      //await mainConnection.disconnect();

      clientConnection = new SQLUtils(sqlClientConfig);
      await clientConnection.connect();

      await clientConnection.executeQuery('uspCreateListTable', [
        {
          field: 'table_name',
          type: sql.NVarChar(150),
          value: list.list_table,
        },
        {
          field: 'query_string',
          type: sql.NVarChar(sql.MAX),
          value: queryCreateTableResult.query_string,
        },
      ]);

      await clientConnection.executeQuery('uspCreateAnalysisTable', [
        {
          field: 'list_analysis_table_name',
          type: sql.NVarChar(150),
          value: list.analysis_table,
        },
      ]);

      //await clientConnection.disconnect();
      //await mainConnection.disconnect();
      return createListResult;
    } catch (error) {
      await clientConnection.executeQuery('uspDropOrganizationTable', [
        {
          field: 'table_name',
          type: sql.NVarChar,
          value: list.list_table,
        },
      ]);

      await clientConnection.executeQuery('uspDropOrganizationTable', [
        {
          field: 'table_name',
          type: sql.NVarChar,
          value: list.analysis_table,
        },
      ]);

      //await clientConnection.disconnect();
      //await mainConnection.disconnect();
      console.log(error);
      return error;
    }
  }
}
