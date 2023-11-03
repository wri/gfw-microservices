const path = require('path');
const { DataSource, EntitySchema } = require('typeorm');
const config = require(path.resolve('./config/config'));
const { allFeatureFlags } = require('../utils/featureFlagConstants');
const DEFAULT_GLOBA_FEATURE_FLAG_STATE = false;
const CONNECTION_TYPE_MSSQL = 'mssql';

const FeatureFlagsEntity = new EntitySchema({
  name: 'FeatureFlags',
  tableName: 'FeatureFlags',
  columns: {
    flagId: {
      primary: true,
      type: 'text',
      name: 'flag_id',
    },
    orgId: {
      primary: true,
      type: 'int',
      name: 'org_id',
      nullable: true,
    },
    flagState: {
      type: 'bit',
      name: 'flag_state',
    },
    modifierUserId: {
      type: 'int',
      name: 'modifier_user_id',
    },
    updateDateTime: {
      type: 'datetime2',
      name: 'update_date_time',
    },
  },
});

const dataSource = new DataSource({
  type: CONNECTION_TYPE_MSSQL,
  logging: true,
  host: config.SQLConnection.host,
  port: parseInt(config.SQLConnection.port, 10),
  username: config.SQLConnection.username,
  password: config.SQLConnection.password,
  database: config.SQLConnection.database,
  entities: [FeatureFlagsEntity],
  extra: {
    trustServerCertificate: true,
  },
});

function createFeatureFlagsService(dataSource) {
  const repository = dataSource.getRepository(FeatureFlagsEntity);

  async function initializeExecuteAndCleanUp(callback) {
    let result;

    try {
      await dataSource.initialize();
      result = await callback();
    } catch (error) {
      throw new Error(error);
    } finally {
      await dataSource.destroy();
    }

    return result;
  }

  async function getFeatureFlagWhere(where = {}) {
    return initializeExecuteAndCleanUp(async () => {
      return repository.find({ where });
    });
  }

  async function getFeatureFlagsForCurrentOrg(orgId) {
    const mergedFeatureFlags = new Map();
    const globalFeatureFlags = allFeatureFlags.map(formatGlobalFeatureFlags);
    const currentOrgFeatureFlags = await getFeatureFlagWhere({ orgId });

    for (const flag of globalFeatureFlags) {
      // If there flags enabled for this org set them
      const flagForOrg = currentOrgFeatureFlags.find(
        (orgFlag) => orgFlag.flagState !== flag.flagState && orgFlag.flagId === flag.flagId
      );
      mergedFeatureFlags.set(flag.flagId, flagForOrg ?? flag);
    }

    return [...mergedFeatureFlags.values()];
  }

  async function getFeatureFlagsByFlagId(flagId) {
    return getFeatureFlagWhere({ flagId });
  }

  async function insertOrSaveFeatureFlag(data) {
    const fieldsWithErrors = validateFeatureFlagFields(data);

    if (fieldsWithErrors.length < 1) {
      return initializeExecuteAndCleanUp(async () => {
        let featureFlag = repository.create(data);
        await repository.save(featureFlag);
        return featureFlag;
      });
    }

    throw new Error(
      `Could not create FeatureFlag record. The following fields are missing or invalid: ${fieldsWithErrors.join(
        ', '
      )}`
    );
  }

  async function deleteFeatureFlag(where) {
    return initializeExecuteAndCleanUp(async () => {
      const featureFlag = await repository.findOne({ where });
      return repository.remove(featureFlag);
    });
  }

  function validateFeatureFlagFields(data) {
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
      flagState: DEFAULT_GLOBA_FEATURE_FLAG_STATE,
      orgId: null,
    };
  }

  return {
    getFeatureFlagWhere,
    getFeatureFlagsForCurrentOrg,
    getFeatureFlagsByFlagId,
    insertOrSaveFeatureFlag,
    deleteFeatureFlag,
  };
}

module.exports = {
  createFeatureFlagsService,
  dataSource,
};
