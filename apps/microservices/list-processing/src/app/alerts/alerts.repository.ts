import { Inject, Injectable } from '@nestjs/common';
import { ClientStoreConnection, AnalysisDashboard } from '@wri-monorepos/sql';

@Injectable()
export class AlertsRepository {
  @Inject(ClientStoreConnection)
  private readonly clientStoreConnection: ClientStoreConnection;

  private async createOrganizationConnection(organizationDb: string) {
    return await this.clientStoreConnection.getConnection(organizationDb);
  }

  async findAndCount(clientDatabase: string, options: Record<string, unknown>) {
    const connection = await this.createOrganizationConnection(clientDatabase);

    const analysesDashboardRepository = connection.getRepository(AnalysisDashboard);

    const result = await analysesDashboardRepository.findAndCount(options);

    return result;
  }
}
