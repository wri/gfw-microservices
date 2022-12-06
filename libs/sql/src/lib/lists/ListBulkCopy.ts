import { createGeoJSON } from '@wri-monorepos/shared';
import {
  CreateListNameSchema,
  getDataType,
  GetWKTGeometry,
  objectHasOwnProperty,
} from '@wri-monorepos/shared';
import * as sql from 'mssql';
import { SQLUtils } from '../util/sql.utils';
import { SQL_CONFIG } from '../config/config';
import { Injectable } from '@nestjs/common';

interface MaxId {
  max_id?: number;
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
  async uploadBulkLocations(
    list_id,
    list_name,
    createTable,
    geojson,
    commodity,
    databaseName
  ) {
    const clientConnectionConfiguration = {
      ...SQL_CONFIG,
      database: databaseName,
    };

    const connection = new SQLUtils(clientConnectionConfiguration);
    await connection.connect();

    // Important variables
    let primary_key = 1;
    let max_id = 0;
    // Transform list name
    const list = CreateListNameSchema(list_name);
    // 1. Get the max ID to properly set primary key
    const sqlGetMaxIdParameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
    ];
    const maxIdResult: MaxId = await connection.executeQuery(
      'uspGetMaxId',
      sqlGetMaxIdParameters
    );

    max_id = maxIdResult.max_id === null ? 0 : maxIdResult.max_id;
    primary_key = maxIdResult.max_id === null ? 1 : maxIdResult.max_id + 1;

    // 2. Get Columns from list/table
    const sqlGetTableColumnsParameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
    ];

    const tableColumnsResult = await connection.executeQuery<
      Promise<unknown[]>
    >('uspGetTableColumns', sqlGetTableColumnsParameters);

    const columnNamesArray = [];
    const columnTypesArray = [];
    const dataArray = [];

    // Push column name types into respective arrays
    tableColumnsResult.forEach((column: any) => {
      if (
        column.COLUMN_NAME === 'location_id' ||
        column.COLUMN_NAME.includes('flag_')
      ) {
        columnNamesArray.push(column.COLUMN_NAME);
        columnTypesArray.push(sql.Int);
      } else {
        columnNamesArray.push(column.COLUMN_NAME);
        columnTypesArray.push(getDataType(column.DATA_TYPE));
      }
    });

    // Push Inner array to dataArray for each feature
    geojson.features.forEach((feature) => {
      const featureArray = [];
      columnNamesArray.forEach((columnName) => {
        if (objectHasOwnProperty(feature.properties, columnName)) {
          featureArray.push(
            commodity && columnName === 'Commodity' // If we have a commodity argument, use it
              ? commodity
              : feature.properties[columnName]
          );
        }
      });
      // Add the feature geometry, feature primary key Add flag property for general, gran cho, glad, forma, viirs, terrai
      featureArray.push(
        GetWKTGeometry(feature.geometry),
        primary_key,
        0,
        0,
        0,
        0,
        0,
        0
      );
      // Increment key for next feature
      primary_key += 1;
      dataArray.push(featureArray);
    });

    const objTable = new sql.Table(list.list_table);
    objTable.create = createTable;
    // Add all columns to the table.
    for (let nIndex = 0; nIndex < columnNamesArray.length; nIndex++) {
      objTable.columns.add(columnNamesArray[nIndex], columnTypesArray[nIndex], {
        nullable: true,
        primary: false,
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

    const bulkRequest = await new Promise<void>((resolve, reject) => {
      // Create a SQL Connection.
      const pool = new sql.ConnectionPool(
        clientConnectionConfiguration,
        (err) => {
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
              //sql.close();
            })
            .catch((errorMessage) => {
              //logger.error('Executing Bulk Insert for Table ', list_table_name);
              //logger.error(errorMessage);
              //sql.close();
              reject(errorMessage);
            });
        }
      );
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
      { field: 'start_location_id', type: sql.Int, value: max_id },
    ];

    const recorsets = await connection.executeQuery<Promise<unknown[]>>(
      'uspAddNewLocationToAnalysisTable',
      sqlAddNewLocationToAnalysisTableParameters
    );

    const resultGeoJson = createGeoJSON(recorsets);

    return resultGeoJson;
  }
}
