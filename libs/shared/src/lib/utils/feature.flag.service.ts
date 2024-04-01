import { IsNull } from 'typeorm';
import { ClientStoreConnection, FeatureFlag, systemEntities } from '@wri-monorepos/sql';

const DEFAULT_GLOBAL_FEATURE_FLAG_STATE = false;
export const allFeatureFlags = [
  'Afi',
  'ArgentinaCompliance',
  'PermanentFlagForExternalApiKeys',
  'PolygonCoordinatesInput',
  'UploadListLp',
  'ArgentinaDeforestation',
];

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
    const fieldsWithErrors = validateFeatureFlagFields(data);

    if (fieldsWithErrors.length < 1) {
      const featureFlag = repository.create(data);
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

  function validateFeatureFlagFields(data: Partial<FeatureFlag>): string[] {
    const missingOrInvalidFields = [];

    if (!data.flagId || typeof data.flagId !== 'string' || !allFeatureFlags.includes(data.flagId)) {
      missingOrInvalidFields.push('flagId');
    }

    if (data.orgId !== null && typeof data.orgId !== 'number') {
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

  return {
    getAllFeatureFlags,
    getFeatureFlagsWhere,
    getFeatureFlagsByFlagId,
    insertOrSaveFeatureFlag,
    deleteFeatureFlag,
    getFeatureFlagsForCurrentOrg,
  };
};
