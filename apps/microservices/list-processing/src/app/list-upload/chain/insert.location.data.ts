import { DataSource, EntitySchema } from 'typeorm';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { runBatchedInsertWithKeepAlive, yieldIfLong } from './shared';

const BATCH_SIZE = 50;

export class InsertLocationData extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(InsertLocationData.name);
  private clientStoreConnection: ClientStoreConnection;

  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  private convertErrorDetails(locations) {
    return locations.map((location) => {
      if (location && Array.isArray(location.errorDetails)) {
        const uniqueErrors = new Set(location.errorDetails);
        location.errorDetails = Array.from(uniqueErrors);
        location.errorDetails = location.errorDetails.join('; ');
      }
      return location;
    });
  }

  private async insertBatch(
    connection: DataSource,
    ListEntity: EntitySchema<ListSchemaType>,
    batch: Record<string, unknown>[]
  ): Promise<void> {
    try {
      await connection
        .createQueryBuilder()
        .insert()
        .into(ListEntity)
        .values(batch)
        .orIgnore()
        .execute();
    } catch (error) {
      throw new Error(`Failed to insert batch: ${error.stack || error}`);
    }
  }

  async handle(request: ChainType): Promise<ChainType> {
    const values = request.geojson.features.map((feature) => feature.properties);
    const { organization_database: organizationDatabase, listTable } =
      request.request as RequestNewList;
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTable,
    });

    this.convertErrorDetails(values);

    const batches: Record<string, unknown>[][] = [];
    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      batches.push(values.slice(i, i + BATCH_SIZE));
    }

    try {
      let lastYieldTimestamp = Date.now();
      await runBatchedInsertWithKeepAlive({
        clientStoreConnection: this.clientStoreConnection,
        organizationDatabase,
        entity: ListEntity,
        batches,
        insertBatch: (connection, batch) => this.insertBatch(connection, ListEntity, batch),
        // Yield periodically to avoid CPU overload that may trigger AWS ECS
        // health check failures.
        onBatchComplete: async () => {
          lastYieldTimestamp = await yieldIfLong(lastYieldTimestamp);
        },
        logger: this.logger,
      });

      return request;
    } catch (error) {
      throw new Error(`Failed to handle input: ${error.stack || error}`);
    }
  }
}
