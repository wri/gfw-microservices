import { createGeoJSON } from '@wri-monorepos/shared';
import { CreateListNameSchema, getDataType, GetWKTGeometry } from '@wri-monorepos/shared';
import * as sql from 'mssql';
import { SQLUtils, GetTableColumnsType } from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';
import { Feature } from '../lib/type';

interface MaxId {
  max_id?: number;
}

const SQL_CONFIG = {
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  server: process.env.MSSQL_HOSTNAME,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  port: parseInt(process.env.MSSQL_PORT),
  options: {
    trustServerCertificate: true,
  },
  requestTimeout: 600000,
};

interface GetColumnsData {
  connection: SQLUtils;
  list_id: number;
  geojson: { features: Feature[] };
  commodity: unknown;
}

@Injectable()
export class ListBulkCopy {
  /** @function {uploadBulkLocations}
   *   @summary Adds location and attributes to existing list
   *   @param {Number} list_id
   *   @param {String} list_name
   *   @param {Object} geojson - a geojson object with array of features that contain geometry and properties
   *   @param commodity
   *   @return {Promise}
   */
  async uploadBulkLocations(list_id, list_name, createTable, geojson, commodity, databaseName) {
    const clientConnectionConfiguration = {
      ...SQL_CONFIG,
      database: databaseName,
    };
    Logger.log(`Upload bulk locations to list id=${list_id}`, 'ListBulkCopy');

    const connection = new SQLUtils(clientConnectionConfiguration);
    await connection.connect();
    const list = CreateListNameSchema(list_name);

    const { start_location_id, columnNamesArray, columnTypesArray, dataArray } =
      await this.getColumnsWithTypesAndValues({
        connection,
        list_id,
        geojson,
        commodity,
      });
    const objTable = new sql.Table(list.list_table);
    objTable.create = createTable;
    // Add all columns to the table.
    for (let nIndex = 0; nIndex < columnNamesArray.length; nIndex++) {
      objTable.columns.add(columnNamesArray[nIndex], columnTypesArray[nIndex], {
        nullable: columnNamesArray[nIndex] === 'location_id' ? false : true,
      });
    }

    // Add all the rows to the table.
    for (let nIndex = 0; nIndex < dataArray.length; nIndex++) {
      if (dataArray[nIndex].length === columnNamesArray.length) {
        // Add data to the sql table
        objTable.rows.add(...dataArray[nIndex]);
      } else {
        throw new Error(
          `Length columns and properties do not match! Expected: ${columnNamesArray.length} Received: ${dataArray[nIndex].length}`
        );
      }
    }

    // Execute Bulk Insert
    await new Promise<void>((resolve, reject) => {
      // Create a SQL Connection.
      const pool = new sql.ConnectionPool(clientConnectionConfiguration, (err) => {
        if (err) {
          throw err;
        }
        // Get Request Object. Query
        const request = new sql.Request(pool);

        // Execute Stored Procedure.
        request
          .bulk(objTable)
          .then(() => {
            resolve();
            pool.close();
          })
          .catch((errorMessage) => {
            pool.close();
            reject(errorMessage);
          });
      });
    });

    // Update number of locations in Lists table
    const sqlUpdateListCountParameters = [
      {
        field: 'table_name',
        type: sql.NVarChar(150),
        value: list.list_table,
      },
      { field: 'list_id', type: sql.Int, value: list_id },
    ];

    await connection.executeQuery<Promise<unknown[]>>(
      'uspUpdateListCount',
      sqlUpdateListCountParameters
    );

    // Copy over list-<TABLE_NAME> ids to analysis-<TABLE_NAME>
    const sqlAddNewLocationToAnalysisTableParameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'start_location_id', type: sql.Int, value: start_location_id },
    ];

    Logger.log(
      `Add Location to Analysis table with configuration: ${JSON.stringify(
        clientConnectionConfiguration
      )}`,
      'ListBulkCopy'
    );

    const recorsets = await connection.runRawSingleQuery<Promise<unknown[]>>(
      'uspAddNewLocationToAnalysisTable',
      sqlAddNewLocationToAnalysisTableParameters
    );
    connection.disconnect();
    const resultGeoJson = createGeoJSON(Array.isArray(recorsets) ? recorsets : [recorsets]);

    return resultGeoJson;
  }

  private async getColumnsWithTypesAndValues({
    connection,
    list_id,
    geojson,
    commodity = null,
  }: GetColumnsData) {
    // Important variables
    let primary_key = 1;
    let max_id = 0;

    // 1. Get the max ID to properly set primary key
    const sqlGetMaxIdParameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
    const maxIdResult = (await connection.executeQuery(
      'uspGetMaxId',
      sqlGetMaxIdParameters
    )) as MaxId;

    max_id = maxIdResult.max_id === null ? 0 : maxIdResult.max_id;
    primary_key = maxIdResult.max_id === null ? 1 : maxIdResult.max_id + 1;

    // 2. Get Columns from list/table
    const sqlGetTableColumnsParameters = [{ field: 'list_id', type: sql.Int, value: list_id }];

    const columns = await connection.executeQuery<Promise<GetTableColumnsType[]>>(
      'uspGetTableColumns',
      sqlGetTableColumnsParameters
    );

    const bulkUploadPayload = [];
    /**
     * TODO GPV-3786
     * duplicated code
     */
    geojson.features.forEach((feature) => {
      const row = [];
      columns.forEach((column) => {
        const col = {
          field: column.COLUMN_NAME,
          type: getDataType(column),
          value: undefined,
        };
        if (Object.hasOwnProperty.call(feature.properties, column.COLUMN_NAME)) {
          col.value = feature.properties[column.COLUMN_NAME];

          if (column.COLUMN_NAME === 'Geometry') {
            col.value = GetWKTGeometry(feature.geometry);
          }
        } else {
          if (column.COLUMN_NAME === 'location_id') {
            col.value = primary_key;
          } else if (commodity && column.COLUMN_NAME === 'Commodity') {
            col.value = commodity;
          } else if (column.COLUMN_NAME === 'Geometry') {
            col.value = GetWKTGeometry(feature.geometry);
          } else if (column.COLUMN_NAME === 'attributes') {
            col.type = sql.NVarChar(sql.MAX);
            col.value = '';
          } else if (column.COLUMN_NAME === 'ErrorDetails') {
            col.type = sql.NVarChar(256);
            col.value = '';
          }
        }
        row.push(col);
      });
      bulkUploadPayload.push(row);
      // Increment key for next feature
      primary_key += 1;
    });
    const columnNamesArray = bulkUploadPayload[0].map((col) => col.field);
    const columnTypesArray = bulkUploadPayload[0].map((col) => col.type);
    const dataArray = bulkUploadPayload.map((row) => row.map((item) => item.value));

    return { columnNamesArray, columnTypesArray, dataArray, start_location_id: max_id };
  }
}
