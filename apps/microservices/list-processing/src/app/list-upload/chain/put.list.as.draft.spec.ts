import { PutListAsDraft } from './put.list.as.draft';
import { ChainType, RequestNewList } from './types';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';

const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockGetRepository = jest.fn().mockReturnValue({ update: mockUpdate });
const mockGetConnection = jest.fn().mockResolvedValue({ getRepository: mockGetRepository });

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: mockGetConnection,
  })),
  Lists: jest.fn(),
}));

describe('PutListAsDraft', () => {
  let handler: PutListAsDraft;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new PutListAsDraft();
  });

  it('should return input if saveAsDraft is true', async () => {
    const input: ChainType = {
      request: { saveAsDraft: true } as RequestNewList,
    };

    const result = await handler.handle(input);
    expect(result).toBe(input);
    expect(mockGetConnection).not.toHaveBeenCalled();
  });

  it('should update status to draft if hasUnanalyzableError is true', async () => {
    const input: ChainType = {
      request: {
        saveAsDraft: false,
        hasUnanalyzableError: true,
        organization_database: 'test_db',
        list_id: 123,
      } as RequestNewList,
    };

    const loggerSpy = jest.spyOn(handler['logger'], 'error');
    const result = await handler.handle(input);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Should put list as draft, has invalid coordinates or polygon geometry'
    );

    expect(mockGetConnection).toHaveBeenCalledWith('test_db');
    expect(mockGetRepository).toHaveBeenCalledWith(Lists);
    expect(mockUpdate).toHaveBeenCalledWith({ id: 123 }, { listStatusId: listStatus.Draft });
    expect(result).toEqual({
      ...input,
      request: { ...input.request, saveAsDraft: true },
    });
  });

  it('should set saveAsDraft true but not update status if required fields are missing', async () => {
    const input: ChainType = {
      request: {
        saveAsDraft: false,
        hasUnanalyzableError: true,
        // missing organization_database and list_id
      } as RequestNewList,
    };

    const result = await handler.handle(input);
    expect(mockGetConnection).not.toHaveBeenCalled();
    expect(result).toEqual({
      ...input,
      request: { ...input.request, saveAsDraft: true },
    });
  });

  it('should return input unchanged if hasUnanalyzableError is false', async () => {
    const input: ChainType = {
      request: {
        saveAsDraft: false,
        hasUnanalyzableError: false,
        organization_database: 'test_db',
        list_id: 123,
      } as RequestNewList,
    };

    const result = await handler.handle(input);
    expect(result).toBe(input);
    expect(mockGetConnection).not.toHaveBeenCalled();
  });
});
