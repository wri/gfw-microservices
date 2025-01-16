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
import * as sql from 'mssql';
import { checkProcessingLimits } from '@wri-monorepos/shared';
import axios from 'axios';
import { extractAnalysisTypes, getListAnalysisStatus } from '../utils/list.utils';

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

const deleteListAnalysis = async (clientDatabase, listId: number, analysisId: string) => {
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
  reanalyze: boolean = true
) => {
  const geoTrellisUrlsByEnv = {
    qa: GEO_TRELLIS__ANALYZE_LIST_QA,
    staging: GEO_TRELLIS__ANALYZE_LIST_STAGING,
    production: GEO_TRELLIS__ANALYZE_LIST_PROD,
    ProdV2: GEO_TRELLIS__ANALYZE_LIST_PRODV2,
    default: GEO_TRELLIS__ANALYZE_LIST_DEV,
  };

  const url = geoTrellisUrlsByEnv[process.env.NODE_ENV] || geoTrellisUrlsByEnv.default;

  const { isListLocationOverLimit, processingLimit } = await checkProcessingLimits({
    organizationDb,
    organizationId,
    subscriptionStatusId,
    listId: listId,
  });
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(organizationDb);
  const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
  const analysisTypes = analysisTypesToProcess.split(',');
  analysisTypes.map(async (analysisId) => {
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
  });
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
};
