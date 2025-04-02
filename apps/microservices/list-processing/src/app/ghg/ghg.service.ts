import {
  ClientStoreConnection,
  GHGAnalyses,
  Lists,
  ListSchema,
  ListSchemaType,
} from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';
import { EntitySchema } from 'typeorm';

interface GHGAnalysisData {
  listId: number;
  listName: string;
  locationId: string;
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
    const ghgRepository = await connection.getRepository(GHGAnalyses);
    try {
      const [data] = await ghgRepository.findAndCount({
        where: { listId: Number(listId) },
        skip: pageNumber * rowsPerPage,
        take: rowsPerPage,
      });

      const ListRepository = await connection.getRepository(Lists);
      const { listName, Commodity, listTableName } = await ListRepository.findOne({
        where: { id: listId },
      });

      // Convert locationId into locationName
      const ListEntity = new EntitySchema<ListSchemaType>({
        ...ListSchema,
        name: listTableName,
      });

      const connectionLocationName = await this.clientStoreConnection.getConnection(
        clientDatabase,
        [ListEntity]
      );
      const listTableNameRepository = await connectionLocationName.getRepository(ListEntity);

      this.logger.log(`Getting Location Names for listId: ${listId}`);
      const locationNames = await listTableNameRepository.find({
        select: {
          locationId: true,
          locationName: true,
        },
      });

      return data.map((item) => {
        const {
          listId,
          locationId,
          totalAreaHa,
          statusCode,
          locationError,
          emissionsFactorByYear,
          efCo2ByYear,
          efCh4ByYear,
          efN2oByYear,
        } = item;
        return {
          listId,
          listName,
          locationId: this.getLocationNameById(locationNames, locationId),
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
  getLocationNameById(locations: any[], id: number): string | null {
    const matchingLocation = locations.find((loc) => loc.locationId === id);
    return matchingLocation ? matchingLocation.locationName : null;
  }
}
