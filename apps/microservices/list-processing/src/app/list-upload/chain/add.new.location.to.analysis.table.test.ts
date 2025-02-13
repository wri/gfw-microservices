import { AddNewLocationToAnalysisTable } from './add.new.location.to.analysis.table';
import { ClientStoreConnection } from '@wri-monorepos/sql';
import { ChainType, RequestNewList } from './types';
import { DataSource, EntitySchema, SelectQueryBuilder } from 'typeorm';

jest.mock('@wri-monorepos/sql');

describe('AddMewLocationToAnalysisTable', () => {
  let handler: AddNewLocationToAnalysisTable;
  let mockConnection: jest.Mocked<DataSource>;
  let mockClientStoreConnection: jest.Mocked<ClientStoreConnection>;

  beforeEach(() => {
    mockClientStoreConnection = new ClientStoreConnection() as jest.Mocked<ClientStoreConnection>;
    mockConnection = {
      createQueryBuilder: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn(), // Ensure execute is a Jest mock function
      }),
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn(), // Ensure execute is a Jest mock function
      getRawMany: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<DataSource>;

    // Mocking the query builder methods
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([
          { list_location_id: 1 },
          { list_location_id: 2 },
          { list_location_id: 3 },
        ]),
    } as unknown as SelectQueryBuilder<unknown>;

    mockConnection.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockClientStoreConnection.getConnection = jest.fn().mockResolvedValue(mockConnection);
    handler = new AddNewLocationToAnalysisTable(mockClientStoreConnection);
  });
  it('should get location IDs from the database', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        listTable: 'test_list',
      } as RequestNewList,
    };

    const locationIds = await handler.getAllLocationIds(request);

    expect(mockConnection.createQueryBuilder().select).toHaveBeenCalledWith('list.locationId');
    expect(mockConnection.createQueryBuilder().from).toHaveBeenCalledWith(
      expect.any(EntitySchema),
      'list'
    );
    expect(locationIds).toEqual([1, 2, 3]);
  });

  it('should call insertBatch with the correct parameters', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        listTable: 'test_list',
      } as RequestNewList,
    };

    // Mocking the return value of getAllLocationIds
    jest.spyOn(handler, 'getAllLocationIds').mockResolvedValue([1, 2, 3]);

    // Create a mock for the insertBatch method
    const insertBatchMock = jest.fn();
    handler['insertBatch'] = insertBatchMock; // Accessing the private method directly

    await handler.handle(request);

    expect(insertBatchMock).toHaveBeenCalledTimes(1); // Check if insertBatch was called
    expect(insertBatchMock).toHaveBeenCalledWith(
      mockConnection,
      expect.any(EntitySchema),
      expect.arrayContaining([
        expect.objectContaining({ locationId: 1, locationStatusId: 1 }),
        expect.objectContaining({ locationId: 2, locationStatusId: 1 }),
        expect.objectContaining({ locationId: 3, locationStatusId: 1 }),
      ])
    );
  });
});
