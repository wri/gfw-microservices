import { Test, TestingModule } from '@nestjs/testing';
import { ListMessageController } from './list.message.controller';
import { PipeService } from '../pipe/pipe.service';
import { ZodValidationPipe } from './list.message.controller';
import { BadRequestException } from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { CSVInputTypes } from './list.message.controller';

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
            makeFile: jest.fn(),
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

    it('should throw BadRequestException for invalid data', async () => {
      const body: any = {
        listId: 'invalid',
        type: 'invalid',
        isGFWList: 'invalid',
      };

      try {
        await controller.download(body);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
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
