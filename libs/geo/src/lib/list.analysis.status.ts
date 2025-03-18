import { BadRequestException, Logger } from '@nestjs/common';
import {
  ActivityLog,
  ClientStoreConnection,
  FeatureFlag,
  Lists,
  ListsAnalysisStatus,
  ListSchema,
  ListSchemaType,
  SQLUtils,
  User,
} from '@wri-monorepos/sql';
import {
  GEO_TRELLIS__ANALYZE_LIST_DEV,
  GEO_TRELLIS__ANALYZE_LIST_PROD,
  GEO_TRELLIS__ANALYZE_LIST_PRODV2,
  GEO_TRELLIS__ANALYZE_LIST_QA,
  GEO_TRELLIS__ANALYZE_LIST_STAGING,
  listStatus,
  analysisTypesOptionsNewNames,
  analysisIdsOptionsMap,
  MAPSPAM_COMMODITY,
  GADM_FEATURE_FLAG_NAME,
} from '@wri-monorepos/constants';
import { S3Service } from '@wri-monorepos/aws';
import {
  readAnalysesLastModifiedTime,
  checkProcessingLimits,
  featureFlagsService,
} from '@wri-monorepos/shared';
import * as sql from 'mssql';
import { getListAnalysisStatus } from '../utils/list.utils';
import axios from 'axios';
import { flatten } from 'lodash';
import { updateListsAnalysisStatus } from './list.analysis.status/updateListAnalysisStatus';
import { mockAnalysisFlow } from '../mock';
import { EntitySchema } from 'typeorm';

export const MARK_IS_TEST_LIST = 'e2e_automation';
export const MARK_IS_TEST_USER = 'dt_';

const environmentAllowTestFlow = ['DEVELOPMENT', 'LATEST', 'QA', 'STAGING'];

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

          return await SQLUtils.queryDB(clientDatabase, 'createListAnalysisStatus', parameters);
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

const getListName = async (organizationDatabase: string, list_id: number) => {
  const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
  const listRepository = connection.getRepository(Lists);
  const { listName } = await listRepository.findOne({ where: { id: list_id } });
  return listName;
};

const getUserEmail = async (organizationDatabase: string, user_id: number) => {
  const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
  const userRepository = connection.getRepository(User);
  const { email } = await userRepository.findOne({ where: { id: user_id } });
  return email;
};

const checkIsTestFlow = (
  microserviceEnvironment: string,
  listName: string,
  userEmail: string
): boolean => {
  return (
    environmentAllowTestFlow.includes(microserviceEnvironment) &&
    listName.includes(MARK_IS_TEST_LIST) &&
    userEmail.includes(MARK_IS_TEST_USER)
  );
};

const getTestFlowDetails = async (
  microserviceEnvironment: string,
  organization_database: string,
  listId: number,
  user_id: number
): Promise<{ listName: string; userEmail: string }> => {
  let listName = '';
  let userEmail = '';

  if (environmentAllowTestFlow.includes(microserviceEnvironment)) {
    listName = await getListName(organization_database, listId);
    userEmail = await getUserEmail(organization_database, user_id);
  }

  return { listName, userEmail };
};

const runMockAnalysisFlow = async (
  organization_database: string,
  listId: number
): Promise<void> => {
  await mockAnalysisFlow({
    organization_database: organization_database,
    list_id: listId,
    template_type: 'cocoa_generic',
  });
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
  analysisTypesToProcess = '',
  listId: number,
  organizationId: number,
  organizationDb: string,
  sendEmail: boolean,
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
              s3URL: null,
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

    const analysisTypes = extractAnalysisTypes(
      analysisTypesToProcess
        ? listAnalysisStatusData.filter(({ analysisId }) =>
            analysisTypesToProcess.includes(analysisId)
          )
        : listAnalysisStatusData
    );

    if ('GHG' in analysisTypes && analysisTypes['GHG']) {
      // Check if commodity is valid for GHG Analysis
      await isGHGCommodityValid(listId, organizationDb);
    }
    const data = {
      list_id: listId,
      user_id: organization_user_id,
      organization_id: organizationId,
      processing_limit: processingLimit,
      analysis_types: analysisTypes,
      reanalyze,
      send_email: sendEmail,
    };
    const connectionLibSql = await clientStoreConnection.getConnection(organizationDb);

    const activityLogRepository = connectionLibSql.getRepository(ActivityLog);

    //Search for FeatureFlag
    const expeditedAnalysisFlag = await searchForFeatureFlag( organizationDb,'PermanentFlagExpeditedAnalysis')
    
    // Add FeatureFlag to data
    if (expeditedAnalysisFlag?.flagState === true) {
      data['expedited_analysis'] = true;
    }

    // Add GadmFeatureFlag to data
    data['gadm'] = await getGadmFeatrueFlag(organizationDb);

    const microserviceEnvironment = process.env.MICROSERVICES_ENV;
    const { listName, userEmail: testUserEmail } = await getTestFlowDetails(
      microserviceEnvironment,
      organizationDb,
      listId,
      organization_user_id
    );
    const isTestFlow = checkIsTestFlow(microserviceEnvironment, listName, testUserEmail);

    if (isTestFlow) {
      await runMockAnalysisFlow(organizationDb, listId);
      return 'OK';
    }
    // Get GADM parameter
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
      Logger.error(
        'createAnalysis',
        `Error when updating ${listId} to analysis: ${error.stack || error}`
      );
      throw error;
    }
    return response.statusText;
  } catch (error) {
    Logger.error(
      'createAnalysis',
      `Error when updating ${listId} to analysis: ${error.stack || error}`
    );
    throw error;
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
  return analysisTypesOptionsNewNames.reduce((result, { id }) => {
    result[id] = analysisIdSet.has(id);
    return result;
  }, {} as Record<string, boolean>);
};

export const extractAnalysisTypes = (listAnalysisStatusData: ListsAnalysisStatus[]) => {
  const analysisStatusMap = new Map(
    listAnalysisStatusData.map(({ analysisId }) => [analysisId, true])
  );
  return analysisTypesOptionsNewNames.reduce((result, { id }) => {
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

export const isGHGCommodityValid = async (id: number, organizationDb: string): Promise<boolean> => {
  // Get list data
  try {
    const clientStoreConnection = new ClientStoreConnection();
    const organizationConnection = await clientStoreConnection.getConnection(organizationDb);
    const listRepository = organizationConnection.getRepository(Lists);
    const listData = await listRepository.findOne({
      where: { id },
    });

    // Get list.xxx repository
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listData.listTableName,
    });
    const connection = await clientStoreConnection.getConnection(organizationDb, [ListEntity]);
    const listTableNameRepository = await connection.getRepository(ListEntity);
    const listTableName = await listTableNameRepository.findBy({ commodity: listData.Commodity });

    if (!listData) {
      Logger.error('validateGHGCommodity', `List ${id} not found`);
      throw new Error(`List ${id} not found`);
    }

    // ListData.version = 2 won't have commodities with null values, take care of it when version 2 is implemented
    // verify if list has no commodity
    if (listData.Commodity === null && listData.version > 1) {
      Logger.log('validateGHGCommodity', `List ${id} has no commodity`);
      await saveAnalysisStatusErrorInfo(
        organizationDb,
        id,
        'Invalid GHG Commodity',
        listStatus.Inactive,
        'GHG'
      );
      throw new Error('Invalid GHG Commodity');
    }
    // verify if list has a non valid GHG commodity
    if (!isValidMapSpamCommodity(listData.Commodity)) {
      Logger.log('Invalid GHG Commodity');
      await saveAnalysisStatusErrorInfo(
        organizationDb,
        id,
        'Invalid GHG Commodity',
        listStatus.Inactive,
        'GHG'
      );
      throw new Error('Invalid GHG Commodity');
    }
    try {
      if (listData.Commodity === 'GFWP_Other') {
        if (listTableName.length == 0) {
          Logger.log('Invalid GHG Commodity');
          await saveAnalysisStatusErrorInfo(
            organizationDb,
            id,
            'Invalid GHG Commodity',
            listStatus.Inactive,
            'GHG'
          );
          throw new Error('Invalid GHG Commodity');
        }
        const hasYield = listTableName.every((element) => {
          const attributes = JSON.parse(element.attributes || '[]');
          return attributes.some((item) => item.field === 'yield' && parseFloat(item.value) > 0);
        });
        // Verify if has yield for all locations
        if (!hasYield) {
          Logger.log('Missing Yield Values');
          await saveAnalysisStatusErrorInfo(
            organizationDb,
            id,
            'Missing Yield Values',
            listStatus.Inactive,
            'GHG'
          );
          throw new Error('Missing Yield Values');
        }
      }
    } catch (error) {
      Logger.warn(error.stack || error);
      throw error;
    }

    return true;
  } catch (error) {
    Logger.error('validateGHGCommodity', error.message || error);
    throw new BadRequestException(error.message || error);
  }
};

export const isValidMapSpamCommodity = (Commodity: string): boolean => {
  if (Object.keys(MAPSPAM_COMMODITY).includes(Commodity)) {
    return true;
  }
  if (Commodity === 'GFWP_Other') {
    return true;
  }
  return false;
};

//Saves the error info in the database based on the analysisId and listId
const saveAnalysisStatusErrorInfo = async (
  organizationDb: string,
  listId: number,
  errorInfo: string,
  status: number,
  analysisId: string
) => {
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(organizationDb);
  const listAnalysisStatusRepository = await connection.getRepository(ListsAnalysisStatus);
  await listAnalysisStatusRepository.update({ listId, analysisId }, { errorInfo, status });
};

type GadmFeatureFlag = {
  gadm: number;
};

export const getGadmFeatrueFlag = async (organizationDb: string): Promise<GadmFeatureFlag> => {
  const gadmResult: GadmFeatureFlag = { gadm: 3.6 };
  try {
    const gadmFeatureFlagName = await searchForFeatureFlag(organizationDb, GADM_FEATURE_FLAG_NAME);

    if (gadmFeatureFlagName?.flagState === true) {
      gadmResult.gadm = 4.1;
    }

    return gadmResult;
  } catch (error) {
    Logger.error('getGadmFeatrueFlag', error.message || error);
    return gadmResult;
  }
};

const searchForFeatureFlag = async (
  organizationDb: string,
  featureFlagName: string
): Promise<FeatureFlag> => {
  try {
    //Search for FeatureFlag
    const { getFeatureFlagsForCurrentOrg, getClientIdByClientStoreDatabaseName } =
      await featureFlagsService();
    const orgId = await getClientIdByClientStoreDatabaseName(organizationDb);
    const flags = await getFeatureFlagsForCurrentOrg(orgId);

    const searchedFeatureFlag = flags.find((f) => f.flagId === featureFlagName) as FeatureFlag;
    return searchedFeatureFlag;
  } catch (error) {
    Logger.error('searchForFeatrueFlag', error.message || error);
    return null;
  }
};
