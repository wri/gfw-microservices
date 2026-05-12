import { Test, TestingModule } from '@nestjs/testing';
import { ListMessageController } from './list.message.controller';
import { PipeService } from '../pipe/pipe.service';
import { ZodValidationPipe } from './list.message.controller';
import { BadRequestException } from '@nestjs/common';
import { AlertsTimeframes, BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { CSVInputTypes } from './message.schema';

describe('ListMessageController', () => {
  let controller: ListMessageController;
  let pipeService: PipeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListMessageController],
      providers: [
        PipeService,
        {
          provide: PipeService,
          useValue: {
            makeFile: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = await module.resolve<ListMessageController>(ListMessageController);
    pipeService = module.get<PipeService>(PipeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('download', () => {
    it('should call makeFile with the correct body', async () => {
      const body: BasicFieldsFileRequest = {
        listId: 1,
        type: CSVInputTypes.AFI,
        isGFWList: false,
      };

      await controller.download(body);

      expect(pipeService.makeFile).toHaveBeenCalledWith(body);
    });

    it('should return the body', async () => {
      const body: BasicFieldsFileRequest = {
        listId: 1,
        type: CSVInputTypes.AFI,
        isGFWList: false,
      };

      const result = await controller.download(body);

      expect(result).toEqual(body);
    });

    it('should throw BadRequestException for invalid date range', async () => {
      const invalidDateRequest = {
        listId: 123,
        type: CSVInputTypes.ALERTS,
        isGFWList: false,
        selectedTimeframe: AlertsTimeframes.YEAR,
        selectedAlert: 'GLAD',
        startDate: '2023-12-31T00:00:00Z',
        endDate: '2023-01-01T00:00:00Z',
      };

      try {
        await controller.download(invalidDateRequest);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException for invalid data', async () => {
      const body = {
        listId: 'invalid',
        type: 'invalid',
        isGFWList: 'invalid',
      };

      try {
        await controller.download(body as unknown as BasicFieldsFileRequest);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const invalidRequest = {
        listId: 123,
        type: CSVInputTypes.AFI,
        isGFWList: false,
        userEmail: 'invalid-email',
      };

      try {
        await controller.download(invalidRequest);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw BadRequestException for invalid listId', async () => {
      const invalidRequest = {
        listId: -1,
        type: CSVInputTypes.AFI,
        isGFWList: false,
      };

      try {
        await controller.download(invalidRequest);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw an error for invalid date format', async () => {
      const invalidData = {
        listId: 1,
        type: 'alerts',
        selectedTimeframe: 'someTimeframe',
        selectedAlert: 'someAlert',
        startDate: 'invalid-date',
        endDate: '2023-01-31',
        isGFWList: false,
      };

      try {
        await controller.download(invalidData);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  it('should throw an error if startDate is after endDate', async () => {
    const invalidData = {
      listId: 1,
      type: 'accountUsersUsage',
      startDate: '2023-02-01',
      endDate: '2023-01-31',
    };

    try {
      await controller.download(invalidData);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });
});

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe();
  });

  it('should validate and transform valid data', () => {
    const value: BasicFieldsFileRequest = {
      listId: 1,
      type: CSVInputTypes.AFI,
      isGFWList: false,
    };

    const result = pipe.transform(value);

    expect(result).toEqual(value);
  });

  it('should throw BadRequestException for invalid data', () => {
    const value: any = {
      listId: 'invalid',
      type: 'invalid',
      isGFWList: 'invalid',
    };

    try {
      pipe.transform(value);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });
});
