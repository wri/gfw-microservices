import { EntitySchema } from 'typeorm';
import { AbstractHandler, ChainType } from './types';
import { ClientStoreConnection, ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { FeatureCollection } from '@wri-monorepos/geo';

const BATCH_SIZE = 1000;

export class InsertLocationData extends AbstractHandler<ChainType> {
  clientStoreConnection: ClientStoreConnection;
  constructor(clientStoreConnection) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  private async insertBatch(
    connection: any,
    ListEntity: EntitySchema<ListSchemaType>,
    batch: any[]
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
      throw new Error(`Failed to insert batch: ${error.message}`);
    }
  }

  async handle(input: ChainType): Promise<void> {
    const { organization_database: organizationDatabase, listTable } = input.request;
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTable,
    });

    const connection = await this.clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);
    console.log(connection);

    try {
      const features = (input.geojson as FeatureCollection).features;
      const values = features.map((feature) => ({
        ...feature.properties,
      }));

      for (let i = 0; i < values.length; i += BATCH_SIZE) {
        const batch = values.slice(i, i + BATCH_SIZE);
        await this.insertBatch(connection, ListEntity, batch);
      }
    } catch (error) {
      throw new Error(`Failed to handle input: ${error.message}`);
    }
  }
}
