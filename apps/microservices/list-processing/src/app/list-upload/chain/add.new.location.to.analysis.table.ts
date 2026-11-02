import { Logger } from '@nestjs/common';
import { AbstractHandler, RequestNewList } from './types';
import { ChainType } from './types';
import { AnalysisSchema, AnalysisSchemaType, ClientStoreConnection } from '@wri-monorepos/sql';
import { DataSource, EntitySchema } from 'typeorm';
import { runBatchedInsertWithKeepAlive, yieldIfLong } from './shared';

const BATCH_SIZE = 1000;

export class AddNewLocationToAnalysisTable extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(AddNewLocationToAnalysisTable.name);

  private clientStoreConnection: ClientStoreConnection;

  constructor(clientStoreConnection: ClientStoreConnection = new ClientStoreConnection()) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { organization_database: organizationDatabase, analysisTable } =
      request.request as RequestNewList;

    this.logger.log('add new locations to the analysis table');

    const AnalysisEntity = new EntitySchema<AnalysisSchemaType>({
      ...AnalysisSchema,
      name: analysisTable,
    });

    const dataToInsert = request.geojson.features
      .filter(({ properties }) => properties?.locationId !== undefined)
      .map(({ properties }) => {
        const { locationId } = properties;
        return {
          locationId,
          locationStatusId: 1,
        };
      });

    const batches: Record<string, unknown>[][] = [];
    for (let i = 0; i < dataToInsert.length; i += BATCH_SIZE) {
      batches.push(dataToInsert.slice(i, i + BATCH_SIZE));
    }

    try {
      let lastYieldTimestamp = Date.now();
      await runBatchedInsertWithKeepAlive({
        clientStoreConnection: this.clientStoreConnection,
        organizationDatabase,
        entity: AnalysisEntity,
        batches,
        insertBatch: (connection, batch) => this.insertBatch(connection, AnalysisEntity, batch),
        onBatchComplete: async () => {
          lastYieldTimestamp = await yieldIfLong(lastYieldTimestamp);
        },
        logger: this.logger,
      });

      return request;
    } catch (error) {
      Logger.error(
        `Error during insert ${analysisTable}: ${error.stack || error.message || error}`
      );
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
}
