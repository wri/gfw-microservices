import { ClientStoreConnection, GHGAnalyses, Lists } from '@wri-monorepos/sql';
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
      const ListRepository = await connection.getRepository(Lists);
      const { listName, Commodity, listTableName } = await ListRepository.findOne({
        where: { id: listId },
      });

      const offset = pageNumber * rowsPerPage;

      const sql = `
          SELECT ghg.list_id as listId, ghg.location_id as locationId, ghg.total_area_ha as totalAreaHa, ghg.status_code as statusCode, ghg.location_error as locationError, ghg.emissions_factor_by_year as emissionsFactorByYear, ghg.ef_co2_by_year as efCo2ByYear, ghg.ef_ch4_by_year as efCh4ByYear, ghg.ef_n2o_by_year as efN2oByYear, o.[Location Name] AS locationName 
          FROM GHGAnalyses ghg 
          INNER JOIN [${listTableName}] o ON ghg.location_id = o.location_id
          WHERE ghg.list_id = ${listId}
          ORDER BY ghg.list_id
          OFFSET ${offset} ROWS
          FETCH NEXT ${rowsPerPage} ROWS ONLY;
        `;
      const data = await connection.query(sql);

      return data.map((item) => {
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
        } = item;
        return {
          listId,
          listName,
          locationName,
          totalAreaHa,
          statusCode,
          locationError,
          commodity: Commodity,
          co2EmissionsFactor: efCo2ByYear,
          ch4EmissionsFactor: efCh4ByYear,
          n2oEmissionsFactor: efN2oByYear,
          combinedEmissionsFactor: emissionsFactorByYear,
        };
      });
    } catch (e) {
      this.logger.error(`listId: ${listId} , pageNumber: ${pageNumber} error: ${e}`);
      return [];
    }
  }
}
