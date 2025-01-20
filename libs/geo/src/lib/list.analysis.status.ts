import { Logger } from '@nestjs/common';
import { S3Service } from '@wri-monorepos/aws';
import { readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { ListsAnalysisStatus, SQLUtils } from '@wri-monorepos/sql';
import { analysisIdsOptionsMap, listStatus, analysisTypesOptions } from '@wri-monorepos/constants';
import * as sql from 'mssql';
import { flatten } from 'lodash';

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

export const setSelectedAnalyses = async (
  clientDatabase: string,
  listId: number,
  analysisIds: string[],
  analysisStatus = listStatus.Pending
) => {
  const analysisStatusData = await getListAnalysisStatusByListId(clientDatabase, listId);
  if (!analysisStatusData || analysisStatusData.length === 0) {
    await createListAnalysis(clientDatabase, listId, analysisIds, analysisStatus);
  } else {
    await updateListAnalysis(clientDatabase, listId, analysisIds, analysisStatusData);
  }
};

export const updateListAnalysis = async (
  clientDatabase: string,
  listId: number,
  analysisIds: string[],
  analysisStatusData: ListsAnalysisStatus[]
) => {
  const analysisDataIds = analysisStatusData.map((analysis) => analysis.analysisId);
  const analysisOptionsAsIds = new Set(flatten(Object.values(analysisIdsOptionsMap)));

  for (const analysisIdRow of analysisDataIds) {
    if (!analysisIds.includes(analysisIdRow)) {
      await deleteListAnalysisStatusBy(
        clientDatabase,
        listId,
        analysisIdRow,
        analysisOptionsAsIds.has(analysisIdRow)
      );
    }
  }

  for (const element of analysisIds) {
    if (!analysisDataIds.includes(element)) {
      await createListAnalysis(clientDatabase, listId, [element], listStatus.Pending);
    }
  }
};

export const deleteListAnalysisStatusBy = async (
  clientDatabase: string,
  listId: number,
  analysisId: string,
  optionOnly: boolean
) => {
  await SQLUtils.queryDB(clientDatabase, 'deleteListAnalysisStatusBy', [
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
      field: 'OptionOnly',
      type: sql.Int,
      value: Number(optionOnly),
    },
  ]);
};

export const deleteListAnalysisOption = async (
  clientDatabase: string,
  listId: number,
  analysisId: string
) => {
  await SQLUtils.queryDB(clientDatabase, 'deleteListAnalysisStatusBy', [
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
      field: 'OptionOnly',
      type: sql.Int,
      value: 1,
    },
  ]);
};

export const deleteListAnalysisRecord = async (
  clientDatabase: string,
  listId: number,
  analysisId: string
) => {
  await SQLUtils.queryDB(clientDatabase, 'deleteListAnalysisStatusBy', [
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
      field: 'OptionOnly',
      type: sql.Int,
      value: 0,
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
