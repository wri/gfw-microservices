const path = require('path');
const { DataSource, EntitySchema } = require('typeorm');
const config = require(path.resolve('./config/config'));
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

  async function getAllFeatureFlags(orgId) {
    let featureFlagsCollection;

    try {
      await dataSource.initialize();
      featureFlagsCollection = await repository.find({ where: { orgId } });
    } catch (error) {
      throw new Error(error);
    } finally {
      await dataSource.destroy();
    }

    return featureFlagsCollection;
  }

  async function getFeatureFlagsByFlagId(flagId) {
    let featureFlagsCollection;

    try {
      await dataSource.initialize();
      featureFlagsCollection = await repository.findBy({
        flagId: flagId,
      });
    } catch (error) {
      throw new Error(error);
    } finally {
      await dataSource.destroy();
    }

    return featureFlagsCollection;
  }

  async function createFeatureFlag(data) {
    const fieldsWithErrors = validateFeatureFlagFields(data);

    if (fieldsWithErrors.length < 1) {
      let featureFlag;

      try {
        await dataSource.initialize();
        featureFlag = repository.create(data);
        await repository.insert(featureFlag);
      } catch (error) {
        throw new Error(error);
      } finally {
        await dataSource.destroy();
      }

      return featureFlag;
    }

    throw new Error(
      `Could not create FeatureFlag record. The following fields are missing: ${fieldsWithErrors.join(
        ', '
      )}`
    );
  }

  function validateFeatureFlagFields(data) {
    const missingFields = [];

    if (!data.flagId || typeof data.flagId !== 'string') {
      missingFields.push('flagId');
    }
    if (data.orgId !== null && typeof data.orgId !== 'number') {
      missingFields.push('orgId');
    }
    if (typeof data.flagState !== 'boolean') {
      missingFields.push('flagState');
    }
    if (typeof data.modifierUserId !== 'number') {
      missingFields.push('modifierUserId');
    }

    return missingFields;
  }

  return {
    getAllFeatureFlags,
    getFeatureFlagsByFlagId,
    createFeatureFlag,
  };
}

module.exports = {
  createFeatureFlagsService,
  dataSource,
};
