import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisController } from '../list-analysis.controller';
import { ListAnalysisService } from '../list-analysis.service';
import { createRequest } from 'node-mocks-http'; // Import the necessary library
import { Request } from 'node-fetch';
import { UserService } from '../user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../api-keys/organization.entity';
import { UserRoutes } from '../../api-keys/user-route.entity';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { ConfigModule } from '@nestjs/config';
import { ClientStoreConnection } from '../../shared/client-store-connection';
import { OrganizationService } from '../organization.service';

describe('ListAnalysisController', () => {
  let controller: ListAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Organization, UserRoutes, ExternalAPIKey],
        }),
        TypeOrmModule.forFeature([Organization, ExternalAPIKey, UserRoutes], 'default'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      controllers: [ListAnalysisController],
      providers: [ListAnalysisService, UserService, ClientStoreConnection, OrganizationService],
    }).compile();

    controller = module.get<ListAnalysisController>(ListAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return analysis status', async () => {
    const listID = '123';
    const expectedResult = {
      listId: listID,
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      creationDate: '2023-09-21',
      expirationDate: '2023-09-28',
    };

    // Mock the request object with the 'x-api-key' header
    const requestMock = createRequest({
      method: 'GET',
      url: `/api/v1/list/${listID}/analysis/FCD/status`,
      headers: {
        'x-api-key': 'your-api-key',
      },
    }) as Request;

    const result = await controller.getAnalysisStatus(listID, requestMock);

    expect(result).toEqual(expectedResult);
  });
});
