import { DataSource, EntitySchema } from 'typeorm';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { FeatureCollection } from '@wri-monorepos/geo';
import { GeoJSONGeometry, stringify } from 'wellknown';
import { Logger } from '@nestjs/common';

const BATCH_SIZE = 100;

export class InsertLocationData extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(InsertLocationData.name);
  private clientStoreConnection: ClientStoreConnection;

  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
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
      throw new Error(`Failed to insert batch: ${error.message}`);
    }
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { organization_database: organizationDatabase, listTable } =
      request.request as RequestNewList;
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTable,
    });

    const connection = await this.clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);

    try {
      let features = (request.geojson as FeatureCollection).features;
      features = features.map(
        (feature, idx) => ((feature.properties.locationId = idx + 1), feature)
      );
      const values = features.map((feature) => ({
        ...feature.properties,
        geometry: stringify(feature.geometry as GeoJSONGeometry),
      }));

      for (let i = 0; i < values.length; i += BATCH_SIZE) {
        const batch = values.slice(i, i + BATCH_SIZE);
        await this.insertBatch(connection, ListEntity, batch);
      }

      return super.handle(request);
    } catch (error) {
      throw new Error(`Failed to handle input: ${error.message}`);
    }
  }
}
