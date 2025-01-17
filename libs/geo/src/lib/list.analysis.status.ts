import { Logger } from '@nestjs/common';
import { S3Service } from '@wri-monorepos/aws';
import { readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { ListsAnalysisStatus, SQLUtils } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';
import { analysisTypesOptions } from '@wri-monorepos/constants';
import * as sql from 'mssql';

export const createListAnalysis = async (
  clientDatabase: string,
  listId: number,
  analysisIds: string[],
  analysisStatus: string | number
) => {
  try {
    const isPalmRiskIncluded = analysisIds.includes('PalmRisk');
    await Promise.all(
      analysisIds
        .filter((analysisId) => analysisId !== 'PalmRisk')
        .map(async (analysisId) => {
          const parameters = [
            {
              field: 'ListID',
              type: sql.Int,
              value: listId,
            },
            {
              field: 'AnalysisID',
              type: sql.NVarChar(150),
              value: analysisId,
            },
            {
              field: 'Status',
              type: sql.Int,
              value: analysisStatus,
            },
          ];

          if (isPalmRiskIncluded && analysisId === 'FCD') {
            parameters.push({
              field: 'options',
              type: sql.NVarChar(32),
              value: 'PalmRisk',
            });
          }

          return await SQLUtils.queryDB(clientDatabase, 'uspCreateListAnalysisStatus', parameters);
        })
    );
  } catch (error) {
    Logger.error('Create list analysis', error.stack || error);
    throw error;
  }
};

export const getAllListsAnalysisStatus = async (
  clientDatabase: string
): Promise<ListsAnalysisStatus[]> => {
  try {
    const analysisStatusData = await SQLUtils.queryDB<ListsAnalysisStatus[]>(
      clientDatabase,
      'getAllListsAnalysisStatus'
    );

    return await resolveListAnalysisStatuses(analysisStatusData);
  } catch (error) {
    Logger.error('Getting all lists analysis status', error.stack || error);
    throw error;
  }
};

export const getListAnalysisStatusByListId = async (
  clientDatabase: string,
  listId: number
): Promise<ListsAnalysisStatus[]> => {
  try {
    const parameters = [{ field: 'ListID', type: sql.Int, value: listId }];
    const analysisStatusData = await SQLUtils.queryDB<ListsAnalysisStatus[]>(
      clientDatabase,
      'getListAnalysisStatusById',
      parameters
    );

    return await resolveListAnalysisStatuses(analysisStatusData);
  } catch (error) {
    Logger.error('Getting list analysis status by list id', error.stack || error);
    throw error;
  }
};

export const updateListAnalysis = async (
  clientDatabase,
  listId: number,
  analysisIds: string[],
  analysisStatusData: ListsAnalysisStatus[]
) => {
  const analysisDataIds = analysisStatusData.map((analysis) => analysis.analysisId);
  for (const analysisRow of analysisDataIds) {
    if (!analysisIds.includes(analysisRow)) {
      deleteListAnalysis(clientDatabase, listId, analysisRow);
    }
  }

  for (const element of analysisIds) {
    if (!analysisDataIds.includes(element)) {
      createListAnalysis(clientDatabase, listId, [element], listStatus.Pending);
    }
  }
};

const deleteListAnalysis = async (clientDatabase: string, listId: number, analysisId: string) => {
  if (analysisId === 'PalmRisk') {
    analysisId = 'FCD';
  }
  await SQLUtils.queryDB(clientDatabase, 'dropListAnalysisStatusByListIdAndAnalysisIdQuery', [
    {
      field: 'ListID',
      type: sql.Int,
      value: listId,
    },
    {
      field: 'AnalysisID',
      type: sql.NVarChar(150),
      value: analysisId,
    },
  ]);
};

export const getAnalysisTypesFromIds = (analysisIds: string[]) => {
  const analysisIdSet = new Set(analysisIds);
  return analysisTypesOptions.reduce((result, { id }) => {
    result[id] = analysisIdSet.has(id);
    return result;
  }, {} as Record<string, boolean>);
};

export const extractAnalysisTypes = (listAnalysisStatusData: ListsAnalysisStatus[]) => {
  const analysisStatusMap = new Map(
    listAnalysisStatusData.map(({ analysisId }) => [analysisId, true])
  );
  return analysisTypesOptions.reduce((result, { id }) => {
    result[id] = analysisStatusMap.has(id);
    return result;
  }, {} as Record<string, boolean>);
};

export async function resolveListAnalysisStatuses(listAnalysisStatuses: ListsAnalysisStatus[]) {
  const s3 = new S3Service();

  try {
    const analysisTypesLastModifiedData = await readAnalysesLastModifiedTime(s3);
    const lastModifiedMap = new Map(
      analysisTypesLastModifiedData.map(({ id, last_run }) => [id, last_run])
    );
    const results: ListsAnalysisStatus[] = [];

    for (const analysisStatus of listAnalysisStatuses) {
      const { analysisId, options } = analysisStatus;
      const originalAnalysisIdLastModified = lastModifiedMap.get(analysisId);

      const analysisIdsToPush =
        analysisId === 'FCD' && options === 'PalmRisk' ? ['FCD', 'PalmRisk'] : [analysisId];

      for (const id of analysisIdsToPush) {
        results.push({
          ...analysisStatus,
          analysisId: id,
          analysisIdLastModifed: originalAnalysisIdLastModified,
        });
      }
    }

    return results;
  } catch (error) {
    Logger.error('Error resolving list analysis statuses', {
      message: error.message,
      stack: error.stack,
      listAnalysisStatuses,
    });
    throw error;
  }
}
