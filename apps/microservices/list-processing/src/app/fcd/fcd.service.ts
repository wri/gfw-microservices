import {
  GetLandmarkByCategoryAreaType,
  GetProtectedAreasByCategoryAreaType,
  GetCountrySpecificDeforestationType,
  GetCountrySpecificDeforestationWithoutLocationIdType,
  SQLUtils,
  getLandmarkByCategoryArea,
  getProtectedAreasByCategoryArea,
  getCountrySpecificDeforestation,
  getCountrySpecificDeforestationWithoutLocationId,
  getWDPACountrySpecificDeforestationYearly,
  GetWDPACountrySpecificDeforestationYearlyType,
} from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { FcdV2ControllerRequestBody } from '../../models';

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

  async handleWDPACategoryForList(listId: string, params: FcdV2ControllerRequestBody) {
    const { clientDatabase, country, locationId, countryGadm } = params;

    const overlap = await this.getAggregatedWDPAOverlapData(
      listId,
      country,
      clientDatabase,
      locationId
    );

    const country_specific_deforestation_wdpa_yearly =
      await this.getProcessedWDPACountrySpecificDeforestationYearlyData(
        clientDatabase,
        listId,
        countryGadm,
        locationId
      );

    return {
      overlap,
      country_specific_deforestation_wdpa_yearly,
    };
  }

  async handleLandmarkCategoryForList(listId: string, params: FcdV2ControllerRequestBody) {
    const { clientDatabase, country, locationId } = params;

    const overlap = await this.getAggregatedLandmarkOverlapByCountry(
      listId,
      country,
      clientDatabase,
      locationId
    );

    return {
      overlap,
    };
  }

  async handleCountryCategoryForList(listId: string, params: FcdV2ControllerRequestBody) {
    const { clientDatabase, countryGadm, locationId } = params;

    return this.countrySpecificDeforestation(listId, clientDatabase, countryGadm, locationId);
  }

  async getAggregatedWDPAOverlapData(
    listId: string,
    country: string,
    clientDatabase: string,
    locationId: string
  ) {
    const data = await this.getProtectedAreasByCategoryAreaData(
      listId,
      country,
      clientDatabase,
      locationId
    );

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

  async getProcessedWDPACountrySpecificDeforestationYearlyData(
    clientDatabase: string,
    listId: string,
    countryGadm: string,
    locationId: string
  ) {
    const data = await this.getWDPACountrySpecificDeforestationYearlyData(
      clientDatabase,
      listId,
      locationId
    );

    const result = {
      fullyRestrictive: {},
      lessRestricted: {},
    };

    data?.forEach((item) => {
      const jsonParsedItemData = JSON.parse(item.countrySpecificDeforestationWdpaYearly || '{}');
      const countrySpecificDeforestationData = jsonParsedItemData[countryGadm] || {};
      Object.entries(countrySpecificDeforestationData)?.forEach(([key, value]) => {
        if (this.isFullRestrictiveCategory(key)) {
          Object.entries(value)?.forEach(([innerKey, innerValue]) => {
            if (!result.fullyRestrictive[innerKey]) {
              result.fullyRestrictive[innerKey] = 0;
            }
            result.fullyRestrictive[innerKey] += innerValue;
          });
        } else {
          Object.entries(value)?.forEach(([innerKey, innerValue]) => {
            if (!result.lessRestricted[innerKey]) {
              result.lessRestricted[innerKey] = 0;
            }
            result.lessRestricted[innerKey] += innerValue;
          });
        }
      });
    });

    return result;
  }

  async getAggregatedLandmarkOverlapByCountry(
    listId: string,
    country: string,
    clientDatabase: string,
    locationId: string
  ) {
    const data = await this.getLandmarkOverlapCountryData(
      listId,
      country,
      clientDatabase,
      locationId
    );
    let totalArea = 0;
    let indigenousLand = 0;
    data?.forEach((item) => {
      totalArea += item.totalArea;
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
      nonIndigenous: totalArea - indigenousLand,
    };
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
    clientDatabase: string,
    locationId: string
  ) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'country', type: sql.VarChar(150), value: country },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    this.logger.debug(`getProtectedAreasByCategoryAreaData: `, parameters);
    return await SQLUtils.queryDB<GetProtectedAreasByCategoryAreaType[]>(
      clientDatabase,
      getProtectedAreasByCategoryArea,
      parameters
    );
  }

  async getWDPACountrySpecificDeforestationYearlyData(
    clientDatabase: string,
    listId: string,
    locationId: string
  ) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    this.logger.debug(`getWDPACountrySpecificDeforestationYearlyData: `, parameters);
    return await SQLUtils.queryDB<GetWDPACountrySpecificDeforestationYearlyType[]>(
      clientDatabase,
      getWDPACountrySpecificDeforestationYearly,
      parameters
    );
  }

  isIndigenousLand(category: string) {
    return this.INDIGENOUS_LAND.toLowerCase().includes(category.toLowerCase());
  }

  async getLandmarkOverlapCountryData(
    listId: string,
    country: string,
    clientDatabase: string,
    locationId: string
  ) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'country', type: sql.VarChar(150), value: country },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    this.logger.debug(`Get Protected Areas By Category Area for: ${country} and listId ${listId}`);
    return await SQLUtils.queryDB<GetLandmarkByCategoryAreaType[]>(
      clientDatabase,
      getLandmarkByCategoryArea,
      parameters
    );
  }

  async countrySpecificDeforestation(
    listId: string,
    clientDatabase: string,
    countryGadm: string,
    locationId: string
  ) {
    const data = await this.getCountrySpecificDeforestationData(listId, clientDatabase, locationId);

    if (!data) {
      return null;
    }

    return {
      country_specific_deforestation: this.getDataFromJsonString(
        data,
        'countrySpecificDeforestation',
        countryGadm
      ),
      tree_cover_loss: this.getDataFromJsonString(data, 'treeCoverLoss', countryGadm),
    };
  }

  async getCountrySpecificDeforestationData(
    listId: string,
    clientDatabase: string,
    locationId: string
  ) {
    this.logger.debug(
      `Get country specific deforestation for: listId ${listId} and locationId ${locationId}`
    );
    const parameters = [{ field: 'listId', type: sql.Int, value: listId }];

    if (locationId) {
      parameters.push({ field: 'locationId', type: sql.Int, value: locationId });

      return await SQLUtils.queryDBFirstRow<GetCountrySpecificDeforestationType>(
        clientDatabase,
        getCountrySpecificDeforestation,
        parameters
      );
    } else {
      return await SQLUtils.queryDBFirstRow<GetCountrySpecificDeforestationWithoutLocationIdType>(
        clientDatabase,
        getCountrySpecificDeforestationWithoutLocationId,
        parameters
      );
    }
  }

  private getDataFromJsonString(
    data: GetCountrySpecificDeforestationType,
    objName: string,
    countryGadm: string
  ) {
    try {
      return JSON.parse(data[objName][countryGadm]);
    } catch (ex) {
      this.logger.error('error converting json object');
      return null;
    }
  }
}
