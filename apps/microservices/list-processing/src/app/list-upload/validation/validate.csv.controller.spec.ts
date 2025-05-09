import { Test, TestingModule } from '@nestjs/testing';
import { ValidateCSVController } from './validate.csv.controller';
import { ValidateCSVService } from './validate.csv.service';
import { z } from 'zod';

describe('ValidateCSVController', () => {
  let controller: ValidateCSVController;
  let service: ValidateCSVService;

  const mockValidateCSVService = {
    execute: jest.fn(),
  };

  const RequestValidateCSVSchema = z.object({
    fileName: z.string(),
    templateId: z.coerce.number(),
  });

  type RequestValidateCSVType = z.infer<typeof RequestValidateCSVSchema>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidateCSVController],
      providers: [
        {
          provide: ValidateCSVService,
          useValue: mockValidateCSVService,
        },
      ],
    }).compile();

    controller = module.get<ValidateCSVController>(ValidateCSVController);
    service = module.get<ValidateCSVService>(ValidateCSVService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getObjectPresignedURL', () => {
    it('should return validation results with no errors', async () => {
      const query: RequestValidateCSVType = {
        fileName: 'test.csv',
        templateId: 1,
      };

      mockValidateCSVService.execute.mockResolvedValueOnce([]);

      const result = await controller.getObjectPresignedURL(query);

      expect(result).toEqual({
        hasError: false,
        errorList: [],
      });
      expect(service.execute).toHaveBeenCalledWith('test.csv', 1);
    });

    it('should return validation results with errors', async () => {
      const query: RequestValidateCSVType = {
        fileName: 'test.csv',
        templateId: 1,
      };

      const mockErrors = ['Error 1', 'Error 2'];
      mockValidateCSVService.execute.mockResolvedValueOnce(mockErrors);

      const result = await controller.getObjectPresignedURL(query);

      expect(result).toEqual({
        hasError: true,
        errorList: mockErrors,
      });
      expect(service.execute).toHaveBeenCalledWith('test.csv', 1);
    });

    it('should throw BadRequestException for invalid templateId', async () => {
      const query = {
        fileName: 'test.csv',
        templateId: NaN,
      } as RequestValidateCSVType;

      await expect(controller.getObjectPresignedURL(query)).rejects.toThrow();
    });
  });
});
