import { Test, TestingModule } from '@nestjs/testing';
import { UserUseCases } from './user.use-case';
import { ListUseCases } from '../../List/application/list.use-case';
import { UserRepository } from '../domain/user.repository';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { User, UserOrganization } from '../domain/user';
import { List } from '../../List/domain/list.entity';
import { ERRORS } from '../../Shared/domain/constants';

const moduleMocker = new ModuleMocker(global);

describe('UserUseCases', () => {
  let useCases: UserUseCases;
  let listUseCases: ListUseCases;

  const userRepo: UserRepository = {
    getUserByEmail: jest.fn(),
    getUserAdminOrg: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUseCases,
        ListUseCases,
        { provide: UserRepository, useValue: userRepo },
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

    useCases = module.get<UserUseCases>(UserUseCases);
    listUseCases = module.get<ListUseCases>(ListUseCases);
  });

  describe('getUserDB', () => {
    it('should return the organization DB when the user and organization exist', async () => {
      // Mock dependencies
      const email = 'test@example.com';
      const organizationId = 1;
      const userOrganizations: UserOrganization[] = [
        {
          id: 1,
          organizationDb: 'db1',
          organizationStatusId: 1,
          organizationName: 'test',
        },
        {
          id: 2,
          organizationDb: 'db2',
          organizationStatusId: 1,
          organizationName: 'test2',
        },
      ];

      jest
        .spyOn(userRepo, 'getUserAdminOrg')
        .mockResolvedValue(Result.ok(userOrganizations));

      const result = await useCases.getUserDB(email, organizationId);

      expect(userRepo.getUserAdminOrg).toHaveBeenCalledWith(email);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe('db1');
    });

    it('should return failure if the user or organization does not exist', async () => {
      // Mock dependencies
      const email = 'test@example.com';
      const organizationId = 3;
      const userOrganizations: UserOrganization[] = [
        {
          id: 1,
          organizationDb: 'test',
          organizationStatusId: 1,
          organizationName: 'test',
        },
        {
          id: 2,
          organizationDb: 'test2',
          organizationStatusId: 1,
          organizationName: 'test2',
        },
      ];

      jest
        .spyOn(userRepo, 'getUserAdminOrg')
        .mockResolvedValue(Result.ok(userOrganizations));

      const result = await useCases.getUserDB(email, organizationId);

      expect(userRepo.getUserAdminOrg).toHaveBeenCalledWith(email);
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.NOT_ELEMENTS_FOUND);
    });
  });

  describe('checkUserIsListAdmin', () => {
    it('should return true if the user is an admin of the list', async () => {
      // Mock dependencies
      const email = 'test@example.com';
      const listId = 1;
      const db = 'db1';
      const orgId = 1;
      const user: User = {
        id: 1,
        firstName: 'test',
        lastName: 'test',
        email: 'test@example.com',
        phone: '111111',
      };
      const userOrganizations: UserOrganization[] = [
        {
          id: 1,
          organizationDb: 'test',
          organizationStatusId: 1,
          organizationName: 'test',
        },
        {
          id: 2,
          organizationDb: 'test2',
          organizationStatusId: 1,
          organizationName: 'test2',
        },
      ];
      const list: List = {
        id: 1,
        userId: 2,
        templateId: 3,
        listName: 'test',
        listTableName: 'test',
        listAnalysisTableName: 'test',
        listStatusId: 0,
        listErrorMessage: 'test',
        locationClassification: 'test',
        customAttributeNames: 'test',
        customAttributeTypes: 'test',
        listLocationsCount: 0,
        lockStatus: 0,
        lockUserId: 0,
        associatedGfwlist: 0,
        dashboardLastSubmit: undefined,
        dashboardLastResults: undefined,
        vectorTilesStoragePath: 'test',
        errorFileStoragePath: 'test',
        vectorTilesLastUpdated: undefined,
      };

      jest.spyOn(userRepo, 'getUserByEmail').mockResolvedValue(Result.ok(user));
      jest
        .spyOn(userRepo, 'getUserAdminOrg')
        .mockResolvedValue(Result.ok(userOrganizations));
      jest
        .spyOn(listUseCases, 'findListById')
        .mockResolvedValue(Result.ok(list));

      const result = await useCases.checkUserIsListAdmin(
        email,
        listId,
        db,
        orgId,
      );

      expect(userRepo.getUserByEmail).toHaveBeenCalledWith(email, db);
      expect(userRepo.getUserAdminOrg).toHaveBeenCalledWith(email);
      expect(listUseCases.findListById).toHaveBeenCalledWith(listId, orgId);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it('should return failure if the user is not an admin of the list', async () => {
      // Mock dependencies
      const email = 'test@example.com';
      const listId = 1;
      const db = 'db1';
      const orgId = 3;
      const user: User = {
        id: 1,
        firstName: 'test',
        lastName: 'test',
        email: 'test@example.com',
        phone: '111111',
      };
      const userOrganizations: UserOrganization[] = [
        {
          id: 1,
          organizationDb: 'test',
          organizationStatusId: 1,
          organizationName: 'test',
        },
        {
          id: 2,
          organizationDb: 'test2',
          organizationStatusId: 1,
          organizationName: 'test2',
        },
      ];
      const list: List = {
        id: 1,
        userId: 2,
        templateId: 3,
        listName: 'test',
        listTableName: 'test',
        listAnalysisTableName: 'test',
        listStatusId: 0,
        listErrorMessage: 'test',
        locationClassification: 'test',
        customAttributeNames: 'test',
        customAttributeTypes: 'test',
        listLocationsCount: 0,
        lockStatus: 0,
        lockUserId: 0,
        associatedGfwlist: 0,
        dashboardLastSubmit: undefined,
        dashboardLastResults: undefined,
        vectorTilesStoragePath: 'test',
        errorFileStoragePath: 'test',
        vectorTilesLastUpdated: undefined,
      };

      jest.spyOn(userRepo, 'getUserByEmail').mockResolvedValue(Result.ok(user));
      jest
        .spyOn(userRepo, 'getUserAdminOrg')
        .mockResolvedValue(Result.ok(userOrganizations));
      jest
        .spyOn(listUseCases, 'findListById')
        .mockResolvedValue(Result.ok(list));

      const result = await useCases.checkUserIsListAdmin(
        email,
        listId,
        db,
        orgId,
      );

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBeInstanceOf(ResultError);
    });
  });
});
