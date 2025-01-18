import { Logger } from '@nestjs/common';
import {
  ActivityLog,
  ClientStoreConnection,
  ListsAnalysisStatus,
  SQLUtils,
  updateListsAnalysisStatus,
} from '@wri-monorepos/sql';
import {
  GEO_TRELLIS__ANALYZE_LIST_DEV,
  GEO_TRELLIS__ANALYZE_LIST_PROD,
  GEO_TRELLIS__ANALYZE_LIST_PRODV2,
  GEO_TRELLIS__ANALYZE_LIST_QA,
  GEO_TRELLIS__ANALYZE_LIST_STAGING,
  listStatus,
} from '@wri-monorepos/constants';
import { S3Service } from '@wri-monorepos/aws';
import { readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { analysisTypesOptions } from '@wri-monorepos/constants';
import * as sql from 'mssql';
import { checkProcessingLimits } from '@wri-monorepos/shared';
import { getListAnalysisStatus } from '../utils/list.utils';
import axios from 'axios';

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
export const handleCreateAnalysis = async (
  analysisTypesToProcess: string,
  listId: number,
  organizationId: number,
  organizationDb: string,
  userEmail: string,
  organization_user_id: number,
  subscriptionStatusId: number,
  reanalyze = true
) => {
  const geoTrellisUrlsByEnv = {
    qa: GEO_TRELLIS__ANALYZE_LIST_QA,
    staging: GEO_TRELLIS__ANALYZE_LIST_STAGING,
    production: GEO_TRELLIS__ANALYZE_LIST_PROD,
    ProdV2: GEO_TRELLIS__ANALYZE_LIST_PRODV2,
    default: GEO_TRELLIS__ANALYZE_LIST_DEV,
  };
  try {
    const url = geoTrellisUrlsByEnv[process.env.NODE_ENV] || geoTrellisUrlsByEnv.default;
    console.log(organizationDb, organizationId, subscriptionStatusId, listId);
    const { isListLocationOverLimit, processingLimit } = await checkProcessingLimits({
      organizationDb,
      organizationId,
      subscriptionStatusId,
      listId,
    });
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organizationDb);
    const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);

    const analysisTypesToUpdate = analysisTypesToProcess.split(',');
    await Promise.all(
      analysisTypesToUpdate.map(async (analysisId) => {
        const listAnalysisStatusToUpdate = await listAnalysisStatusRepository.findBy({
          listId,
          analysisId,
        });

        if (listAnalysisStatusToUpdate.length === 0) {
          await listAnalysisStatusRepository.save({
            listId,
            analysisId,
            status: listStatus.Pending,
            updateTime: new Date().toISOString(),
          });
        } else {
          await listAnalysisStatusRepository.update(
            { listId, analysisId },
            {
              status: listStatus.Pending,
              s3Url: null,
              bundleCreationTime: null,
              expirationTime: null,
              errorInfo: null,
            }
          );
        }
      })
    );

    if (isListLocationOverLimit) {
      await updateListsAnalysisStatus(organizationDb, {
        listId: listId,
        errorInfo: 'Exceeded Analysis Limit',
        status: listStatus.Inactive,
      });
      throw new Error(`Analysis limit reached`);
    }
    const listAnalysisStatusData = await getListAnalysisStatus(organizationDb, listId);

    const analysiTypes = extractAnalysisTypes(
      analysisTypesToProcess
        ? listAnalysisStatusData.filter(({ analysisId }) =>
            analysisTypesToProcess.includes(analysisId)
          )
        : listAnalysisStatusData
    );

    const data = {
      list_id: listId,
      user_id: organization_user_id,
      organization_id: organizationId,
      processing_limit: processingLimit,
      analysis_types: analysiTypes,
      reanalyze,
      send_email: userEmail ? true : false,
    };
    const connectionLibSql = await clientStoreConnection.getConnection(organizationDb);

    const activityLogRepository = connectionLibSql.getRepository(ActivityLog);

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    try {
      await activityLogRepository.save({
        userId: organization_user_id,
        activityTypeId: 22,
        activityDescription: `ListAnalyzing ${listId} has been sent to analysis`,
        activityTime: new Date(),
      });
    } catch (error) {
      Logger.error('createAnalysis', `Error when updating ${listId} to analysis: ${error.message}`);
      return error.message;
    }
    return response.statusText;
  } catch (error) {
    Logger.error('createAnalysis', `Error when updating ${listId} to analysis: ${error.message}`);
    return error.message;
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
