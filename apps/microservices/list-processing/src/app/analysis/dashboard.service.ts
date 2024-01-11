import { Injectable } from '@nestjs/common';
import { ClientStoreConnection, AnalysisDashboard } from '@wri-monorepos/sql';
import { In } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private readonly clientStoreConnection: ClientStoreConnection) {}

  private async createOrganizationConnection(organizationDb: string) {
    return await this.clientStoreConnection.getConnection(organizationDb);
  }

  async getDashboardData(
    listId: number,
    locationIdArray: Array<number>,
    clientDatabase: string,
    pageNumber = 1,
    pageSize = 10
  ) {
    const connection = await this.createOrganizationConnection(clientDatabase);

    const analysesDashboardRepository = connection.getRepository(AnalysisDashboard);

    const whereClause =
      locationIdArray.length > 0
        ? { listId: listId, locationId: In(locationIdArray) }
        : { listId: listId };

    const [result, total] = await analysesDashboardRepository.findAndCount({
      where: whereClause,
      take: pageNumber * pageSize,
      skip: (pageNumber - 1) * pageSize,
    });

    return {
      data: result,
      count: total,
    };
  }
}
