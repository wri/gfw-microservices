import { ClientStoreConnection } from '@wri-monorepos/sql';
import { User } from '@wri-monorepos/sql';
import { getUserEmail } from './user.utils';

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn(),
  User: jest.fn(),
}));

describe('getUserEmail', () => {
  const mockConnection = {
    getRepository: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mockClientStoreConnection = jest.fn().mockImplementation(() => ({
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    }));
    (ClientStoreConnection as unknown as jest.Mock) = mockClientStoreConnection;
    mockConnection.getRepository.mockReturnValue(mockUserRepository);
  });

  it('should return user email when user is found', async () => {
    const testEmail = 'test@example.com';
    const testUserId = 123;
    const testOrgDb = 'test_org';

    mockUserRepository.findOne.mockResolvedValue({ email: testEmail });

    const result = await getUserEmail(testOrgDb, testUserId);

    expect(result).toBe(testEmail);
    expect(ClientStoreConnection).toHaveBeenCalled();
    expect(mockConnection.getRepository).toHaveBeenCalledWith(User);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { id: testUserId },
    });
  });

  it('should throw error when user is not found', async () => {
    const testUserId = 123;
    const testOrgDb = 'test_org';

    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(getUserEmail(testOrgDb, testUserId)).rejects.toThrow();
  });
});
