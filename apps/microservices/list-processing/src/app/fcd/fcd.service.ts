import {
  GetLandmarkByCategoryAreaType,
  GetProtectedAreasByCategoryAreaType,
  GetCountrySpecificDeforestationType,
  GetCountrySpecificDeforestationWithoutLocationIdType,
  GetLandmarkAnnualLossType,
  GetLandmarkAnnualLossWithoutLocationIdFilterType,
  SQLUtils,
  getLandmarkByCategoryArea,
  getProtectedAreasByCategoryArea,
  getCountrySpecificDeforestation,
  getCountrySpecificDeforestationWithoutLocationId,
  getLandmarkAnnualLoss,
  getLandmarkAnnualLossWithoutLocationIdFilter,
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

  async getAggregatedWDPAOverlapByCountry(
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

  async getAggregatedLandmarkOverlapByCountry(
    listId: string,
    country: string,
    clientDatabase: string,
    locationId: string,
    countryGadm: string
  ) {
    const data = await this.getLandmarkOverlapCountryData(
      listId,
      country,
      clientDatabase,
      locationId
    );

    const initialObj = {
      overlap: {
        indigenous: 0,
        nonIndigenous: 0,
      },
      country_specific_deforestation: {
        indigenous: {},
      },
      tree_cover_loss: {
        indigenous: {},
      },
    };

    let landmark = data?.reduce((prev, curr) => {
      let landmark = { ...prev };

      try {
        const overlapIndigenous =
          JSON.parse(curr?.landmarkByCategoryArea)[this.INDIGENOUS_LAND] ?? 0;

        landmark = {
          ...landmark,
          overlap: {
            indigenous: prev.overlap.indigenous + overlapIndigenous,
            nonIndigenous: prev.overlap.nonIndigenous + curr.totalArea - overlapIndigenous,
          },
        };
      } catch (error) {
        this.logger.error(`error converting json object: ${error}`);
      }
      return landmark;
    }, initialObj);

    const annualLossData = await this.getLandmarkAnnualLossData(listId, clientDatabase, locationId);

    try {
      const countrySpecificDeforestation = JSON.parse(annualLossData.countrySpecificDeforestation)[
        countryGadm
      ][this.INDIGENOUS_LAND];
      const treeCoverLoss = JSON.parse(annualLossData.treeCoverLoss)[countryGadm][
        this.INDIGENOUS_LAND
      ];

      landmark = {
        ...landmark,
        country_specific_deforestation: { indigenous: countrySpecificDeforestation },
        tree_cover_loss: { indigenous: treeCoverLoss },
      };
    } catch (error) {
      this.logger.error(`error converting json object: ${error}`);
    }

    return {
      ...landmark,
    };
  }

  async getAggregatedCountryData(
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

  private isFullRestrictiveCategory(category: string) {
    const found = this.FULLY_RESTRICTIVE_CATEGORY.find((item) =>
      category.toLowerCase().includes(item.toLowerCase())
    );
    return !!found;
  }

  getProtectedAreasByCategoryAreaData(
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
    return SQLUtils.queryDB<GetProtectedAreasByCategoryAreaType[]>(
      clientDatabase,
      getProtectedAreasByCategoryArea,
      parameters
    );
  }

  getLandmarkOverlapCountryData(
    listId: string,
    country: string,
    clientDatabase: string,
    locationId: string
  ) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'country', type: sql.VarChar, value: country },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    this.logger.debug(`Get Protected Areas By Category Area for: ${country} and listId ${listId}`);
    return SQLUtils.queryDB<GetLandmarkByCategoryAreaType[]>(
      clientDatabase,
      getLandmarkByCategoryArea,
      parameters
    );
  }

  getLandmarkAnnualLossData(listId: string, clientDatabase: string, locationId?: string) {
    this.logger.debug(`Get landmark annual loss: listId ${listId} and locationId ${locationId}`);
    const parameters = [{ field: 'listId', type: sql.Int, value: listId }];

    if (locationId) {
      parameters.push({ field: 'locationId', type: sql.Int, value: locationId });

      return SQLUtils.queryDBFirstRow<GetLandmarkAnnualLossType>(
        clientDatabase,
        getLandmarkAnnualLoss,
        parameters
      );
    } else {
      return SQLUtils.queryDBFirstRow<GetLandmarkAnnualLossWithoutLocationIdFilterType>(
        clientDatabase,
        getLandmarkAnnualLossWithoutLocationIdFilter,
        parameters
      );
    }
  }

  private getCountrySpecificDeforestationData(
    listId: string,
    clientDatabase: string,
    locationId?: string
  ) {
    this.logger.debug(
      `Get country specific deforestation for: listId ${listId} and locationId ${locationId}`
    );
    const parameters = [{ field: 'listId', type: sql.Int, value: listId }];

    if (locationId) {
      parameters.push({ field: 'locationId', type: sql.Int, value: locationId });

      return SQLUtils.queryDBFirstRow<GetCountrySpecificDeforestationType>(
        clientDatabase,
        getCountrySpecificDeforestation,
        parameters
      );
    } else {
      return SQLUtils.queryDBFirstRow<GetCountrySpecificDeforestationWithoutLocationIdType>(
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
      return JSON.parse(data[objName])[countryGadm];
    } catch (error) {
      this.logger.error(`error converting json object: ${error}`);
    }
  }
}
