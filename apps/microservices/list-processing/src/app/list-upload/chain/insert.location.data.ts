import { EntitySchema } from 'typeorm';
import { AbstractHandler, ChainType } from './types';
import { ClientStoreConnection, ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { FeatureCollection } from '@wri-monorepos/geo';

const BATCH_SIZE = 1000;

export class InsertLocationData extends AbstractHandler<ChainType> {
  async handle(input: ChainType): Promise<void> {
    const { organization_database: organizationDatabase, listTable } = input.request;
    const clientStoreConnection = new ClientStoreConnection();
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTable,
    });
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);

    const features = (input.geojson as FeatureCollection).features;
    const values = features.map((feature) => ({
      ...feature.properties,
    }));

    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      const batch = values.slice(i, i + BATCH_SIZE);
      await connection.createQueryBuilder().insert().into(ListEntity).values(batch).execute();
    }
  }
}
