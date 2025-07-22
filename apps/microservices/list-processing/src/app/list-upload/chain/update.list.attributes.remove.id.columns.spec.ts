import { UpdateListAttributesRemoveIdColumns } from './update.list.attributes.remove.id.columns';
import { ClientStoreConnection } from '@wri-monorepos/sql';
import { ChainType, RequestNewList } from './types';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn().mockResolvedValue({
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        query: jest.fn(),
      }),
    }),
  })),
  getMissingJsonPropertiesFromList: 'MOCKED_QUERY',
}));

jest.mock('@wri-monorepos/shared', () => ({
  ID_TYPE_HANDLER: {
    type1: { validateColumns: ['id1', 'id2'] },
    type2: { validateColumns: ['id3'] },
  },
}));

describe('UpdateListAttributesRemoveIdColumns', () => {
  let handler: UpdateListAttributesRemoveIdColumns;
  let mockQueryRunner: any;
  let mockConnection: any;
  let mockClientStoreConnection: any;

  const sourceListId = 123;
  const organization_database = 'test_db';

  beforeEach(() => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      query: jest.fn(),
    };
    mockConnection = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };
    mockClientStoreConnection = new ClientStoreConnection();
    mockClientStoreConnection.getConnection = jest.fn().mockResolvedValue(mockConnection);
    handler = new UpdateListAttributesRemoveIdColumns({
      sourceListId,
      isNotDeletingTheSourceList: true,
      clientStoreConnection: mockClientStoreConnection,
    });
  });

  it('should not proceed if isNotDeletingTheSourceList is false', async () => {
    handler = new UpdateListAttributesRemoveIdColumns({
      sourceListId,
      isNotDeletingTheSourceList: false,
      clientStoreConnection: mockClientStoreConnection,
    });
    const input: ChainType = {
      request: { organization_database } as RequestNewList,
    };
    const result = await handler.handle(input);
    expect(result).toBe(input);
  });

  it('should delete attributes with no data in source table', async () => {
    const input: ChainType = {
      request: { organization_database } as RequestNewList,
    };
    const emptyJsonProperties = ['id1', 'id2'];
    mockQueryRunner.query
      .mockResolvedValueOnce(emptyJsonProperties.map((MissingProperties) => ({ MissingProperties })))
      .mockResolvedValueOnce(undefined); // for delete

    await handler.handle(input);

    expect(mockQueryRunner.connect).toHaveBeenCalled();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.query).toHaveBeenCalledWith('MOCKED_QUERY', [sourceListId]);
    expect(mockQueryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM [ListAttributes]'),
      [sourceListId]
    );
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('should not delete if no emptyJsonProperties', async () => {
    const input: ChainType = {
      request: { organization_database } as RequestNewList,
    };
    mockQueryRunner.query.mockResolvedValueOnce([]);

    await handler.handle(input);

    expect(mockQueryRunner.query).toHaveBeenCalledWith('MOCKED_QUERY', [sourceListId]);
    expect(mockQueryRunner.query).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM [ListAttributes]'),
      expect.anything()
    );
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('should rollback transaction and throw on error', async () => {
    const input: ChainType = {
      request: { organization_database } as RequestNewList,
    };
    mockQueryRunner.query.mockRejectedValueOnce(new Error('fail'));

    await expect(handler.handle(input)).rejects.toThrow('fail');
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});
