const { DataSource, EntitySchema } = require('typeorm');

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
      type: 'number',
      name: 'org_id',
      nullable: true,
    },
    flagState: {
      type: 'boolean',
      name: 'flag_state',
    },
    modifierUserId: {
      type: 'number',
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
  host: process.env.MSSQL_HOSTNAME,
  port: parseInt(process.env.MSSQL_PORT, 10),
  username: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  database: 'gfwpro',
  entities: [FeatureFlagsEntity],
  extra: {
    trustServerCertificate: true,
  },
});

function createFeatureFlagsService(dataSource) {
  const repository = dataSource.getRepository(FeatureFlagsEntity);

  async function getAllFeatureFlags() {
    return repository.find();
  }

  async function getFeatureFlagById(flagId) {
    return repository.findOne({ where: { flagId } });
  }

  async function createFeatureFlag(data) {
    const featureFlag = repository.create(data);
    return repository.save(featureFlag);
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
