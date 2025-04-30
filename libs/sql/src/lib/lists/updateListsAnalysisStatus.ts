import { Logger } from '@nestjs/common';
import { ClientStoreConnection } from '../util/typeORM.utils';
import { ListsAnalysisStatus } from '../entity/organization/lists.analysis.status.entity';
import { In } from 'typeorm';

/**
 * This file is a duplicate of {@link {libs/geo/src/lib/list.analysis.status/updateListAnalysisStatus.ts}}
 */
interface UpdateListsAnalysisStatusParams {
  listId: number;
  errorInfo: string;
  status: number;
  analysisIds?: string[];
}
/**
 * @summary updates ListsAnalysisStatus rows for specific list and analysis IDs
 */
export async function updateListsAnalysisStatus(
  databaseName: string,
  { listId, errorInfo, status, analysisIds }: UpdateListsAnalysisStatusParams
) {
  if (!listId || !status) {
    throw new Error('listId and status must be non-zero values');
  }

  try {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(databaseName);
    const repository = connection.getRepository(ListsAnalysisStatus);

    const whereClause = {
      listId,
      ...(analysisIds && { analysisId: In(analysisIds) })
    };

    await repository.update(whereClause, {
      errorInfo,
      status
    });

    return true;
  } catch (error) {
    Logger.error('Update lists analysis status', error.stack || error);
    throw error;
  }
}
