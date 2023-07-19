import { TestingModule } from '@nestjs/testing';
import { UserUseCases } from './user.use-case';
import { ListUseCases } from '../../List/application/list.use-case';
import { UserRepository } from '../domain/user.repository';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
import { User, UserOrganization } from '../domain/user';
import { List } from '../../List/domain/list.entity';
import { ERRORS } from '../../Shared/domain/constants';
import { createMockModule } from '@wri-monorepos/shared';

describe('UserUseCases', () => {
  let useCases: UserUseCases;
  let listUseCases: ListUseCases;
  let email: string;
  let userOrganizations: UserOrganization[];
  let list: List;
  let user: User;

  const userRepo: UserRepository = {
    getUserByEmail: jest.fn(),
    getUserAdminOrg: jest.fn(),
  };

  beforeEach(async () => {
    email = 'test@example.com';

    userOrganizations = [
      {
        id: 1,
        organizationDb: 'db1',
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

    list = {
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

    user = {
      id: 1,
      firstName: 'test',
      lastName: 'test',
      email: 'test@example.com',
      phone: '111111',
    };

    const module = await createMockModule({
      providers: [
        UserUseCases,
        ListUseCases,
        { provide: UserRepository, useValue: userRepo },
      ],
    }).compile();

    useCases = module.get<UserUseCases>(UserUseCases);
    listUseCases = module.get<ListUseCases>(ListUseCases);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUserDB', () => {
    it('should return the organization DB when the user and organization exist', async () => {
      // Mock dependencies
      const organizationId = 1;

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
      const organizationId = 3;

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
      const listId = 1;
      const db = 'db1';
      const orgId = 1;

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
      const listId = 1;
      const db = 'db1';
      const orgId = 3;

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
