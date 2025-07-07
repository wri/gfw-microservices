/**
 * @summary deletes diferent kinds of malformed lists

 * –––––––––––––––––––––––––––––––––––––––
 * @notes
 * - deleteListsWithInvalidLocationId: Deletes lists with NULL location_id or duplicate location_id values
 * — @note
 */

import { Logger } from '@nestjs/common';
import { ClientStoreConnection } from '../util';
import { Lists } from '../entity';

const logger = new Logger('MalformedListsCleaner');

interface InvalidListsCleanerArgs {
  clientDb: string;
  listId?: number;
  isDryRun?: boolean;
}

export async function deleteListsWithInvalidLocationId(
  params: InvalidListsCleanerArgs
): Promise<void> {
  const { clientDb: organizationDbName, listId, isDryRun = true } = params;
  const conn = await new ClientStoreConnection().getConnection(organizationDbName);
  const queryRunner = conn.createQueryRunner();
  await queryRunner.connect();

  const parseCount = (result: any): number => parseInt(result?.[0]?.count ?? '0', 10);

  const buildNullCountQuery = (table: string) =>
    `SELECT COUNT(*) as count FROM [${table}] WHERE location_id IS NULL`;

  const buildDuplicateCountQuery = (table: string) => `
    SELECT COUNT(*) as count FROM (
      SELECT location_id FROM [${table}]
      WHERE location_id IS NOT NULL
      GROUP BY location_id
      HAVING COUNT(*) > 1
    ) dup
  `;

  try {
    const listsRepo = queryRunner.manager.getRepository(Lists);
    const listRecord = await listsRepo.findOne({
      where: { id: listId },
      select: ['listTableName'],
    });

    if (!listRecord) {
      throw new Error(`No list found for ID: ${listId}`);
    }

    const dynamicTableName = listRecord.listTableName;
    const fullTableName = `[${organizationDbName}].[${dynamicTableName}]`;

    const nullCount = parseCount(await queryRunner.query(buildNullCountQuery(dynamicTableName)));
    const dupCount = parseCount(
      await queryRunner.query(buildDuplicateCountQuery(dynamicTableName))
    );

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
    const reason = issues.join(', ');

    const message = `${
      isDryRun ? '(Dry Run) Would delete' : 'Deleting'
    } ${fullTableName}: (${reason})`;
    logger.warn(message);

    if (!isDryRun) {
      await queryRunner.query(`DROP TABLE [${dynamicTableName}]`);
      await listsRepo.delete({ id: listId });
    }
  } catch (error) {
    logger.error(
      `Error processing malformed lists in ${organizationDbName}: ${error.message}`,
      (error.stack || error).toString()
    );
    throw error;
  } finally {
    await queryRunner.release();
  }
}

export async function deleteListsWithInvalidCommodityOrTemplate(
  params: InvalidListsCleanerArgs
): Promise<void> {
  const { clientDb: organizationDbName, listId, isDryRun = true } = params;
  const conn = await new ClientStoreConnection().getConnection(organizationDbName);
  const queryRunner = conn.createQueryRunner();
  await queryRunner.connect();

  try {
    const listsRepo = queryRunner.manager.getRepository(Lists);

    const listRecord = await listsRepo.findOne({
      where: { id: listId },
      select: ['listTableName', 'templateId', 'version'],
    });

    if (!listRecord) {
      throw new Error(`No list found for ID: ${listId}`);
    }

    const { listTableName, templateId, version } = listRecord;
    const fullTableName = `[${organizationDbName}].[${listTableName}]`;

    const isPartlyUpgraded = templateId !== 0 && version === 2;

    if (!isPartlyUpgraded) {
      logger.log(`List ${fullTableName} is not partly upgraded to version 2`);
      return;
    }

    const message = `${
      isDryRun ? '(Dry Run) Would delete' : 'Deleting'
    } ${fullTableName}: (template_id=${templateId}, version=${version})`;
    logger.warn(message);

    if (!isDryRun) {
      await queryRunner.query(`DROP TABLE [${listTableName}]`);
      await listsRepo.delete({ id: listId });
    }
  } catch (error) {
    logger.error(
      `Error processing partly-upgraded v2 lists in ${organizationDbName}: ${error.message}`,
      (error.stack || error).toString()
    );
    throw error;
  } finally {
    await queryRunner.release();
  }
}
