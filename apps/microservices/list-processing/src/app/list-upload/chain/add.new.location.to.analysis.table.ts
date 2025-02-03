import { Logger } from '@nestjs/common';
import { AbstractHandler, RequestNewList } from './types';
import { ChainType } from './types';
import {
  AnalysisSchema,
  ClientStoreConnection,
  ListSchema,
  ListSchemaType,
} from '@wri-monorepos/sql';
import { DataSource, EntitySchema } from 'typeorm';

const BATCH_SIZE = 1000;

export class AddMewLocationToAnalysisTable extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(AddMewLocationToAnalysisTable.name);

  private clientStoreConnection: ClientStoreConnection;

  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  async handle(request: ChainType): Promise<ChainType> {
    this.logger.log('add new locations to the analysis table');

    const { organization_database: organizationDatabase, listTable } =
      request.request as RequestNewList;
    const AnalysisEntity = new EntitySchema<ListSchemaType>({
      ...AnalysisSchema,
      name: listTable,
    });

    const connection = await this.clientStoreConnection.getConnection(organizationDatabase, [
      AnalysisEntity,
    ]);

    const locationIds = await this.getAllLocationIds(request);

    const dataToInsert = locationIds.map((locationId) => {
      return {
        locationId,
        locationStatusId: 1,
      };
    });

    try {
      for (let i = 0; i < dataToInsert.length; i += BATCH_SIZE) {
        const batch = dataToInsert.slice(i, i + BATCH_SIZE);

        await this.insertBatch(connection, AnalysisEntity, batch);
      }

      return super.handle(request);
    } catch (error) {
      throw new Error(`Failed to handle input: ${error.message}`);
    }
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

  async getAllLocationIds(request: ChainType) {
    const { organization_database: organizationDatabase, listTable } =
      request.request as RequestNewList;
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTable,
    });

    await this.clientStoreConnection.clearCache(process.env.MSSQL_HOSTNAME + organizationDatabase);
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);
    const ids = await connection
      .createQueryBuilder()
      .select('list.locationId')
      .from(ListEntity, 'list')
      .getMany();

    // Extracting the locationIds from the result
    return ids.map((entity) => entity.locationId);
  }
}
