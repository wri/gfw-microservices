const path = require('path');
const { DataSource, EntitySchema } = require('typeorm');
const config = require(path.resolve('./config/config'));
const { allFeatureFlags } = require('../utils/featureFlagConstants');
const DEFAULT_GLOBAL_FEATURE_FLAG_STATE = false;
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
  logging: false,
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

  async function getFeatureFlagsWhere(where = {}) {
    return initializeExecuteAndCleanUp(async () => {
      return repository.find({ where });
    });
  }

  async function getAllFeatureFlags() {
    const flagsOverrides = await getFeatureFlagsWhere();

    const featureFlags = allFeatureFlags.map((flagId) => {
      const staticGlobalFeatureFlag = formatGlobalFeatureFlags(flagId);
      const globalFlagOverride = flagsOverrides.find((flag) => flag.flagId === flagId) || {};

      return {
        ...staticGlobalFeatureFlag,
        ...globalFlagOverride,
      };
    });

    return featureFlags;
  }

  async function getFeatureFlagsForCurrentOrg(orgId) {
    const globalFlagsOverride = await getFeatureFlagsWhere({ orgId: null });
    const orgFlagsOverride = await getFeatureFlagsWhere({ orgId });

    const orgFeatureFlags = allFeatureFlags.map((flagId) => {
      const staticGlobalFeatureFlag = formatGlobalFeatureFlags(flagId);
      const globalFlagOverride = globalFlagsOverride.find((flag) => flag.flagId === flagId) || {};
      const orgFlagOverride = orgFlagsOverride.find((flag) => flag.flagId === flagId) || {};

      return {
        ...staticGlobalFeatureFlag,
        ...globalFlagOverride,
        ...orgFlagOverride,
      };
    });

    return orgFeatureFlags;
  }

  async function getFeatureFlagsByFlagId(flagId) {
    return getFeatureFlagsWhere({ flagId });
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
    const { flagId } = where;

    if (!allFeatureFlags.includes(flagId)) {
      throw new Error('Invalid flagId');
    }

    return initializeExecuteAndCleanUp(async () => {
      const featureFlag = await repository.findOne({ where });
      await repository.remove(featureFlag);
      return featureFlag;
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
      flagState: DEFAULT_GLOBAL_FEATURE_FLAG_STATE,
      orgId: null,
    };
  }

  return {
    getAllFeatureFlags,
    getFeatureFlagsWhere,
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
