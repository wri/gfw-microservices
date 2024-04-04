import { featureFlagsService } from './feature.flag.service';
import { ClientStoreConnection, Organization, systemEntities } from '@wri-monorepos/sql';

describe('Feature Flag Service', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.MSSQL_DATABASE = 'gfwpro';
    process.env.MSSQL_USERNAME = 'test';
    process.env.MSSQL_PASSWORD = 'test';
    process.env.MSSQL_HOSTNAME = 'localhost';

    const clientStoreConnection = new ClientStoreConnection();
    const database = process.env.MSSQL_DATABASE || 'gfwpro';
    const connection = await clientStoreConnection.getConnection(database, systemEntities);
    const repository = connection.getRepository(Organization);

    await repository.save({
      id: 10,
      organizationName: 'Test Organization',
      organizationDb: 'test10',
      organizationStatusId: 1,
      organizationActivatedTime: '2024-03-23T21:24:24.000Z',
      // renewalTime: '2024-03-23T21:24:24.000Z',
      subscriptionStatusId: 1,
    });
    await repository.save({
      id: 20,
      organizationName: 'Test Organization 2',
      organizationDb: 'test20',
      organizationStatusId: 2,
      organizationActivatedTime: '2024-03-23T21:24:24.000Z',
      // renewalTime: '2024-03-23T21:24:24.000Z',
      subscriptionStatusId: 1,
    });

    const { insertOrSaveFeatureFlag } = await featureFlagsService();

    await insertOrSaveFeatureFlag({
      flagId: 'Afi',
      orgId: 20,
      flagState: true,
      modifierUserId: 1692,
    });

    await insertOrSaveFeatureFlag({
      flagId: 'PolygonCoordinatesInput',
      orgId: 10,
      flagState: false,
      modifierUserId: 1692,
    });
  });

  it('Should return error when try to insert flagId that is not acceptable', async () => {
    const { insertOrSaveFeatureFlag } = await featureFlagsService();

    await insertOrSaveFeatureFlag({
      flagId: 'self',
      orgId: null,
      flagState: true,
      modifierUserId: 1692,
    }).catch((error) => {
      expect(error).toBeDefined();
      expect(error.message).toStrictEqual(
        'Could not create FeatureFlag record. The following fields are missing or invalid: flagId'
      );
    });
  });

  it('Should return all feature flag that exist inside the database.', async () => {
    const { getAllFeatureFlags } = await featureFlagsService();
    const allFeatureFlag = await getAllFeatureFlags();
    expect(allFeatureFlag).toBeDefined();
    expect(allFeatureFlag.length).toBe(6);
    expect(allFeatureFlag).toStrictEqual([
      { flagId: 'Afi', flagState: false, orgId: null },
      { flagId: 'ArgentinaCompliance', flagState: false, orgId: null },
      { flagId: 'PermanentFlagForExternalApiKeys', flagState: false, orgId: null },
      { flagId: 'PolygonCoordinatesInput', flagState: false, orgId: null },
      { flagId: 'UploadListLp', flagState: false, orgId: null },
      { flagId: 'ArgentinaDeforestation', flagState: false, orgId: null },
    ]);
  });

  it('Should return all feature where organization id equal to 10', async () => {
    const { getAllFeatureFlags } = await featureFlagsService();

    const allFeatureFlag = await getAllFeatureFlags(10);

    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });
    expect(allFeatureFlag).toBeDefined();
    expect(allFeatureFlag.length).toBe(6);
    expect(allFeatureFlag).toStrictEqual([
      {
        flagId: 'Afi',
        flagState: false,
        orgId: null,
      },
      {
        flagId: 'ArgentinaCompliance',
        flagState: false,
        orgId: null,
      },
      {
        flagId: 'PermanentFlagForExternalApiKeys',
        flagState: false,
        orgId: null,
      },
      {
        flagId: 'PolygonCoordinatesInput',
        flagState: 0,
        modifierUserId: 1692,
        orgId: 10,
      },
      {
        flagId: 'UploadListLp',
        flagState: false,
        orgId: null,
      },
      {
        flagId: 'ArgentinaDeforestation',
        flagState: false,
        orgId: null,
      },
    ]);
  });

  it('Should return all feature where flag id equal to PolygonCoordinatesInput', async () => {
    const { getFeatureFlagsByFlagId } = await featureFlagsService();

    const allFeatureFlag = await getFeatureFlagsByFlagId('PolygonCoordinatesInput');

    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });

    expect(allFeatureFlag).toBeDefined();
    expect(allFeatureFlag.length).toBe(1);
    expect(allFeatureFlag).toEqual([
      {
        flagId: 'PolygonCoordinatesInput',
        flagState: 0,
        modifierUserId: 1692,
        orgId: 10,
      },
    ]);
  });

  it('Should return existing feature flag for specific organization which id is 20', async () => {
    const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();

    const allFeatureFlag = await getFeatureFlagsForCurrentOrg(20);

    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });

    expect(allFeatureFlag).toBeDefined();
    expect(allFeatureFlag.length).toBe(1);
    expect(allFeatureFlag).toEqual([
      {
        flagId: 'Afi',
        flagState: 1,
        modifierUserId: 1692,
        orgId: 20,
      },
    ]);
  });

  it('Should delete feature flat which flagId is Afi and OrgId is 20', async () => {
    const { deleteFeatureFlag, getFeatureFlagsForCurrentOrg } = await featureFlagsService();

    await deleteFeatureFlag({
      flagId: 'Afi',
      orgId: 20,
    });

    const allFeatureFlag = await getFeatureFlagsForCurrentOrg(20);
    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });

    expect(allFeatureFlag).toEqual([]);
  });
});
