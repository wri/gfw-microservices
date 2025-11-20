import { DataSource, EntitySchema } from 'typeorm';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { yieldIfLong } from './shared';

const BATCH_SIZE = 80;

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

    const connection = await this.clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);

    this.convertErrorDetails(values);

    try {
      let lastYieldTimestamp = Date.now();
      for (let i = 0; i < values.length; i += BATCH_SIZE) {
        const batch = values.slice(i, i + BATCH_SIZE);

        await this.insertBatch(connection, ListEntity, batch);
        lastYieldTimestamp = await yieldIfLong(lastYieldTimestamp);
      }

      return request;
    } catch (error) {
      throw new Error(`Failed to handle input: ${error.stack || error}`);
    }
  }
}
