import {
  ClientStoreConnection,
  getPaginatedGHGAnalysisLocationLevel,
  GHGAnalyses,
  GHGAnalysisDataByListId,
  Lists,
  SQLUtils,
} from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';

interface GHGAnalysisData {
  listId: number;
  listName: string;
  locationName: string;
  totalAreaHa: number;
  statusCode: number;
  locationError: string;
  commodity: string;
  co2EmissionsFactor: string;
  ch4EmissionsFactor: string;
  n2oEmissionsFactor: string;
  combinedEmissionsFactor: string;
}
interface GHGNumerOfPages {
  id: number;
  quantity: number;
}
@Injectable()
export class GHGService {
  private readonly logger = new Logger(GHGService.name);

  constructor(private readonly clientStoreConnection: ClientStoreConnection) {}

  async getNumberOfPagesGHGAnalysis(listId: number, queryParam): Promise<GHGNumerOfPages> {
    const { clientDatabase, rowsPerPage } = queryParam;
    this.logger.log(`Get Number Of Pages GHG Analysis for listId: ${listId}`);

    const connection = await this.clientStoreConnection.getConnection(clientDatabase);
    const ghgRepository = await connection.getRepository(GHGAnalyses);
    try {
      const quantity = await ghgRepository.count({
        where: { listId },
        take: rowsPerPage,
      });

      return {
        id: listId,
        quantity,
      };
    } catch (e) {
      this.logger.error(`listId: ${listId} error: ${e}`);
      return {
        id: listId,
        quantity: 0,
      };
    }
  }

  async getGHGDataPerPage(listId: number, queryParam): Promise<GHGAnalysisData[]> {
    const { clientDatabase, rowsPerPage = 50, pageNumber = 0 } = queryParam;
    this.logger.log(`Get GHG Data Per Page for listId: ${listId}`);

    const connection = await this.clientStoreConnection.getConnection(clientDatabase);
    try {
      const ListRepository = await connection.getRepository(Lists);
      const { listName, Commodity } = await ListRepository.findOne({
        where: { id: listId },
      });

      const parameters = [
        { field: 'listId', type: sql.Int, value: listId },
        { field: 'rowsOfPage', type: sql.Int, value: rowsPerPage },
        { field: 'pageNumber', type: sql.Int, value: pageNumber },
      ];

      const data = await SQLUtils.queryDB<GHGAnalysisDataByListId[]>(
        clientDatabase,
        getPaginatedGHGAnalysisLocationLevel,
        parameters
      );

      return await Promise.all(
        data.map(async (item) => {
          const {
            listId,
            totalAreaHa,
            statusCode,
            locationError,
            emissionsFactorByYear,
            efCo2ByYear,
            efCh4ByYear,
            efN2oByYear,
            locationName,
            country,
            state,
            subState,
            emissions_ch4_yearly,
            emissions_n2o_yearly,
            emissions_yearly,
            production,
            weighted_avg_yield,
          } = item;
          return {
            listId,
            listName,
            country,
            state,
            subState,
            locationName,
            totalAreaHa,
            statusCode,
            locationError,
            commodity: Commodity,
            co2EmissionsFactor: efCo2ByYear,
            ch4EmissionsFactor: efCh4ByYear,
            n2oEmissionsFactor: efN2oByYear,
            combinedEmissionsFactor: emissionsFactorByYear,
            emissions_ch4_yearly,
            emissions_n2o_yearly,
            emissions_yearly,
            production,
            weighted_avg_yield,
          };
        })
      );
    } catch (e) {
      this.logger.error(`listId: ${listId} , pageNumber: ${pageNumber} error: ${e}`);
      return [];
    }
  }
}
