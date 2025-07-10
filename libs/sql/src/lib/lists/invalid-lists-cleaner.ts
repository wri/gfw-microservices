/**
 * @summary deletes diferent kinds of malformed lists
 * –––––––––––––––––––––––––––––––––––––––
 * @notes
 * - deleteListsWithInvalidLocationId: Deletes lists with NULL location_id or duplicate location_id values
 * - deleteListsWithInvalidCommodityOrTemplate: Deletes lists that are partly upgraded to version 2 with a non-zero template_id
 */
import { Logger } from '@nestjs/common';
import { ClientStoreConnection } from '../util';
import { Lists } from '../entity';
import { Repository } from 'typeorm';

const logger = new Logger('Malformed Lists Converter');

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
export async function deleteListsWithInvalidCommodityOrTemplate(
  params: InvalidListsCleanerArgs
): Promise<void> {
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
 * Helper function to run both clean-up functions
 */
async function createConnectedQueryRunner(clientDb: string) {
  const conn = await new ClientStoreConnection().getConnection(clientDb);
  const queryRunner = conn.createQueryRunner();
  await queryRunner.connect();
  return queryRunner;
}

function getListsRepo(queryRunner: any): Repository<Lists> {
  return queryRunner.manager.getRepository(Lists);
}

function logDeletionMessage(isDryRun: boolean, fullTableName: string, reason?: string) {
  const action = isDryRun ? '(Dry Run) Would delete' : 'Deleting';
  const msg = reason
    ? `${action} ${fullTableName}: (${reason.trim()})`
    : `${action} ${fullTableName}`;
  logger.warn(msg);
}

async function fetchList(
  listsRepo: Repository<Lists>,
  fields: (keyof Lists)[],
  listId?: number
): Promise<Lists> {
  const record = await listsRepo.findOne({ where: { id: listId }, select: fields });
  if (!record) {
    throw new Error(`No list found for ID: ${listId}`);
  }
  return record;
}

function shouldSkipDueToMissingTable({
  error,
  listTableName,
}: {
  error: unknown;
  listTableName?: string;
}): boolean {
  const msg = (error as Error)?.message ?? '';
  return (
    typeof listTableName === 'string' &&
    msg.includes('Invalid object name') &&
    msg.includes(listTableName)
  );
}

function logMissingTableWarning({
  listId,
  listTableName,
  dbName,
}: {
  listId?: number;
  listTableName?: string;
  dbName: string;
}) {
  logger.warn(`Skipping list ID ${listId} — table ${listTableName} does not exist in ${dbName}`);
}

function logUnhandledListError({
  error,
  dbName,
  context,
}: {
  error: unknown;
  dbName: string;
  context: string;
}) {
  const err = error as Error;
  logger.error(
    `Error processing ${context} in ${dbName}: ${err.message}`,
    err.stack ?? String(error)
  );
}
