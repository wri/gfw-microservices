import { Logger } from '@nestjs/common';
import { AbstractHandler, RequestNewList } from './types';
import { ChainType } from './types';
import {
  AnalysisSchema,
  AnalysisSchemaType,
  ClientStoreConnection,
  ListSchema,
  ListSchemaType,
} from '@wri-monorepos/sql';
import { DataSource, EntitySchema } from 'typeorm';

const BATCH_SIZE = 1000;

export class AddNewLocationToAnalysisTable extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(AddNewLocationToAnalysisTable.name);

  private clientStoreConnection: ClientStoreConnection;

  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  async handle(request: ChainType): Promise<ChainType> {
    this.logger.log('add new locations to the analysis table');

    const { organization_database: organizationDatabase, analysisTable } =
      request.request as RequestNewList;
    const AnalysisEntity = new EntitySchema<AnalysisSchemaType>({
      ...AnalysisSchema,
      name: analysisTable,
    });

    const locationIds = await this.getAllLocationIds(request);

    const connection = await this.clientStoreConnection.getConnection(organizationDatabase, [
      AnalysisEntity,
    ]);

    const dataToInsert = locationIds.map((locationId) => ({
      locationId,
      locationStatusId: 1,
    }));

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

  /**
   *  To improve performance we could run the query at once with all values.
   *
   *
   * INSERT INTO [{ANALYSIS_TABLE}](location_id, location_status_id)
   * SELECT location_id, 1
   * FROM [{LIST_TABLE}]
   * WHERE location_id > 0
   */

  async insertBatch(
    connection: DataSource,
    analysisEntity: EntitySchema<AnalysisSchemaType>,
    batch: Record<string, unknown>[]
  ): Promise<void> {
    const values = batch.map((item) => `(${item.locationId}, ${item.locationStatusId})`).join(', ');

    const sql = `
      INSERT INTO [${analysisEntity.options.name}] (location_id, location_status_id)
      VALUES ${values}
    `;

    await connection.query(sql);
  }

  async getAllLocationIds(request: ChainType) {
    const { organization_database: organizationDatabase, listTable } =
      request.request as RequestNewList;
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTable,
    });

    const connection = await this.clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);
    const ids = await connection
      .createQueryBuilder()
      .select('list.locationId')
      .from(ListEntity, 'list')
      .getRawMany();

    // Extracting the locationIds from the result
    return ids.map((entity) => entity.list_location_id);
  }
}
