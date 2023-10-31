import {
  GetLandmarkByCategoryAreaType,
  GetProtectedAreasByCategoryAreaType,
  SQLUtils,
  getLandmarkByCategoryArea,
  getProtectedAreasByCategoryArea,
} from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';

import * as sql from 'mssql';

@Injectable()
export class FCDService {
  FULLY_RESTRICTIVE_CATEGORY = ['Ia', 'Ib', 'II', 'III'];
  INDIGENOUS_LAND = 'Not Reported';

  private readonly logger = new Logger(FCDService.name);

  sqlConfig = {
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    database: '',
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
  };

  async aggregateOverlapByCountry(listId: string, country: string, clientDatabase: string) {
    const data = await this.getProtectedAreasByCategoryAreaData(listId, country, clientDatabase);

    const result = {
      fullyRestrictive: 0,
      lessRestricted: 0,
    };

    data?.forEach((item) => {
      const protectedAreasByCategoryArea = JSON.parse(item.protectedAreasByCategoryArea);
      Object.entries(protectedAreasByCategoryArea).forEach(([key, value]) => {
        if (typeof value === 'number') {
          if (this.isFullRestrictiveCategory(key)) {
            result.fullyRestrictive += value;
          } else {
            result.lessRestricted += value;
          }
        }
      });
    });

    return result;
  }

  isFullRestrictiveCategory(category: string) {
    const found = this.FULLY_RESTRICTIVE_CATEGORY.find((item) =>
      category.toLowerCase().includes(item.toLowerCase())
    );
    return !!found;
  }

  async getProtectedAreasByCategoryAreaData(
    listId: string,
    country: string,
    clientDatabase: string
  ) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'country', type: sql.VarChar, value: country },
    ];

    const connection = new SQLUtils({
      ...this.sqlConfig,
      database: clientDatabase,
    });

    await connection.connect();

    this.logger.debug(`Get Protected Areas By Category Area for: ${country} and listId ${listId}`);
    const createListResult = await connection.queryArray<GetProtectedAreasByCategoryAreaType>(
      getProtectedAreasByCategoryArea,
      parameters
    );

    connection.disconnect();

    return createListResult;
  }

  async landmarkOverlapCountry(listId: string, country: string, clientDatabase: string) {
    const data = await this.getLandmarkOverlapCountryData(listId, country, clientDatabase);
    let totalArea = 0;
    let indigenousLand = 0;
    data?.forEach((item) => {
      totalArea = item.totalArea;
      const landmarkByCategoryArea = JSON.parse(item.landmarkByCategoryArea);
      Object.entries(landmarkByCategoryArea).forEach(([key, value]) => {
        if (typeof value === 'number') {
          if (this.isIndigenousLand(key)) {
            indigenousLand += value;
          }
        }
      });
    });

    return {
      indigenous: indigenousLand,
      nonIndegenous: totalArea - indigenousLand,
    };
  }

  isIndigenousLand(category: string) {
    return this.INDIGENOUS_LAND.toLowerCase().includes(category.toLowerCase());
  }

  async getLandmarkOverlapCountryData(listId: string, country: string, clientDatabase: string) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'country', type: sql.VarChar, value: country },
    ];

    const connection = new SQLUtils({
      ...this.sqlConfig,
      database: clientDatabase,
    });

    await connection.connect();

    this.logger.debug(`Get Protected Areas By Category Area for: ${country} and listId ${listId}`);
    const createListResult = await connection.queryArray<GetLandmarkByCategoryAreaType>(
      getLandmarkByCategoryArea,
      parameters
    );

    connection.disconnect();

    return createListResult;
  }
}
