import {
  GetLandmarkByCategoryAreaType,
  GetProtectedAreasByCategoryAreaType,
  GetCountrySpecificDeforestationType,
  GetLandmarkAnnualLossType,
  SQLUtils,
  getLandmarkByCategoryArea,
  getProtectedAreasByCategoryArea,
  getCountrySpecificDeforestation,
  getCountrySpecificDeforestationWithoutLocationId,
  getLandmarkAnnualLoss,
  getLandmarkAnnualLossWithoutLocationIdFilter,
  getWdpaYearlyLoss,
  GetWdpaYearlyLossType,
  getWdpaYearlyLossWithoutLocationIdFilter,
} from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { FcdControllerRequestBody } from '../../models';

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

  async handleWDPACategoryForList(listId: string, params: FcdControllerRequestBody) {
    const { clientDatabase, country, locationId, countryGadm } = params;

    const overlap = await this.getAggregatedWDPAOverlapData(
      listId,
      country,
      clientDatabase,
      locationId
    );

    const annualLoss = await this.getProcessedWDPACountrySpecificDeforestationYearlyData(
      clientDatabase,
      listId,
      countryGadm,
      locationId
    );

    return {
      overlap,
      ...annualLoss,
    };
  }

  async handleLandmarkCategoryForList(listId: string, params: FcdControllerRequestBody) {
    const { clientDatabase, country, locationId, countryGadm } = params;

    const landmark = await this.getAggregatedLandmark(
      listId,
      country,
      clientDatabase,
      locationId,
      countryGadm
    );

    return {
      landmark,
    };
  }

  handleCountryCategoryForList(listId: string, params: FcdControllerRequestBody) {
    const { clientDatabase, countryGadm, locationId } = params;

    return this.countrySpecificDeforestation(listId, clientDatabase, countryGadm, locationId);
  }

  async getAggregatedWDPAOverlapData(
    listId: string,
    country: string,
    clientDatabase: string,
    locationId?: number
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
    locationId?: number
  ) {
    const { countrySpecificDeforestationWdpaYearly, treeCoverLossByCountryWdpaYearly } =
      await this.getWdpaAnnualLossData(clientDatabase, listId, locationId);

    const annualLosses = {
      country_specific_deforestation: { fullyRestrictive: {}, lessRestricted: {} },
      tree_cover_loss: { fullyRestrictive: {}, lessRestricted: {} },
    };

    const jsonParsedSpecificDeforestationWdpa = JSON.parse(countrySpecificDeforestationWdpaYearly);
    const countrySpecificDeforestationData = jsonParsedSpecificDeforestationWdpa[countryGadm] || {};
    Object.entries(countrySpecificDeforestationData)?.forEach(([key, value]) => {
      const restrictionType = this.isFullRestrictiveCategory(key)
        ? 'fullyRestrictive'
        : 'lessRestricted';
      Object.entries(value)?.forEach(([innerKey, innerValue]) => {
        if (!annualLosses.country_specific_deforestation[restrictionType][innerKey]) {
          annualLosses.country_specific_deforestation[restrictionType][innerKey] = 0;
        }
        annualLosses.country_specific_deforestation[restrictionType][innerKey] += innerValue;
      });
    });

    const jsonParsedTreeCoverLossWdpa = JSON.parse(treeCoverLossByCountryWdpaYearly);
    const countryTreeCoverLossData = jsonParsedTreeCoverLossWdpa[countryGadm] || {};
    Object.entries(countryTreeCoverLossData)?.forEach(([key, value]) => {
      const restrictionType = this.isFullRestrictiveCategory(key)
        ? 'fullyRestrictive'
        : 'lessRestricted';
      Object.entries(value)?.forEach(([innerKey, innerValue]) => {
        if (!annualLosses.tree_cover_loss[restrictionType][innerKey]) {
          annualLosses.tree_cover_loss[restrictionType][innerKey] = 0;
        }
        annualLosses.tree_cover_loss[restrictionType][innerKey] += innerValue;
      });
    });

    return annualLosses;
  }

  async getAggregatedLandmark(
    listId: string,
    country: string,
    clientDatabase: string,
    locationId: number,
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
    locationId: number
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

  getWdpaAnnualLossData(clientDatabase: string, listId: string, locationId?: number) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    return SQLUtils.queryDBFirstRow<GetWdpaYearlyLossType>(
      clientDatabase,
      locationId ? getWdpaYearlyLoss : getWdpaYearlyLossWithoutLocationIdFilter,
      parameters
    );
  }

  getLandmarkOverlapCountryData(
    listId: string,
    country: string,
    clientDatabase: string,
    locationId: number
  ) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'country', type: sql.VarChar(150), value: country },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    this.logger.debug(`Get Protected Areas By Category Area for: ${country} and listId ${listId}`);
    return SQLUtils.queryDB<GetLandmarkByCategoryAreaType[]>(
      clientDatabase,
      getLandmarkByCategoryArea,
      parameters
    );
  }

  getLandmarkAnnualLossData(listId: string, clientDatabase: string, locationId: number) {
    this.logger.debug(`Get landmark annual loss: listId ${listId} and locationId ${locationId}`);
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    return SQLUtils.queryDBFirstRow<GetLandmarkAnnualLossType>(
      clientDatabase,
      locationId ? getLandmarkAnnualLoss : getLandmarkAnnualLossWithoutLocationIdFilter,
      parameters
    );
  }

  private async countrySpecificDeforestation(
    listId: string,
    clientDatabase: string,
    countryGadm: string,
    locationId: number
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

  private getCountrySpecificDeforestationData(
    listId: string,
    clientDatabase: string,
    locationId?: number
  ) {
    this.logger.debug(
      `Get country specific deforestation for: listId ${listId} and locationId ${locationId}`
    );
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    return SQLUtils.queryDBFirstRow<GetCountrySpecificDeforestationType>(
      clientDatabase,
      locationId
        ? getCountrySpecificDeforestation
        : getCountrySpecificDeforestationWithoutLocationId,
      parameters
    );
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
      return null;
    }
  }
}
