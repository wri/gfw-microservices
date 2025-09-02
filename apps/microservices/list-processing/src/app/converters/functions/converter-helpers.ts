import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ClientStoreConnection } from '@wri-monorepos/sql';
import { Lists } from '@wri-monorepos/sql';

const logger = new Logger('Converter');

/**
 * Creates a connected query runner for the specified client database.
 * @param clientDb - The name of the client database
 * @returns A connected query runner
 */
export const createConnectedQueryRunner = async (clientDb: string) => {
  const conn = await new ClientStoreConnection().getConnection(clientDb);
  const queryRunner = conn.createQueryRunner();
  await queryRunner.connect();
  return queryRunner;
};

/**
 * Gets the Lists repository from the query runner.
 * @param queryRunner
 * @returns
 */
export const getListsRepo = (queryRunner: any): Repository<Lists> => {
  return queryRunner.manager.getRepository(Lists);
};

/**
 * Fetches a list record from the Lists repository.
 * @param listsRepo - The Lists repository
 * @param fields - The fields to select
 * @param listId - The ID of the list to fetch
 * @returns The fetched list record
 */
export const fetchList = async (
  listsRepo: Repository<Lists>,
  fields: (keyof Lists)[],
  listId?: number
): Promise<Lists> => {
  const record = await listsRepo.findOne({ where: { id: listId }, select: fields });
  if (!record) {
    throw new Error(`No list found for ID: ${listId}`);
  }
  return record;
};

/**
 * Determines if the error indicates a missing table.
 * @param error - The error to check
 * @param listTableName - The name of the list table
 * @returns True if the error indicates a missing table, false otherwise
 */
export const shouldSkipDueToMissingTable = ({
  error,
  listTableName,
}: {
  error: unknown;
  listTableName?: string;
}): boolean => {
  const msg = (error as Error)?.message ?? '';
  return (
    typeof listTableName === 'string' &&
    msg.includes('Invalid object name') &&
    msg.includes(listTableName)
  );
};

/**
 * Logs a deletion message with optional reason.
 * @param isDryRun - Whether this is a dry run
 * @param fullTableName - The full name of the table being deleted
 * @param reason - Optional reason for deletion
 */
export const logDeletionMessage = (isDryRun: boolean, fullTableName: string, reason?: string) => {
  const action = `⚠️ ${isDryRun ? '(Dry Run) Would delete' : 'Deleting'}`;
  const msg = reason
    ? `${action} ${fullTableName}: (${reason.trim()})`
    : `${action} ${fullTableName}`;
  logger.warn(msg);
};

/**
 * Logs a warning for lists with missing tables.
 * @param listId - The ID of the list
 * @param listTableName - The name of the list table
 * @param dbName - The name of the database
 */
export const logMissingTableWarning = ({
  listId,
  listTableName,
  dbName,
}: {
  listId?: number;
  listTableName?: string;
  dbName: string;
}) => {
  logger.warn(`⚠️ Skipping list ID ${listId} — table ${listTableName} does not exist in ${dbName}`);
};

/**
 * Logs an error message for unhandled list errors.
 * @param error - The error to log
 * @param dbName - The name of the database
 * @param context - The context in which the error occurred
 */
export const logUnhandledListError = ({
  error,
  dbName,
  context,
}: {
  error: unknown;
  dbName: string;
  context: string;
}) => {
  const err = error as Error;
  logger.error(
    `❌ Error processing ${context} in ${dbName}: ${err.message}`,
    err.stack ?? String(error)
  );
};
