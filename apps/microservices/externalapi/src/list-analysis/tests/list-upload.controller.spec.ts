import { Test, TestingModule } from '@nestjs/testing';
import { ListUploadController } from '../list-upload.controller';
import {
  ListUploadNewRequest,
  ListUploadNewResponse,
  ListUploadNewErrorResponse,
} from '../list-upload-new.dto';
import { ListAnalysisService } from '../list-analysis.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { Organization } from '../../api-keys/organization.entity';
import { User } from '../../api-keys/user.entity';
import { ExternalUpload } from '../external-upload.entity';
import { UserService } from '../user.service';

describe('ListUploadController', () => {
  let controller: ListUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Organization],
        }),
        TypeOrmModule.forRoot({
          name: 'client',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [ExternalAPIKey, User],
        }),
        TypeOrmModule.forFeature([Organization], 'default'),
        TypeOrmModule.forFeature([ExternalAPIKey, User, ExternalUpload], 'client'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      controllers: [ListUploadController],
      providers: [ListAnalysisService, UserService],
    }).compile();

    controller = module.get<ListUploadController>(ListUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a successful response', async () => {
    const request: ListUploadNewRequest = {
      uploadId: '123',
      listName: 'Example List',
      templateId: '456',
      analysisIDs: '789',
    };

    const expectedResult: ListUploadNewResponse = {
      uploadId: '123',
      listId: 'generated-list-id',
      status: 'Completed',
      errorDetails: '',
      creationDate: '2023-09-21',
    };

    const result = await controller.uploadNewList(request);

    expect(result).toEqual(expectedResult);
  });

  it('should return an error response for invalid upload ID', async () => {
    const request: ListUploadNewRequest = {
      uploadId: 'invalid-id',
      listName: 'Example List',
      templateId: '456',
      analysisIDs: '789',
    };

    const expectedResult: ListUploadNewErrorResponse = {
      errorDetails: 'Failed to process the request',
    };

    try {
      await controller.uploadNewList(request);
    } catch (error) {
      expect(error.response).toEqual(expectedResult);
      expect(error.getStatus()).toBe(400); // Check if the status code is 400 Bad Request
    }
  });

  it('should return an error response for other error scenarios', async () => {
    const request: ListUploadNewRequest = {
      uploadId: 'another-invalid-id',
      listName: 'Example List',
      templateId: '456',
      analysisIDs: '789',
    };

    // Implement logic for other error scenarios

    const expectedResult: ListUploadNewErrorResponse = {
      errorDetails: 'Failed to process the request',
    };

    try {
      await controller.uploadNewList(request);
    } catch (error) {
      expect(error.response).toEqual(expectedResult);
      expect(error.getStatus()).toBe(400); // Check if the status code is 400 Bad Request
    }
  });
});
