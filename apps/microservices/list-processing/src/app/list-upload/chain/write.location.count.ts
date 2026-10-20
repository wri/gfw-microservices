/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { getTotalLocationCount } from '../shared/list.utils';

export class WriteLocationCount extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(WriteLocationCount.name);
  private clientStoreConnection: ClientStoreConnection;
  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { organization_database, list_id: listId } = request.request as RequestNewList;

    // Calculate the number of valid features
    const listSize =
      request.geojson.features?.filter(
        (feature) => !feature?.properties?.errorDetails && feature?.properties?.gadmid
      ).length || 0;

    try {
      const connection = await this.clientStoreConnection.getConnection(organization_database);
      const listRepository = connection.getRepository(Lists);

      const listLocationsCount = await getTotalLocationCount(
        this.clientStoreConnection,
        organization_database,
        listId
      );
      const totalLocations = (listLocationsCount || 0) + listSize;

      // Update the list's location count
      await listRepository.update({ id: listId }, { listLocationsCount: totalLocations });

      this.logger.log(`Updated list ${listId} with ${totalLocations} locations.`);
    } catch (error) {
      this.logger.error(`Failed to update list ${listId}: ${error.message}`);
      throw error; // Re-throw the error after logging
    }

    return request;
  }
}
