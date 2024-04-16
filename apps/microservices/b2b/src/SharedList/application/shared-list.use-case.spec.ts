import { Test, TestingModule } from '@nestjs/testing';
import { SharedListUseCases } from './shared-list.use-case';
import { SharedListRepository } from '../domain/shared-list.repository';
import { ConnectionUseCases } from '../../Connection/application/connection.use-case';
import { UserUseCases } from '../../User/application/user.use-case';
import { OrganizationUseCases } from '../../Organization/application/organization.use-case';
import { ERRORS } from '../../Shared/domain/constants';
import { QueryCriteria } from '../../Shared/domain/criteria/query';
import { SearchResult } from '../../Shared/domain/types';
import Result from '../../Shared/domain/result';
import { SharedList } from '../domain/shared-list.entity';
import { ConnectionRequest } from '../../Connection/domain/connection.entity';
import { Organization } from '../../Organization/domain/organization.entity';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ConstantsConfig, ConstantsConfigIds } from '@wri-monorepos/constants';

const moduleMocker = new ModuleMocker(global);

describe('SharedListUseCases', () => {
  let useCases: SharedListUseCases;
  let connectionUseCases: ConnectionUseCases;
  let userUseCases: UserUseCases;
  let organizationUseCases: OrganizationUseCases;

  const sharedListRepository: SharedListRepository = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharedListUseCases,
        { provide: SharedListRepository, useValue: sharedListRepository },
        ConnectionUseCases,
        UserUseCases,
        OrganizationUseCases,
        ConstantsConfig[ConstantsConfigIds.B2B_STATUS],
      ],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    useCases = module.get<SharedListUseCases>(SharedListUseCases);
    connectionUseCases = module.get<ConnectionUseCases>(ConnectionUseCases);
    userUseCases = module.get<UserUseCases>(UserUseCases);
    organizationUseCases =
      module.get<OrganizationUseCases>(OrganizationUseCases);
  });

  describe('createSharedList', () => {
    it('should create a shared list', async () => {
      const orgId = 1;
      const userEmail = 'test@example.com';
      const listId = 1;
      const orgTargetId = 2;
      const connectionResult: ConnectionRequest = {
        id: 1,
        idSourceOrganization: 1,
        idTargetOrganization: 2,
        createDate: new Date('2022-01-01'),
        sourceEmail: 'test@example.com',
        initialTargetEmail: 'test2@example.com',
      };
      const orgRes: Organization = {
        id: 1,
        organizationName: 'test',
        organizationDb: 'db1',
        organizationStatusId: 1,
        organizationActivatedTime: new Date('2022-01-01'),
        renewalTime: new Date('2022-01-01'),
        subscriptionStatusId: 1,
      };
      const checkRes = Result.ok(true);
      const sharedList: SharedList = {
        id: 1,
        idConnectionRequest: 2,
        idList: 3,
        editedDate: new Date(),
        sharedWithGeometry: false,
        enabled: false,
      };

      jest
        .spyOn(connectionUseCases, 'getConnectionRequestID')
        .mockResolvedValue(Result.ok(connectionResult));
      jest
        .spyOn(organizationUseCases, 'findById')
        .mockResolvedValue(Result.ok(orgRes));
      jest
        .spyOn(userUseCases, 'checkUserIsListAdmin')
        .mockResolvedValue(checkRes);
      jest
        .spyOn(sharedListRepository, 'create')
        .mockResolvedValue(Result.ok(sharedList));

      const result = await useCases.createSharedList(orgId, {
        userEmail,
        listId,
        orgTargetId,
      });

      expect(connectionUseCases.getConnectionRequestID).toHaveBeenCalledWith(
        orgId,
        orgTargetId,
      );
      expect(organizationUseCases.findById).toHaveBeenCalledWith(orgId);
      expect(userUseCases.checkUserIsListAdmin).toHaveBeenCalledWith(
        userEmail,
        listId,
        'db1',
        orgId,
      );
      expect(sharedListRepository.create).toHaveBeenCalled();
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(sharedList);
    });

    it('should return failure if the connection request is not found', async () => {
      const orgId = 1;
      const userEmail = 'test@example.com';
      const listId = 1;
      const orgTargetId = 2;

      jest
        .spyOn(connectionUseCases, 'getConnectionRequestID')
        .mockResolvedValue(
          Result.fail(ERRORS.HAS_NOT_CONNECTIONS_WITH_COMPANY),
        );

      const result = await useCases.createSharedList(orgId, {
        userEmail,
        listId,
        orgTargetId,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.HAS_NOT_CONNECTIONS_WITH_COMPANY);
    });

    it('should return failure if getting the organization fails', async () => {
      const orgId = 1;
      const userEmail = 'test@example.com';
      const listId = 1;
      const orgTargetId = 2;
      const connectionResult: ConnectionRequest = {
        id: 1,
        idSourceOrganization: 1,
        idTargetOrganization: 2,
        createDate: new Date('2022-01-01'),
        sourceEmail: 'test@example.com',
        initialTargetEmail: 'test2@example.com',
      };
      const orgRes = Result.fail(ERRORS.NOT_ELEMENTS_FOUND);

      jest
        .spyOn(connectionUseCases, 'getConnectionRequestID')
        .mockResolvedValue(Result.ok(connectionResult));
      jest.spyOn(organizationUseCases, 'findById').mockResolvedValue(orgRes);

      const result = await useCases.createSharedList(orgId, {
        userEmail,
        listId,
        orgTargetId,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.NOT_ELEMENTS_FOUND);
    });

    it('should return failure if the user is not an admin of the list', async () => {
      const orgId = 1;
      const userEmail = 'test@example.com';
      const listId = 1;
      const orgTargetId = 2;
      const connectionResult: ConnectionRequest = {
        id: 1,
        idSourceOrganization: 1,
        idTargetOrganization: 2,
        createDate: new Date('2022-01-01'),
        sourceEmail: 'test@example.com',
        initialTargetEmail: 'test2@example.com',
      };
      const orgRes: Organization = {
        id: 1,
        organizationName: 'test',
        organizationDb: 'db1',
        organizationStatusId: 1,
        organizationActivatedTime: new Date('2022-01-01'),
        renewalTime: new Date('2022-01-01'),
        subscriptionStatusId: 1,
      };
      const checkRes = Result.fail(ERRORS.NOT_ELEMENTS_FOUND);

      jest
        .spyOn(connectionUseCases, 'getConnectionRequestID')
        .mockResolvedValue(Result.ok(connectionResult));
      jest
        .spyOn(organizationUseCases, 'findById')
        .mockResolvedValue(Result.ok(orgRes));
      jest
        .spyOn(userUseCases, 'checkUserIsListAdmin')
        .mockResolvedValue(checkRes);

      const result = await useCases.createSharedList(orgId, {
        userEmail,
        listId,
        orgTargetId,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.NOT_ELEMENTS_FOUND);
    });
  });

  describe('search', () => {
    it('should search shared lists based on the query criteria', async () => {
      const query = new QueryCriteria([], []);
      const items: SharedList[] = [
        {
          id: 1,
          idConnectionRequest: 2,
          idList: 3,
          editedDate: new Date(),
          sharedWithGeometry: false,
          enabled: true,
        },
        {
          id: 2,
          idConnectionRequest: 2,
          idList: 3,
          editedDate: new Date(),
          sharedWithGeometry: false,
          enabled: true,
        },
      ];
      const searchResult: SearchResult<SharedList> = {
        count: 2,
        offset: 0,
        limit: 10,
        items,
      };

      jest
        .spyOn(sharedListRepository, 'search')
        .mockResolvedValue(Result.ok(searchResult));

      const result = await useCases.search(query);

      expect(sharedListRepository.search).toHaveBeenCalledWith(query);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(searchResult);
    });
  });
});
