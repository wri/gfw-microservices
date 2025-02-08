import { ClientStoreConnection, GHGAnalyses, Lists } from '@wri-monorepos/sql';
import { Injectable, Logger } from '@nestjs/common';

interface GHGAnalysisData {
  listId: number;
  listName: string;
  locationId: number;
  totalAreaHA: number;
  statusCode: number;
  locationError: string;
  commodity: string;
  emissionsFactorByYear: string;
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

    const quantity = await ghgRepository.count({
      where: { listId },
      take: rowsPerPage,
    });

    return {
      id: listId,
      quantity,
    };
  }

  async getGHGDataPerPage(listId: number, queryParam): Promise<GHGAnalysisData[]> {
    const { clientDatabase, rowsPerPage = 50, pageNumber = 0 } = queryParam;
    this.logger.log(`Get GHG Data Per Page for listId: ${listId}`);

    const connection = await this.clientStoreConnection.getConnection(clientDatabase);
    const ghgRepository = await connection.getRepository(GHGAnalyses);

    const [data, total] = await ghgRepository.findAndCount({
      where: { listId: Number(listId) },
      skip: pageNumber * rowsPerPage,
      take: rowsPerPage,
    });

    const ListRepository = await connection.getRepository(Lists);
    const { listName, Commodity } = await ListRepository.findOne({ where: { id: listId } });

    return data.map((item) => {
      const { listId, locationId, totalAreaHA, statusCode, locationError, emissionsFactorByYear } =
        item;
      return {
        listId,
        listName,
        locationId,
        totalAreaHA,
        statusCode,
        locationError,
        commodity: Commodity,
        emissionsFactorByYear,
      };
    });
  }
}
