import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { Repository } from 'typeorm';
import { LockListService } from './lock.list.service';

const LIST_DATE = {
  id: 5407,
  userId: 10033,
  templateId: 5,
  listName: 'Recent Palm Oil Generic UML 03152023',
  listTableName: 'list-recentpalmoilgenericuml03152023',
  listAnalysisTableName: 'analysis-recentpalmoilgenericuml03152023',
  listStatusId: 3,
  listErrorMessage: null,
  locationClassification: 'Supply Shed',
  customAttributeNames: '',
  customAttributeTypes: '',
  listLocationsCount: 1266,
  lockStatus: null,
  lockUserId: 1,
  dashboardLastSubmit: '2023-03-15T17:04:24.736Z',
  dashboardLastResults: null,
  vectorTilesStoragePath: 'gfwpro-site-data',
  errorFileStoragePath: null,
  vectorTilesLastUpdated: '2023-03-15T17:08:40.180Z',
};

describe('Lock List Service', () => {
  let listsRepository: Repository<Lists>;
  let lockListService: LockListService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.MSSQL_DATABASE = ':memory:';
    process.env.MSSQL_USERNAME = 'test';
    process.env.MSSQL_PASSWORD = 'test';
    process.env.MSSQL_HOSTNAME = 'localhost';

    const clientStoreConnection = new ClientStoreConnection();
    const database = process.env.MSSQL_DATABASE;
    const connection = await clientStoreConnection.getConnection(database, [Lists]);
    lockListService = new LockListService(clientStoreConnection);
    listsRepository = connection.getRepository(Lists);
  });

  afterEach(() => {
    listsRepository.clear();
  });

  it('Locking an existing List', async () => {
    await listsRepository.insert({
      ...LIST_DATE,
    });

    const accomplishTask = await lockListService.lockList(':memory:', 5407, 10);

    const { lockStatus, lockUserId } = await listsRepository.findOne({ where: { id: 5407 } });

    expect(accomplishTask).toBeTruthy();
    expect(lockStatus).toBeDefined();
    expect(lockUserId).toBe(10);
  });

  it('Locking a list that does not exist', async () => {
    await listsRepository.insert({
      ...LIST_DATE,
    });

    const accomplishTask = await lockListService.lockList(':memory:', 5408, 10);

    const list = await listsRepository.findOne({ where: { id: 5408 } });

    expect(accomplishTask).toBeFalsy();
    expect(list).toBeNull();
  });

  it('Locking a locked list', async () => {
    await listsRepository.insert({
      ...LIST_DATE,
      lockStatus: '2023-03-15T17:08:40.180Z',
      lockUserId: 10,
    });

    const accomplishTask = await lockListService.lockList(':memory:', 5407, 11);

    const { lockStatus, lockUserId } = await listsRepository.findOne({ where: { id: 5407 } });

    expect(accomplishTask).toBeFalsy();
    expect(lockStatus).toBeDefined();
    expect(lockUserId).toBe(10);
  });

  it('Unlocking an existing List', async () => {
    await listsRepository.insert({
      ...LIST_DATE,
      lockStatus: '2023-03-15T17:08:40.180Z',
      lockUserId: 10,
    });

    const accomplishTask = await lockListService.unlockList(':memory:', 5407, 10);

    const { lockStatus, lockUserId } = await listsRepository.findOne({ where: { id: 5407 } });

    expect(accomplishTask).toBeTruthy();
    expect(lockStatus).toBeNull();
    expect(lockUserId).toBe(10);
  });

  it('Unlocking an existing List with different user', async () => {
    await listsRepository.insert({
      ...LIST_DATE,
      lockStatus: '2023-03-15T17:08:40.180Z',
      lockUserId: 10,
    });

    const accomplishTask = await lockListService.unlockList(':memory:', 5407, 12);

    const { lockStatus, lockUserId } = await listsRepository.findOne({ where: { id: 5407 } });

    expect(accomplishTask).toBeFalsy();
    expect(lockStatus).toBeDefined();
    expect(lockUserId).toBe(10);
  });

  it('Unlocking a list that does not exist', async () => {
    await listsRepository.insert({
      ...LIST_DATE,
      lockStatus: '2023-03-15T17:08:40.180Z',
      lockUserId: 10,
    });

    const accomplishTask = await lockListService.lockList(':memory:', 5408, 10);

    const list = await listsRepository.findOne({ where: { id: 5408 } });

    expect(accomplishTask).toBeFalsy();
    expect(list).toBeNull();
  });
});
