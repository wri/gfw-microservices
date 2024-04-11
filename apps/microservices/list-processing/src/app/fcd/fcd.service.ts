import {
  GetLandmarkByCategoryAreaType,
  GetProtectedAreasByCategoryAreaType,
  SQLUtils,
  getLandmarkByCategoryArea,
  getProtectedAreasByCategoryArea,
  AnnualLossFcdFields,
  GetAnnualLossFcdDataReturnType,
  getAnnualLossFcdDataWithoutLocationIdFilter,
  getAnnualLossFcdData,
} from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { FcdControllerRequestBody } from '../../models';

@Injectable()
export class FCDService {
  private readonly FULLY_RESTRICTIVE_CATEGORY = ['Ia', 'Ib', 'II', 'III'];
  private readonly INDIGENOUS_LAND = 'Not Reported';

  private readonly logger = new Logger(FCDService.name);

  async handleWDPACategoryForList(listId: number, params: FcdControllerRequestBody) {
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

  async handleLandmarkCategoryForList(listId: number, params: FcdControllerRequestBody) {
    const { clientDatabase, country, locationId, countryGadm } = params;

    const landmark = await this.getAggregatedLandmark(
      listId,
      country,
      clientDatabase,
      locationId,
      countryGadm
    );

    return {
      ...landmark,
    };
  }

  async handleCountryCategoryForList(listId: number, params: FcdControllerRequestBody) {
    const { clientDatabase, countryGadm, locationId } = params;

    const { country_specific_deforestation_yearly, tree_cover_loss_by_country_yearly } =
      await this.getAnnualLossData({
        listId,
        clientDatabase,
        locationId,
        sqlFields: [
          AnnualLossFcdFields.COUNTRY_SPECIFIC_DEFORESTATION_YEARLY,
          AnnualLossFcdFields.TREE_COVER_LOSS_BY_COUNTRY_YEARLY,
        ],
      });

    return {
      country_specific_deforestation: JSON.parse(country_specific_deforestation_yearly)[
        countryGadm
      ],
      tree_cover_loss: JSON.parse(tree_cover_loss_by_country_yearly)[countryGadm],
    };
  }

  async handleClassifiedRegionCategoryForList(listId: number, params: FcdControllerRequestBody) {
    const { clientDatabase, locationId, countryGadm } = params;

    const {
      country_specific_deforestation_classified_region_yearly,
      tree_cover_loss_arg_otbn_yearly,
    } = await this.getAnnualLossData({
      clientDatabase,
      locationId,
      listId,
      sqlFields: [
        AnnualLossFcdFields.COUNTRY_SPECIFIC_DEFORESTATION_CLASSIFIED_REGION_YEARLY,
        AnnualLossFcdFields.TREE_COVER_LOSS_ARG_OTBN_YEARLY,
      ],
    });

    const country_specific_deforestation = JSON.parse(
      country_specific_deforestation_classified_region_yearly
    )[countryGadm];

    const tree_cover_loss = JSON.parse(tree_cover_loss_arg_otbn_yearly);

    return {
      classified_region: {
        country_specific_deforestation,
        tree_cover_loss,
      },
    };
  }

  private async getAggregatedWDPAOverlapData(
    listId: number,
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

  private async getProcessedWDPACountrySpecificDeforestationYearlyData(
    clientDatabase: string,
    listId: number,
    countryGadm: string,
    locationId?: number
  ) {
    const { country_specific_deforestation_wdpa_yearly, tree_cover_loss_by_country_wdpa_yearly } =
      await this.getAnnualLossData({
        clientDatabase,
        listId,
        locationId,
        sqlFields: [
          AnnualLossFcdFields.TREE_COVER_LOSS_BY_COUNTRY_WDPA_YEARLY,
          AnnualLossFcdFields.COUNTRY_SPECIFIC_DEFORESTATION_WDPA_YEARLY,
        ],
      });

    const country_specific_deforestation = this.getFullyAndLessRestrictedData(
      country_specific_deforestation_wdpa_yearly,
      countryGadm
    );

    const tree_cover_loss = this.getFullyAndLessRestrictedData(
      tree_cover_loss_by_country_wdpa_yearly,
      countryGadm
    );

    return { country_specific_deforestation, tree_cover_loss };
  }

  private getFullyAndLessRestrictedData(dataJsonString: string, countryGadm: string) {
    const data = JSON.parse(dataJsonString)[countryGadm] || {};

    const obj = { fullyRestrictive: {}, lessRestricted: {} };

    for (const [key, value] of Object.entries(data)) {
      const restrictionType = this.isFullRestrictiveCategory(key)
        ? 'fullyRestrictive'
        : 'lessRestricted';

      for (const [innerKey, innerValue] of Object.entries(value)) {
        const loss = obj[restrictionType][innerKey] || 0;
        obj[restrictionType][innerKey] = loss + innerValue;
      }
    }
    return { ...obj };
  }

  private async getAggregatedLandmark(
    listId: number,
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

    const {
      tree_cover_loss_by_country_landmark_yearly,
      country_specific_deforestation_landmark_yearly,
    } = await this.getAnnualLossData({
      listId,
      clientDatabase,
      locationId,
      sqlFields: [
        AnnualLossFcdFields.TREE_COVER_LOSS_BY_COUNTRY_LANDMARK_YEARLY,
        AnnualLossFcdFields.COUNTRY_SPECIFIC_DEFORESTATION_LANDMARK_YEARLY,
      ],
    });

    try {
      const countrySpecificDeforestation = JSON.parse(
        country_specific_deforestation_landmark_yearly
      )[countryGadm][this.INDIGENOUS_LAND];
      const treeCoverLoss = JSON.parse(tree_cover_loss_by_country_landmark_yearly)[countryGadm][
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

  private getProtectedAreasByCategoryAreaData(
    listId: number,
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

  private getLandmarkOverlapCountryData(
    listId: number,
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

  private getAnnualLossData({
    clientDatabase,
    listId,
    locationId,
    sqlFields,
  }: {
    clientDatabase: string;
    listId: number;
    locationId?: number;
    sqlFields: AnnualLossFcdFields[];
  }) {
    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'locationId', type: sql.Int, value: locationId || null },
    ];

    return SQLUtils.queryDBFirstRow<GetAnnualLossFcdDataReturnType>(
      clientDatabase,
      this.getAnnualLossFunction(locationId)(sqlFields),
      parameters
    );
  }

  private getAnnualLossFunction(locationId?: number) {
    return locationId ? getAnnualLossFcdData : getAnnualLossFcdDataWithoutLocationIdFilter;
  }

  private isFullRestrictiveCategory(category: string) {
    const found = this.FULLY_RESTRICTIVE_CATEGORY.find((item) =>
      category.toLowerCase().includes(item.toLowerCase())
    );
    return !!found;
  }
}
