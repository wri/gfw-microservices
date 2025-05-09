import { Test, TestingModule } from '@nestjs/testing';
import { ValidateCSVService } from './validate.csv.service';
import { S3Service } from '@wri-monorepos/aws';
import { ValidateCsvRepository } from './validate.csv.repository';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import csv2Json from 'csvtojson';

// Mock fs.promises
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readFile: jest.fn(),
  },
  unlinkSync: jest.fn(),
}));

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@wri-monorepos/aws', () => ({
  S3Service: jest.fn().mockImplementation(() => ({
    writeS3fileIntoTmp: jest.fn(),
  })),
}));

jest.mock('csvtojson', () => jest.fn());

describe('ValidateCSVService', () => {
  let service: ValidateCSVService;
  let s3Service: jest.Mocked<S3Service>;
  let validateCSVRepository: jest.Mocked<ValidateCsvRepository>;
  let configService: jest.Mocked<ConfigService>;

  const mockTemplate = {
    id: 1,
    templateName: 'Cocoa Generic',
    locationTypeId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateCSVService,
        {
          provide: S3Service,
          useValue: {
            writeS3fileIntoTmp: jest.fn(),
          },
        },
        {
          provide: ValidateCsvRepository,
          useValue: {
            getAllListTemplates: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ValidateCSVService>(ValidateCSVService);
    s3Service = module.get(S3Service);
    validateCSVRepository = module.get(ValidateCsvRepository);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockFileName = 'test.csv';
    const mockTemplateId = 1;
    const mockBucket = 'test-bucket';
    const mockFilePath = '/tmp/test.csv';
    const mockLocationData = [{ 'Location Name': 'Test Location' }];

    beforeEach(() => {
      configService.get.mockReturnValue(mockBucket);
      s3Service.writeS3fileIntoTmp.mockResolvedValue(mockFilePath);
      (csv2Json as jest.Mock).mockReturnValue({
        fromFile: jest.fn().mockResolvedValue(mockLocationData),
      });
      validateCSVRepository.getAllListTemplates.mockResolvedValue([mockTemplate]);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => undefined);
    });

    it('should successfully validate a CSV file', async () => {
      const result = await service.execute(mockFileName, mockTemplateId);

      expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledWith(mockFileName, mockBucket);
      expect(validateCSVRepository.getAllListTemplates).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFilePath);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return error when template is not found and clean up file', async () => {
      validateCSVRepository.getAllListTemplates.mockResolvedValue([]);

      const result = await service.execute(mockFileName, mockTemplateId);

      expect(result).toEqual(['was not possible to find a template with the informed id.']);
      expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledWith(mockFileName, mockBucket);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFilePath);
    });

    it('should handle errors during file processing and clean up file', async () => {
      s3Service.writeS3fileIntoTmp.mockRejectedValue(new Error('S3 error'));

      await expect(service.execute(mockFileName, mockTemplateId)).rejects.toThrow('S3 error');
      expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledWith(mockFileName, mockBucket);
      expect(fs.unlinkSync).not.toHaveBeenCalled(); // File is not created in this case
    });

    it('should handle CSV parsing errors and clean up file', async () => {
      (csv2Json as jest.Mock).mockReturnValue({
        fromFile: jest.fn().mockRejectedValue(new Error('CSV parsing error')),
      });

      await expect(service.execute(mockFileName, mockTemplateId)).rejects.toThrow(
        'CSV parsing error'
      );
      expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledWith(mockFileName, mockBucket);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFilePath);
    });
  });

  describe('getTemplateName', () => {
    it('should return formatted template name', async () => {
      validateCSVRepository.getAllListTemplates.mockResolvedValue([mockTemplate]);

      const result = await service.getTemplateName(1);

      expect(result).toBe('cocoaGeneric');
    });

    it('should return undefined when template is not found', async () => {
      validateCSVRepository.getAllListTemplates.mockResolvedValue([]);

      const result = await service.getTemplateName(999);

      expect(result).toBeUndefined();
    });
  });

  describe('removeFile', () => {
    it('should remove file successfully', () => {
      const mockFilePath = '/tmp/test.csv';
      (fs.unlinkSync as jest.Mock).mockImplementation(() => undefined);

      service.removeFile(mockFilePath);

      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFilePath);
    });

    it('should handle file removal errors', () => {
      const mockFilePath = '/tmp/test.csv';
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => service.removeFile(mockFilePath)).toThrow('File not found');
    });
  });
});
