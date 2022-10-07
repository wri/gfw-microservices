import { SQLUtils } from './../utils/sql.utils';
import { Injectable, Inject } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../models';
import fetch from 'node-fetch';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import * as uniqId from 'uniqid';
import { createListNameSchema } from '../utils/list.utils';
import { DataSource, MssqlParameter } from 'typeorm';
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
    const largeListProcesingEndPoint = this.config.get<string>(
      'LARGE_LIST_PROCESING_ENDPOINT'
    );

    const requestBody = JSON.stringify(request);
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
    clientDatabase: string
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

      const queryCreateTableResult: QueryCreateTableResult[] =
        await command.query('uspGetTableQueryString @0', [template_id]);

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

      return createListResult;
    } catch (error) {
      /* await connection.executeQuery('uspCreateListTable', [
        {
          field: 'table_name',
          type: sql.NVarChar,
          value: 'Lists',
        },
        {
          field: 'primary_key',
          type: sql.Int,
          value: createListResult.list_id,
        },
        {
          field: 'column',
          type: sql.NVarChar,
          value: 'id',
        },
      ]); */

      await connection.executeQuery('uspDropOrganizationTable', [
        {
          field: 'table_name',
          type: sql.NVarChar,
          value: list.list_table,
        },
      ]);

      await connection.executeQuery('uspDropOrganizationTable', [
        {
          field: 'table_name',
          type: sql.NVarChar,
          value: list.analysis_table,
        },
      ]);

      console.log(error);
      return error;
    }

    /*const addListToAnalysisResult =
      await connection.executeQuery<CreateListResult>('uspAddListToAnalyses', [
        {
          field: 'template_id',
          type: sql.NVarChar(150),
          value: createListResult.recordsets[0][0].list_id,
        },
      ]);*/

    //const pool = await sql.connect(sqlConfig);
    //const request = pool.request();

    /*if (parameters && Array.isArray(parameters)) {
      parameters.forEach((param) => {
        request.input(param.field, param.type, param.value);
      });
    }*/

    /*request
      .execute('uspCreateList')
      .then(
        (result: sql.IProcedureResult<sql.IRecordSet<CreateListResult>>) => {
          return result.recordsets[0][0].list_id;
        }
      )
      .catch((errorMessage) => {
        throw errorMessage;
      })
      .finally(() => {
        pool.close();
      }); */
    // pool.request().input();

    /* const result1 = await pool
      .request()
      .input('input_parameter', sql.Int, 'wqwqw')
      .output('output_parameter', sql.VarChar(50))
      .query('select * from mytable where id = @input_parameter'); */

    /* const newDataSource = new DataSource({
      type: 'mssql',
      host: '52.45.199.190',
      port: 65300,
      username: 'GFWProUser',
      password: 'measure2010!',
      database: 'clientstore-DevCo',
      synchronize: true,
      requestTimeout: 30000,
      extra: {
        trustServerCertificate: true,
      },
    });

    await newDataSource.initialize();
    const parameters = {
      user_id: 1999999999,
      template_id: 1,
      list_name: 'test',
      list_table_name: 'test',
      list_analysis_table_name: 'test',
      list_status_id: 1,
      location_classification: 1,
      custom_attribute_names: 1,
      custom_attribute_types: 1,
      associated_gfwlist: 1,
    };
    try {
      const myQuery = newDataSource.driver.escapeQueryWithParameters(
        'EXEC uspCreateList :user_id',
        parameters,
        {}
      );

      // await newDataSource.driver.obtainMasterConnection().

      const result2 = await newDataSource.query(
        'EXEC uspCreateList @0 @1',
        [1999999999, 29292]
      );
    } catch (e) {
      console.log(e);
    }*/
  }
}
