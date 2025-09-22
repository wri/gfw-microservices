import { Logger } from '@nestjs/common';

const logger = new Logger('Location ID Primary Key Converter');

import {
  createConnectedQueryRunner,
  getListsRepo,
  fetchList,
  logMissingTableWarning,
  logUnhandledListError,
  shouldSkipDueToMissingTable,
} from './converter-helpers';

interface ConverterParams {
  clientDb: string;
  listId: number;
  isDryRun?: boolean;
}

export async function addPrimaryKeyOnLocationId({
  clientDb: organizationDbName,
  listId,
  isDryRun = false,
}: ConverterParams): Promise<void> {
  const queryRunner = await createConnectedQueryRunner(organizationDbName);
  let listTableName: string | undefined;
  let analysisTableName: string | undefined;

  try {
    const listsRepo = getListsRepo(queryRunner);
    ({ listTableName, listAnalysisTableName: analysisTableName } = await fetchList(
      listsRepo,
      ['listTableName', 'listAnalysisTableName'],
      listId
    ));

    if (!listTableName || !analysisTableName) {
      logger.warn(`Skipping listId ${listId} in ${organizationDbName}: missing table names`);
      return;
    }

    const tables = [listTableName, analysisTableName];

    for (const tableName of tables) {
      const pkName = `PK_${tableName.replace(/-/g, '_')}_location_id`;
      const fullTableName = `[${organizationDbName}].[${tableName}]`;

      // 1. Check table exists
      const tableExists = await queryRunner.query(`
        SELECT 1 FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='${tableName}'
      `);
      if (!tableExists.length) {
        logger.warn(`Skipping ${fullTableName}: table does not exist`);
        continue;
      }

      // 2. Check for null location_id
      const nullCountRes = await queryRunner.query(
        `SELECT COUNT(*) AS count FROM [${tableName}] WHERE location_id IS NULL`
      );
      const nullCount = parseInt(nullCountRes?.[0]?.count ?? '0', 10);
      if (nullCount > 0) {
        logger.warn(`Skipping ${fullTableName}: ${nullCount} NULL location_id values`);
        continue;
      }

      // 3. Check for duplicate location_id
      const dupCountRes = await queryRunner.query(`
        SELECT COUNT(*) AS count FROM (
          SELECT location_id FROM [${tableName}]
          GROUP BY location_id
          HAVING COUNT(*) > 1
        ) dup
      `);
      const dupCount = parseInt(dupCountRes?.[0]?.count ?? '0', 10);
      if (dupCount > 0) {
        logger.warn(`Skipping ${fullTableName}: ${dupCount} duplicate location_id values`);
        continue;
      }

      // 4. Check if PK already exists
      const pkExistsRes = await queryRunner.query(`
        SELECT 1
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_NAME='${tableName}' AND CONSTRAINT_TYPE='PRIMARY KEY'
      `);
      if (pkExistsRes.length) {
        logger.warn(`Skipping ${fullTableName}: PK already exists`);
        continue;
      }

      // 5. Apply PK if not dry run
      const alterSql = `ALTER TABLE [${tableName}] ADD CONSTRAINT ${pkName} PRIMARY KEY (location_id)`;
      if (isDryRun) {
        logger.log(`[DryRun] Would run: ${alterSql}`);
      } else {
        try {
          await queryRunner.query(alterSql);
          logger.log(`Added PK on location_id for ${fullTableName}`);
        } catch (err) {
          const msg = `Failed to add PK on ${fullTableName} using SQL "${alterSql}": ${
            (err as Error).message
          }`;
          logger.error(msg);
          throw err;
        }
      }
    }
  } catch (error) {
    if (shouldSkipDueToMissingTable({ error, listTableName })) {
      logMissingTableWarning({ listId, listTableName, dbName: organizationDbName });
      return;
    }

    logUnhandledListError({
      error,
      dbName: organizationDbName,
      context: 'add PK on location_id',
    });
    throw error;
  } finally {
    await queryRunner.release();
  }
}
