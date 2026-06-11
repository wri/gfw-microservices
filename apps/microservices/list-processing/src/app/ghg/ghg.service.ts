import {
  ClientStoreConnection,
  GHGAnalyses,
  GHGAnalysisDataByListId,
  Lists,
} from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';

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
      const listRepository = await connection.getRepository(Lists);
      const { listName, listTableName, Commodity } = await listRepository.findOne({
        where: { id: listId },
      });

      // The location-level columns live on a per-list table whose name is stored
      // in Lists.list_table_name, so it has to be joined by its raw table name.
      // Wrapping in a subquery avoids TypeORM misinterpreting "dbo" as an alias.
      const data = await connection
        .getRepository(GHGAnalyses)
        .createQueryBuilder('ghg')
        .innerJoin(
          `(SELECT * FROM dbo.[${listTableName}])`,
          'lt',
          'lt.location_id = ghg.location_id'
        )
        .select('ghg.listId', 'listId')
        .addSelect('lt.Country', 'country')
        .addSelect('lt.State', 'state')
        .addSelect('lt.[Sub State]', 'subState')
        .addSelect('lt.[Location Name]', 'locationName')
        .addSelect('ghg.totalAreaHa', 'totalAreaHa')
        .addSelect('ghg.statusCode', 'statusCode')
        .addSelect('ghg.locationError', 'locationError')
        .addSelect('ghg.emissionsFactorByYear', 'emissionsFactorByYear')
        .addSelect('ghg.efCo2ByYear', 'efCo2ByYear')
        .addSelect('ghg.efCh4ByYear', 'efCh4ByYear')
        .addSelect('ghg.efN2oByYear', 'efN2oByYear')
        .addSelect('ghg.emissionsCo2Yearly', 'emissionsCo2Yearly')
        .addSelect('ghg.emissionsCh4Yearly', 'emissionsCh4Yearly')
        .addSelect('ghg.emissionsN2oYearly', 'emissionsN2oYearly')
        .addSelect('ghg.emissionsYearly', 'emissionsYearly')
        .addSelect('ghg.production', 'production')
        .addSelect('ghg.weightedAvgYield', 'weightedAvgYield')
        .where('ghg.locationId > 0')
        .andWhere('ghg.listId = :listId', { listId })
        .orderBy('ghg.locationId', 'ASC')
        .offset(pageNumber * rowsPerPage)
        .limit(rowsPerPage)
        .getRawMany<GHGAnalysisDataByListId>();

      return data.map((item) => ({
        listId: item.listId,
        listName,
        country: item.country,
        state: item.state,
        subState: item.subState,
        locationName: item.locationName,
        totalAreaHa: item.totalAreaHa,
        statusCode: item.statusCode,
        locationError: item.locationError,
        commodity: Commodity,
        co2EmissionsFactor: item.efCo2ByYear,
        ch4EmissionsFactor: item.efCh4ByYear,
        n2oEmissionsFactor: item.efN2oByYear,
        combinedEmissionsFactor: item.emissionsFactorByYear,
        emissionsCh4Yearly: item.emissionsCh4Yearly,
        emissionsN2oYearly: item.emissionsN2oYearly,
        emissionsCo2Yearly: item.emissionsCo2Yearly,
        emissionsYearly: item.emissionsYearly,
        production: item.production,
        weightedAvgYield: item.weightedAvgYield,
      }));
    } catch (e) {
      this.logger.error(`listId: ${listId} , pageNumber: ${pageNumber} error: ${e}`);
      return [];
    }
  }
}
