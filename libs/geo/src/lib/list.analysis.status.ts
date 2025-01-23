import { Logger } from '@nestjs/common';
import {
  ActivityLog,
  ClientStoreConnection,
  Lists,
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
  analysisTypesOptions,
  analysisIdsOptionsMap,
} from '@wri-monorepos/constants';
import { S3Service } from '@wri-monorepos/aws';
import { readAnalysesLastModifiedTime, checkProcessingLimits } from '@wri-monorepos/shared';
import * as sql from 'mssql';
import { getListAnalysisStatus } from '../utils/list.utils';
import axios from 'axios';
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
    // Check if commodity is valid for GHG Analysis
    if (!(await validateGHGCommodity(listId, organizationDb))) {
      Logger.log(`Commodity is valid for GHG Analysis`);
    }

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

export const validateGHGCommodity = async (
  id: number,
  organizationDb: string
): Promise<boolean> => {
  // Get list data
  try {
    const clientStoreConnection = new ClientStoreConnection();
    const organizationConnection = await clientStoreConnection.getConnection(organizationDb);
    const listRepository = organizationConnection.getRepository(Lists);
    const listData = await listRepository.findOne({
      where: { id },
    });
    // verify if list has a non valid GHG commodity
    if (listData?.Commodity.startsWith('GFWP_')) {
      Logger.log(
        `Invalid commodity in list ${listData.id} - ${listData.listName} for GHG Analysis`
      );
      throw new Error(
        `Invalid commodity in list ${listData.id} - ${listData.listName} for GHG Analysis`
      );
    }
    return true;
  } catch (error) {
    Logger.error('validateGHGCommodity', error.message || error);
    throw error;
  }
};
