import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';

export class WriteLocationCount extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(WriteLocationCount.name);
  private clientStoreConnection: ClientStoreConnection;
  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { organization_database, listId } = request.request as RequestNewList;

    // Calculate the number of valid features
    const listSize =
      request.geojson.features?.filter(
        (feature) => !feature?.properties?.error && feature?.properties?.gadmid
      ).length || 0;

    let connection;

    try {
      connection = await this.clientStoreConnection.getConnection(organization_database);
      const listRepository = connection.getRepository(Lists);

      // Update the list's location count
      await listRepository.update({ id: listId }, { listLocationsCount: listSize });

      this.logger.log(`Updated list ${listId} with ${listSize} locations.`);
    } catch (error) {
      this.logger.error(`Failed to update list ${listId}: ${error.message}`);
      throw error; // Re-throw the error after logging
    } finally {
      if (connection) {
        await connection.close(); // Ensure the connection is closed
      }
    }

    return request;
  }
}
