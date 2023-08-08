import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogUseCases } from './activity-log.use-case';
import { ActivityLogRepository } from '../domain/activity-log.repository';
import { UserRepository } from '../../User/domain/user.repository';
import { ActivityLogDataMapper } from './activity-log.mapper';
import { UserUseCases } from '../../User/application/user.use-case';
import { ERRORS } from '../../Shared/domain/constants';
import Result from '../../Shared/domain/result';
import { ActivityLogDto } from './dtos/activity-log.dto';
import { ActivityLog } from '../domain/activity-log';
import { User } from '../../User/domain/user';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import {
  B2bStatus,
  ConstantsConfig,
  ConstantsConfigIds,
} from '@wri-monorepos/constants';

const moduleMocker = new ModuleMocker(global);
describe('ActivityLogUseCases', () => {
  let useCases: ActivityLogUseCases;
  let mapper: ActivityLogDataMapper;
  let userUseCases: UserUseCases;
  let typesStatus: B2bStatus;

  const activityLogRepositoryMock: ActivityLogRepository = {
    saveActivityLog: jest.fn(),
  };

  const userRepositoryMock: UserRepository = {
    getUserByEmail: jest.fn(),
    getUserAdminOrg: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogUseCases,
        { provide: ActivityLogRepository, useValue: activityLogRepositoryMock },
        { provide: UserRepository, useValue: userRepositoryMock },
        ActivityLogDataMapper,
        UserUseCases,
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

    useCases = module.get<ActivityLogUseCases>(ActivityLogUseCases);
    mapper = module.get<ActivityLogDataMapper>(ActivityLogDataMapper);
    userUseCases = module.get<UserUseCases>(UserUseCases);
    typesStatus = await module.resolve(ConstantsConfigIds.B2B_STATUS);
  });

  describe('saveActivityLog', () => {
    it('should save the activity log and return success', async () => {
      const logDto: ActivityLogDto = {
        userEmail: 'test',
        activityType: typesStatus.ConnectionAccepted,
        organizationTarget: 0,
        description: 'test',
      };

      const log: ActivityLog = {
        user: new User(),
        type: typesStatus.ConnectionAccepted,
        description: 0,
        time: 0,
      };

      const db = 'db-test';

      jest.spyOn(userUseCases, 'getUserDB').mockResolvedValue(Result.ok(db));
      jest.spyOn(mapper, 'createLog').mockResolvedValue(Result.ok(log));
      jest
        .spyOn(activityLogRepositoryMock, 'saveActivityLog')
        .mockResolvedValue(Result.ok(true));

      const result = await useCases.saveActivityLog(logDto);

      expect(userUseCases.getUserDB).toHaveBeenCalledWith(
        logDto.userEmail,
        logDto.organizationTarget,
      );
      expect(mapper.createLog).toHaveBeenCalledWith(
        logDto,
        db,
        userRepositoryMock,
      );
      expect(activityLogRepositoryMock.saveActivityLog).toHaveBeenCalledWith(
        log,
        db,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it('should return failure if the activity type is invalid', async () => {
      const logDto: ActivityLogDto = {
        userEmail: 'test',
        activityType: 0,
        organizationTarget: 0,
        description: 'test',
      };

      const log: ActivityLog = {
        user: new User(),
        type: 0,
        description: 0,
        time: 0,
      };

      const db = 'db-test';

      jest.spyOn(userUseCases, 'getUserDB').mockResolvedValue(Result.ok(db));
      jest.spyOn(mapper, 'createLog').mockResolvedValue(Result.ok(log));
      jest
        .spyOn(activityLogRepositoryMock, 'saveActivityLog')
        .mockResolvedValue(Result.ok(true));

      const result = await useCases.saveActivityLog(logDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.BAD_REQUEST);
    });

    it('should return failure if getting the user DB fails', async () => {
      const logDto: ActivityLogDto = {
        userEmail: 'test',
        activityType: 0,
        organizationTarget: 0,
        description: 'test',
      };

      const log: ActivityLog = {
        user: new User(),
        type: 0,
        description: 0,
        time: 0,
      };

      jest
        .spyOn(userUseCases, 'getUserDB')
        .mockResolvedValue(Result.fail(ERRORS.NOT_ELEMENTS_FOUND));
      jest.spyOn(mapper, 'createLog').mockResolvedValue(Result.ok(log));
      jest
        .spyOn(activityLogRepositoryMock, 'saveActivityLog')
        .mockResolvedValue(Result.ok(true));

      const result = await useCases.saveActivityLog(logDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.BAD_REQUEST);
    });

    it('should return failure if creating the log fails', async () => {
      const logDto: ActivityLogDto = {
        userEmail: 'test',
        activityType: typesStatus.ConnectionAccepted,
        organizationTarget: 0,
        description: 'test',
      };

      const db = 'db-test';

      jest.spyOn(userUseCases, 'getUserDB').mockResolvedValue(Result.ok(db));
      jest
        .spyOn(mapper, 'createLog')
        .mockResolvedValue(Result.fail(ERRORS.BAD_REQUEST));
      jest
        .spyOn(activityLogRepositoryMock, 'saveActivityLog')
        .mockResolvedValue(Result.ok(true));

      const result = await useCases.saveActivityLog(logDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.BAD_REQUEST);
    });

    it('should return failure if saving the activity log fails', async () => {
      const logDto: ActivityLogDto = {
        userEmail: 'test',
        activityType: typesStatus.ConnectionAccepted,
        organizationTarget: 0,
        description: 'test',
      };

      const log: ActivityLog = {
        user: new User(),
        type: typesStatus.ConnectionAccepted,
        description: 0,
        time: 0,
      };

      const db = 'db-test';

      jest.spyOn(userUseCases, 'getUserDB').mockResolvedValue(Result.ok(db));
      jest.spyOn(mapper, 'createLog').mockResolvedValue(Result.ok(log));
      jest
        .spyOn(activityLogRepositoryMock, 'saveActivityLog')
        .mockResolvedValue(Result.fail(ERRORS.BAD_REQUEST));

      const result = await useCases.saveActivityLog(logDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.BAD_REQUEST);
    });
  });
});
