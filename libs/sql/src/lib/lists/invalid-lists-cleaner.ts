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
  organizationDbName: string;
  listId?: number;
  isDryRun?: boolean;
}

export async function deleteListsWithInvalidLocationId(
  params: InvalidListsCleanerArgs
): Promise<void> {
  const { organizationDbName, listId, isDryRun = true } = params;

  const conn = await new ClientStoreConnection().getConnection(organizationDbName);
  const queryRunner = conn.createQueryRunner();
  await queryRunner.connect();

  try {
    const listsRepo = queryRunner.manager.getRepository(Lists);

    const listName = await listsRepo.findOne({
      where: { id: listId },
      select: ['listName'],
    });

    const dynamicTableName = `list-${listName}`;

    const nullCountQueryResult = await queryRunner.query(`
      SELECT COUNT(*) as count FROM [${dynamicTableName}]
      WHERE location_id IS NULL
    `);

    const nullCount = parseInt(nullCountQueryResult[0]?.count ?? '0');

    const dupCountResult = await queryRunner.query(`
      SELECT COUNT(*) as count FROM (
        SELECT location_id FROM [${dynamicTableName}]
        WHERE location_id IS NOT NULL
        GROUP BY location_id
        HAVING COUNT(*) > 1
      ) dup
    `);

    const dupCount = parseInt(dupCountResult[0]?.count ?? '0');

    const fullTableName = `[${organizationDbName}].[${dynamicTableName}]`;
    if (nullCount === 0 && dupCount === 0) {
      logger.log(`List ${fullTableName} is clean`);
      return;
    }

    const issues = [];
    if (nullCount > 0) {
      issues.push(`${nullCount} NULLs`);
    }
    if (dupCount > 0) {
      issues.push(`${dupCount} duplicates`);
    }
    const reason = issues.join(', ');

    if (isDryRun) {
      logger.warn(`(Dry Run) Would delete ${fullTableName}: (${reason})`);
    } else {
      logger.warn(`Deleting ${fullTableName}: (${reason})`);
      await queryRunner.query(`DROP TABLE [${dynamicTableName}]`);
      await listsRepo.delete({ id: listId }); // Remove from Lists table too
    }
  } catch (error) {
    logger.error(
      `Error processing malformed lists in ${organizationDbName}: ${error.message}`,
      error.stack
    );
    throw error;
  } finally {
    await queryRunner.release();
  }
}
