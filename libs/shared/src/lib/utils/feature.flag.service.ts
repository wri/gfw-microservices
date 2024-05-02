import { IsNull } from 'typeorm';
import {
  ClientStoreConnection,
  FeatureFlag,
  Organization,
  systemEntities,
} from '@wri-monorepos/sql';

const DEFAULT_GLOBAL_FEATURE_FLAG_STATE = false;

export const featureFlagsService = async () => {
  const clientStoreConnection = new ClientStoreConnection();
  const database = process.env.MSSQL_DATABASE || 'gfwpro';
  const connection = await clientStoreConnection.getConnection(database, systemEntities);
  const repository = connection.getRepository(FeatureFlag);

  async function getFeatureFlagsWhere(where = {}) {
    return repository.find({ where });
  }

  async function getFeatureFlagWhere(where = {}) {
    return repository.find({ where });
  }

  async function getFeatureFlagsByFlagId(flagId: string) {
    return getFeatureFlagWhere({ flagId });
  }

  async function insertOrSaveFeatureFlag(data: Partial<FeatureFlag>) {
    const { orgId: orgIdReceived, flagId } = data;
    const fieldsWithErrors = await validateFeatureFlagFields(data);

    if (fieldsWithErrors.length < 1) {
      const orgId = orgIdReceived === null ? IsNull() : orgIdReceived;
      const [result] = await getFeatureFlagsWhere({ orgId, flagId });
      const dataToInsert = { ...result, ...data };
      const featureFlag = repository.create(dataToInsert);

      await repository.save(featureFlag);
      return featureFlag;
    }

    throw new Error(
      `Could not create FeatureFlag record. The following fields are missing or invalid: ${fieldsWithErrors.join(
        ', '
      )}`
    );
  }

  async function getAllFeatureFlags(orgId = null) {
    const globalFlagsOverrides = await getFeatureFlagsWhere({ orgId: IsNull() });
    const orgFlagsOverrides = orgId && (await getFeatureFlagsWhere({ orgId }));
    const allFeatureFlags = await getAllFeaturesNames();

    return allFeatureFlags.map((flagId) => {
      const staticGlobalFeatureFlag = formatGlobalFeatureFlags(flagId);
      const globalFlagOverride = globalFlagsOverrides.find((flag) => flag.flagId === flagId) || {};
      const orgFlagOverride = orgId
        ? orgFlagsOverrides.find((flag) => flag.flagId === flagId) || {}
        : {};

      return {
        ...staticGlobalFeatureFlag,
        ...globalFlagOverride,
        ...orgFlagOverride,
      };
    });
  }

  async function deleteFeatureFlag(where: { flagId: string; orgId: number }) {
    const { flagId } = where;
    const allFeatureFlags = await getAllFeaturesNames();

    if (!allFeatureFlags.includes(flagId)) {
      throw new Error('Invalid flagId');
    }

    const featureFlag = await repository.findOne({ where });
    await repository.remove(featureFlag);
    return featureFlag;
  }

  async function getFeatureFlagsForCurrentOrg(orgId: number) {
    const mergedFeatureFlags = new Map();
    const globalFeatureFlags = await getFeatureFlagWhere({ orgId: IsNull() });
    const currentOrgFeatureFlags = await getFeatureFlagWhere({ orgId });

    for (const flag of currentOrgFeatureFlags) {
      mergedFeatureFlags.set(flag.flagId, flag);
    }

    for (const flag of globalFeatureFlags) {
      if (!mergedFeatureFlags.has(flag.flagId)) {
        mergedFeatureFlags.set(flag.flagId, flag);
      }
    }

    return [...mergedFeatureFlags.values()];
  }

  async function validateFeatureFlagFields(data: Partial<FeatureFlag>): Promise<string[]> {
    const missingOrInvalidFields = [];
    const allFeatureFlags = await getAllFeaturesNames();

    if (!data.flagId || typeof data.flagId !== 'string' || !allFeatureFlags.includes(data.flagId)) {
      missingOrInvalidFields.push('flagId');
    }

    const orgType = typeof data.orgId;
    if (!['object', 'number'].includes(orgType)) {
      missingOrInvalidFields.push('orgId');
    }

    if (!data.flagState && typeof data.flagState !== 'boolean') {
      missingOrInvalidFields.push('flagState');
    }
    if (typeof data.modifierUserId !== 'number') {
      missingOrInvalidFields.push('modifierUserId');
    }

    return missingOrInvalidFields;
  }

  function formatGlobalFeatureFlags(flag) {
    return {
      flagId: flag,
      flagState: DEFAULT_GLOBAL_FEATURE_FLAG_STATE,
      orgId: null,
    };
  }

  async function getAllFeaturesNames(): Promise<string[]> {
    const result = await repository
      .createQueryBuilder('FeatureFlag')
      .select('flag_id')
      .distinct()
      .execute();
    return result.map((flag) => flag.flag_id);
  }

  async function getClientIdByClientStoreDatabaseName(
    clientStoreDatabase: string
  ): Promise<number> {
    const repository = connection.getRepository(Organization);
    const organization = await repository.findOne({
      where: { organizationDb: clientStoreDatabase },
    });

    if (!organization) {
      throw new Error('Error in getClientIdByClientStoreDatabaseName: Organization not found.');
    }
    return organization.id;
  }

  return {
    getAllFeatureFlags,
    getFeatureFlagsWhere,
    getFeatureFlagsByFlagId,
    insertOrSaveFeatureFlag,
    deleteFeatureFlag,
    getFeatureFlagsForCurrentOrg,
    getAllFeaturesNames,
    getClientIdByClientStoreDatabaseName,
  };
};
