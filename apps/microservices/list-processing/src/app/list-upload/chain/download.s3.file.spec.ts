import { Test, TestingModule } from '@nestjs/testing';
import { DownloadS3File } from './download.s3.file';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('DownloadS3File', () => {
  let downloadS3File: DownloadS3File;
  let s3Service: S3Service;
  let configService: ConfigService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: S3Service,
          useValue: {
            writeS3fileIntoTmp: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-bucket'),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    s3Service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
    downloadS3File = new DownloadS3File(s3Service, configService);
  });

  it('should download the file successfully on the first attempt', async () => {
    (s3Service.writeS3fileIntoTmp as jest.Mock).mockResolvedValue('path/to/file');

    await downloadS3File.handle({
      request: {
        userId: 1,
        list_name: 'test',
        organization_database: 'test-db',
        templateId: 1,
        path: 'test/path',
      },
    });

    expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(1);
  });

  it('should retry downloading the file if the first attempt fails', async () => {
    (s3Service.writeS3fileIntoTmp as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('path/to/file');

    await downloadS3File.handle({
      request: {
        userId: 1,
        list_name: 'test',
        organization_database: 'test-db',
        templateId: 1,
        path: 'test/path',
      },
    });

    expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    (s3Service.writeS3fileIntoTmp as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(
      downloadS3File.handle({
        request: {
          userId: 1,
          list_name: 'test',
          organization_database: 'test-db',
          templateId: 1,
          path: 'test/path',
        },
      })
    ).rejects.toThrow('Network error');

    expect(s3Service.writeS3fileIntoTmp).toHaveBeenCalledTimes(3);
  }, 10000);
});
