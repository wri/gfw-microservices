const path = require('path');
const { DataSource, EntitySchema } = require('typeorm');
const config = require(path.resolve('./config/config'));

export const CONNECTION_TYPE_MSSQL = 'mssql';

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
      type: 'date',
      name: 'update_date_time',
    },
  },
});

const dataSource = new DataSource({
  type: 'mssql',
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

class ClientStoreConnection {
  constructor(config, entities = []) {
    this.entities = entities;
    this.config = config;
    this.connections = new Map();
  }
  
  async getConnection(database) {
    const connectionId = config.SQLConnection.host + database;
    const env = process.env.NODE_ENV;
    
    if (!this.connections.has(connectionId)) {
      try {
        const connectionDb = new DataSource({
          type: CONNECTION_TYPE_MSSQL,
          database,
          synchronize: env === TEST_ENVIRONMENT,
          logging: true,
          entities: [this.entities],
          username: config.SQLConnection.username,
          password: config.SQLConnection.password,
          host: config.SQLConnection.host,
          port: parseInt(config.SQLConnection.port, 10),
          extra: {
            trustServerCertificate: true,
          },
        });

        this.connections[connectionId] = await connectionDb.initialize();

        this.connections.set(connectionId, {
          timeout: setTimeout(() => {
            this.clearCache(connectionId);
          }, 60000),
          connection: this.connections[connectionId],
        });

        console.log(`Data Source ${database} has been initialized`);
        return this.connections.get(connectionId).connection;
      } catch (error) {
        console.error(`Data Source ${database} initialization error on env: ${env}`, error);
        throw new Error(`Data Source initialization error`);
      }
    }

    return this.connections.get(connectionId).connection;
  }

  clearCache = async (connectionId) => {
    const cached = this.connections.get(connectionId);
    if (cached) {
      this.connections.delete(connectionId);
      (await cached.connection).destroy();
    }
  };
}

async function createFeatureFlagsService(dataSource) {
  // TODO: use ClientStoreConnection class to handle connection cases
  const repository = dataSource.getRepository(FeatureFlagsEntity);

  async function getAllFeatureFlags(orgId) {
    return repository.find({ where: { orgId }});
  }

  async function getFeatureFlagById(flagId) {
    return repository.find({ where: { flagId } });
  }

  async function createFeatureFlag(data) {
    const fieldsWithErrors = validateFeatureFlagFields(data);

    if (fieldsWithErrors.length > 0) {
      const featureFlag = repository.create(data);
      return repository.insert(featureFlag);
    } else {
      throw new Error(`Could not create FeatureFlag record. The following fields are missing: ${fieldsWithErrors.join(', ')}`);
    }
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
    if (!(data.updateDateTime instanceof Date)) {
      missingFields.push('updateDateTime');
    }

    return missingFields;
  }

  return {
    getAllFeatureFlags,
    getFeatureFlagById,
    createFeatureFlag,
  };
}

module.exports = {
  createFeatureFlagsService,
  dataSource,
};
