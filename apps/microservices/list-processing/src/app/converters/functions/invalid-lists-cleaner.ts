/**
 * @summary deletes diferent kinds of malformed lists
 * –––––––––––––––––––––––––––––––––––––––
 * @notes
 * - deleteListsWithInvalidLocationId: Deletes lists with NULL location_id or duplicate location_id values
 * - deleteListsPartlyUpgraded: Deletes lists that are partly upgraded to version 2 with a non-zero template_id
 */
import { Logger } from '@nestjs/common';

import { Lists } from '@wri-monorepos/sql';
import {
  createConnectedQueryRunner,
  getListsRepo,
  fetchList,
  logDeletionMessage,
  logMissingTableWarning,
  logUnhandledListError,
  shouldSkipDueToMissingTable,
} from './converter-helpers';

const logger = new Logger('Invalid Lists Converter');

interface InvalidListsCleanerArgs {
  clientDb: string;
  listId?: number;
  isDryRun?: boolean;
}

/**
 * Deletes lists with invalid location_id values:
 * - NULL location_id
 * - Duplicate location_id values
 */
export async function deleteListsWithInvalidLocationId(
  params: InvalidListsCleanerArgs
): Promise<void> {
  const { clientDb: organizationDbName, listId, isDryRun = false } = params;
  const queryRunner = await createConnectedQueryRunner(organizationDbName);
  let listTableName: string | undefined;

  const parseCount = (result: unknown): number => parseInt(result?.[0]?.count ?? '0', 10);

  const buildNullCountQuery = (tableName: string) =>
    `SELECT COUNT(*) as count FROM [${tableName}] WHERE location_id IS NULL`;

  const buildDuplicateCountQuery = (tableName: string) => `
    SELECT COUNT(*) as count FROM (
      SELECT location_id FROM [${tableName}]
      WHERE location_id IS NOT NULL
      GROUP BY location_id
      HAVING COUNT(*) > 1
    ) dup
  `;

  try {
    const listsRepo = getListsRepo(queryRunner);
    ({ listTableName } = await fetchList(listsRepo, ['listTableName'], listId));
    const fullTableName = `[${organizationDbName}].[${listTableName}]`;

    const nullCount = parseCount(await queryRunner.query(buildNullCountQuery(listTableName)));
    const dupCount = parseCount(await queryRunner.query(buildDuplicateCountQuery(listTableName)));

    if (!nullCount && !dupCount) {
      logger.log(`List ${fullTableName} is clean`);
      return;
    }

    const issues = [];
    if (nullCount) {
      issues.push(`${nullCount} NULLs`);
    }
    if (dupCount) {
      issues.push(`${dupCount} duplicates`);
    }

    logDeletionMessage(isDryRun, fullTableName, issues.join(', '));

    if (!isDryRun) {
      await queryRunner.query(`DROP TABLE [${listTableName}]`);
      await listsRepo.delete({ id: listId });
    }
  } catch (error) {
    if (shouldSkipDueToMissingTable({ error, listTableName })) {
      logMissingTableWarning({ listId, listTableName, dbName: organizationDbName });
      return;
    }

    logUnhandledListError({
      error,
      dbName: organizationDbName,
      context: 'malformed lists',
    });
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Deletes lists that are partly upgraded to version 2 with a non-zero template_id.
 * These lists are considered invalid.
 */
export async function deleteListsPartlyUpgraded(params: InvalidListsCleanerArgs): Promise<void> {
  const { clientDb: organizationDbName, listId, isDryRun = false } = params;
  const queryRunner = await createConnectedQueryRunner(organizationDbName);
  let listTableName: string | undefined;

  try {
    const listsRepo = queryRunner.manager.getRepository(Lists);
    const list = await fetchList(listsRepo, ['listTableName', 'templateId', 'version'], listId);
    listTableName = list.listTableName;
    const { templateId, version } = list;
    const fullTableName = `[${organizationDbName}].[${listTableName}]`;

    const isPartlyUpgraded = templateId !== 0 && version === 2;
    if (!isPartlyUpgraded) {
      logger.log(`List ${fullTableName} is not partly upgraded to version 2`);
      return;
    }

    logDeletionMessage(isDryRun, fullTableName, `template_id=${templateId}, version=${version}`);

    if (!isDryRun) {
      // Delete dependent rows in FolderItems
      await queryRunner.query(`DELETE FROM [FolderItems] WHERE list_id = @0`, [listId]);

      // Delete the associated list table and then the list itself
      await queryRunner.query(`DROP TABLE [${listTableName}]`);
      await listsRepo.delete({ id: listId });
    }
  } catch (error) {
    if (shouldSkipDueToMissingTable({ error, listTableName })) {
      logMissingTableWarning({ listId, listTableName, dbName: organizationDbName });
      return;
    }

    logUnhandledListError({
      error,
      dbName: organizationDbName,
      context: 'partly-upgraded v2 lists',
    });
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Deletes lists with missing list-xxxxx tables.
 * If the list's table does not exist, the list is deleted from the Lists table.
 */
export async function deleteListsWithMissingTables(params: InvalidListsCleanerArgs): Promise<void> {
  const { clientDb: organizationDbName, listId, isDryRun = false } = params;
  const queryRunner = await createConnectedQueryRunner(organizationDbName);
  let listTableName: string | undefined;

  try {
    const listsRepo = getListsRepo(queryRunner);
    const list = await fetchList(listsRepo, ['listTableName'], listId);
    listTableName = list.listTableName;
    const fullTableName = `[${organizationDbName}].[${listTableName}]`;

    if (!listTableName) {
      logger.warn(`⚠️ List ID ${listId} has no listTableName. Skipping.`);
      return;
    }

    // Check if the list table exists
    const checkQuery = `SELECT OBJECT_ID('${listTableName}', 'U') AS object_id`;
    const result = await queryRunner.query(checkQuery);
    const objectId = result?.[0]?.object_id;

    if (objectId) {
      logger.log(`✅ Table ${fullTableName} exists; No action needed.`);
      return;
    }

    logDeletionMessage(
      isDryRun,
      fullTableName,
      `list ID ${listId} — table ${listTableName} does not exist in ${organizationDbName}`
    );

    if (!isDryRun) {
      // If the table does not exist, delete the list from the Lists table
      await listsRepo.delete({ id: listId });
    }
  } catch (error) {
    logger.error(
      `❌ Error processing missing list tables cleaner in ${organizationDbName}: ${
        (error as Error).message
      }`,
      (error as Error).stack ?? String(error)
    );
    throw error;
  } finally {
    await queryRunner.release();
  }
}
