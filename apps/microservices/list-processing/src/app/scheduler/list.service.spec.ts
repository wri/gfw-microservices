import { Test, TestingModule } from '@nestjs/testing';
import { ClientStoreConnection, Lists, Organization } from '@wri-monorepos/sql';
import { ListService } from './list.service';
import { subDays } from 'date-fns';

jest.useFakeTimers().setSystemTime(new Date('2025-05-07T18:00:55.154Z'));

describe('ListService', () => {
  let service: ListService;
  let clientStoreConnection: ClientStoreConnection;

  const mockOrganization: Organization = {
    id: 1,
    organizationDb: 'test_db',
    organizationName: 'Test Organization',
    organizationStatusId: 1,
    organizationActivatedTime: new Date(),
    renewalTime: new Date(),
    subscriptionStatusId: 1,
    featureFlags: [],
  };

  const mockConnection = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const mockClientStoreConnection = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: ClientStoreConnection,
          useValue: mockClientStoreConnection,
        },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
    clientStoreConnection = module.get(ClientStoreConnection);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrganizationConnection', () => {
    it('should create a connection for the organization', async () => {
      const connection = await service['createOrganizationConnection'](mockOrganization);
      expect(connection).toBeDefined();
      expect(clientStoreConnection.getConnection).toHaveBeenCalledWith(
        mockOrganization.organizationDb
      );
    });
  });

  describe('unlockLists', () => {
    it('should unlock lists that are older than 24 hours', async () => {
      const yesterday = subDays(new Date(), 1);

      await service.unlockLists(mockOrganization);

      expect(clientStoreConnection.getConnection).toHaveBeenCalledWith(
        mockOrganization.organizationDb
      );
      expect(mockConnection.createQueryBuilder).toHaveBeenCalled();
      expect(mockConnection.update).toHaveBeenCalledWith(Lists);
      expect(mockConnection.set).toHaveBeenCalledWith({
        lockStatus: null,
        lockUserId: null,
      });
      expect(mockConnection.where).toHaveBeenCalledWith('lockStatus <= :yesterday ', { yesterday });
      expect(mockConnection.execute).toHaveBeenCalled();
    });
  });
});
