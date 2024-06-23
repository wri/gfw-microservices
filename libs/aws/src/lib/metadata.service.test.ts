import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { MetadataService } from './metadata.service';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('MetadataService', () => {
  let service: MetadataService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
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

    service = module.get<MetadataService>(MetadataService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should return a mock taskARN in test environment', async () => {
    jest.spyOn(configService, 'get').mockReturnValue('test');

    const result = await service.getMetadata();

    expect(result).toEqual({
      taskARN: 'arn:aws:ecs:us-east-1:123456789012:task/cluster-name/uuid-test',
    });
  });

  it('should return a mock taskARN in dev environment', async () => {
    jest.spyOn(configService, 'get').mockReturnValue('dev');

    const result = await service.getMetadata();

    expect(result).toEqual({
      taskARN: 'arn:aws:ecs:us-east-1:123456789012:task/cluster-name/uuid-dev',
    });
  });

  it('should return taskARN from metadata service in production environment', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        TaskARN: 'arn:aws:ecs:us-east-1:123456789012:task/cluster-name/uuid-prod',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {}, // Add other required properties if needed
      } as InternalAxiosRequestConfig,
    };

    jest.spyOn(configService, 'get').mockReturnValue('prod');
    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));
    const result = await service.getMetadata();

    expect(result).toEqual({
      taskARN: 'arn:aws:ecs:us-east-1:123456789012:task/cluster-name/uuid-prod',
    });
  });

  it('should throw an error if metadata fetch fails', async () => {
    jest.spyOn(configService, 'get').mockReturnValue('prod');
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('Network error')));

    await expect(service.getMetadata()).rejects.toThrow('Failed to fetch metadata: Network error');
  });
});
