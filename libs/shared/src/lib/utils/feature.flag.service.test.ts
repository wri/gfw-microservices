import { featureFlagsService } from './feature.flag.service';
import {
  ClientStoreConnection,
  FeatureFlag,
  Organization,
  systemEntities,
} from '@wri-monorepos/sql';
import { Repository } from 'typeorm';

describe('Feature Flag Service', () => {
  let organizationRepository: Repository<Organization>;
  let featureFlagRepository: Repository<FeatureFlag>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.MSSQL_DATABASE = 'gfwpro';
    process.env.MSSQL_USERNAME = 'test';
    process.env.MSSQL_PASSWORD = 'test';
    process.env.MSSQL_HOSTNAME = 'localhost';

    const clientStoreConnection = new ClientStoreConnection();
    const database = process.env.MSSQL_DATABASE || 'gfwpro';
    const connection = await clientStoreConnection.getConnection(database, systemEntities);

    organizationRepository = connection.getRepository(Organization);
    featureFlagRepository = connection.getRepository(FeatureFlag);

    await organizationRepository.save({
      id: 10,
      organizationName: 'Test Organization',
      organizationDb: 'test10',
      organizationStatusId: 1,
      organizationActivatedTime: '2024-03-23T21:24:24.000Z',
      renewalTime: '2024-03-23T22:24:24.000Z',
      subscriptionStatusId: 1,
    });
    await organizationRepository.save({
      id: 20,
      organizationName: 'Test Organization 2',
      organizationDb: 'test20',
      organizationStatusId: 2,
      organizationActivatedTime: '2024-03-23T21:24:24.000Z',
      renewalTime: '2024-03-23T22:24:24.000Z',
      subscriptionStatusId: 1,
    });
  });

  beforeEach(async () => {
    await featureFlagRepository.save({
      id: 1,
      flagId: 'flag1',
      orgId: null,
      flagState: true,
      modifierUserId: 1692,
    });

    await featureFlagRepository.save({
      id: 2,
      flagId: 'flag2',
      orgId: null,
      flagState: false,
      modifierUserId: 1692,
    });
  });

  afterEach(() => {
    featureFlagRepository.clear();
  });

  it('Should return error when try to insert flagId and orgId that is not acceptable', async () => {
    const { insertOrSaveFeatureFlag } = await featureFlagsService();

    try {
      await insertOrSaveFeatureFlag({
        id: 3,
        flagId: null,
        orgId: null,
        flagState: true,
        modifierUserId: 1692,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        'Could not create FeatureFlag record. The following fields are missing or invalid: flagId'
      );
    }
  });

  it('Should return error when try to insert flagId that is not acceptable', async () => {
    const { insertOrSaveFeatureFlag } = await featureFlagsService();

    try {
      await insertOrSaveFeatureFlag({
        id: 4,
        flagId: 'flag3',
        orgId: 10,
        flagState: true,
        modifierUserId: 1692,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        'Could not create FeatureFlag record. The following fields are missing or invalid: flagId'
      );
    }
  });

  it('Should return all feature flag that exist inside the database.', async () => {
    const { getAllFeatureFlags } = await featureFlagsService();
    const allFeatureFlag = await getAllFeatureFlags();
    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });

    expect(allFeatureFlag).toBeDefined();
    expect(allFeatureFlag.length).toBe(2);

    expect(allFeatureFlag).toStrictEqual([
      {
        id: 1,
        flagId: 'flag1',
        flagState: 1,
        modifierUserId: 1692,
        orgId: null,
      },
      {
        id: 2,
        flagId: 'flag2',
        flagState: 0,
        modifierUserId: 1692,
        orgId: null,
      },
    ]);
  });

  it('Should return all feature where organization id equal to 10', async () => {
    const { getAllFeatureFlags, insertOrSaveFeatureFlag } = await featureFlagsService();

    await insertOrSaveFeatureFlag({
      id: 4,
      flagId: 'flag2',
      orgId: 10,
      flagState: true,
      modifierUserId: 1692,
    });

    const allFeatureFlag = await getAllFeatureFlags(10);

    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });
    expect(allFeatureFlag).toBeDefined();
    expect(allFeatureFlag.length).toBe(2);
    expect(allFeatureFlag).toStrictEqual([
      {
        id: 1,
        flagId: 'flag1',
        flagState: 1,
        modifierUserId: 1692,
        orgId: null,
      },
      {
        id: 4,
        flagId: 'flag2',
        flagState: 1,
        modifierUserId: 1692,
        orgId: 10,
      },
    ]);
  });

  it('Should return all feature where flag id equal to flag1', async () => {
    const { getFeatureFlagsByFlagId, insertOrSaveFeatureFlag } = await featureFlagsService();

    await insertOrSaveFeatureFlag({
      id: 5,
      flagId: 'flag1',
      orgId: 20,
      flagState: false,
      modifierUserId: 1692,
    });

    const allFeatureFlag = await getFeatureFlagsByFlagId('flag1');

    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });

    expect(allFeatureFlag).toBeDefined();
    expect(allFeatureFlag.length).toBe(2);
    expect(allFeatureFlag).toEqual([
      {
        flagId: 'flag1',
        flagState: 1,
        id: 1,
        modifierUserId: 1692,
        orgId: null,
      },
      {
        id: 5,
        flagId: 'flag1',
        flagState: 0,
        modifierUserId: 1692,
        orgId: 20,
      },
    ]);
  });

  it('Should return existing feature flag for specific organization which id is 20', async () => {
    const { getFeatureFlagsForCurrentOrg, insertOrSaveFeatureFlag } = await featureFlagsService();

    await insertOrSaveFeatureFlag({
      id: 6,
      flagId: 'flag1',
      orgId: 20,
      flagState: false,
      modifierUserId: 1692,
    });

    const allFeatureFlag = await getFeatureFlagsForCurrentOrg(20);

    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });

    expect(allFeatureFlag).toBeDefined();
    expect(allFeatureFlag.length).toBe(2);
    expect(allFeatureFlag).toEqual([
      {
        id: 6,
        flagId: 'flag1',
        flagState: 0,
        modifierUserId: 1692,
        orgId: 20,
      },
      {
        id: 2,
        flagId: 'flag2',
        flagState: 0,
        modifierUserId: 1692,
        orgId: null,
      },
    ]);
  });

  it('Should delete feature flat which flagId is Afi and OrgId is 20', async () => {
    const { deleteFeatureFlag, getFeatureFlagsForCurrentOrg, insertOrSaveFeatureFlag } =
      await featureFlagsService();

    await insertOrSaveFeatureFlag({
      id: 7,
      flagId: 'flag1',
      orgId: 20,
      flagState: false,
      modifierUserId: 1692,
    });

    await deleteFeatureFlag({
      flagId: 'flag1',
      orgId: 20,
    });

    const allFeatureFlag = await getFeatureFlagsForCurrentOrg(20);
    allFeatureFlag.forEach((flag) => {
      delete flag['updateDateTime'];
    });

    expect(allFeatureFlag).toEqual([
      {
        flagId: 'flag1',
        flagState: 1,
        id: 1,
        modifierUserId: 1692,
        orgId: null,
      },
      {
        flagId: 'flag2',
        flagState: 0,
        id: 2,
        modifierUserId: 1692,
        orgId: null,
      },
    ]);
  });
});
