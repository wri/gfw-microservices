import { Test, TestingModule } from '@nestjs/testing';
import { Task } from './task';
import { UnlockListService } from './unlock.list.service';
import { Logger } from '@nestjs/common';

jest.useFakeTimers();

describe('Task', () => {
  let service: Task;
  let unlockListService: UnlockListService;
  let logger: Logger;

  beforeEach(async () => {
    const mockUnlockListService = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Task,
        {
          provide: UnlockListService,
          useValue: mockUnlockListService,
        },
      ],
    }).compile();

    service = module.get<Task>(Task);
    unlockListService = module.get(UnlockListService);
    const loggerDescriptor = Object.getOwnPropertyDescriptor(service, 'logger');
    logger = loggerDescriptor?.value as Logger;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('performingDailyTasks', () => {
    it('should execute unlock list service after random delay', async () => {
      const mockDate = new Date('2024-01-01T01:00:00Z');
      jest.setSystemTime(mockDate);

      const promise = service.performingDailyTasks();

      // Fast-forward through the random delay
      jest.runAllTimers();

      await promise;

      expect(unlockListService.execute).toHaveBeenCalled();
    });

    it('should log execution time and random delay', async () => {
      const mockDate = new Date('2024-01-01T01:00:00Z');
      jest.setSystemTime(mockDate);

      const logSpy = jest.spyOn(logger, 'log');

      const promise = service.performingDailyTasks();
      jest.runAllTimers();
      await promise;

      expect(logSpy).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('Performing daily tasks, executed at: 2024-01-01 01:00:00')
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/Random delay: \d+ minutes \(\d+ ms\)/)
      );
    });
  });
});
