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
import { DataSource } from 'typeorm';
import { ListsAnalysisStatus } from '../list-analysis-status.entity';
import sinon from 'sinon';

class MockRepository {
  findOne = jest.fn(async () => {
    return { listId: 123, analysisId: 'FCD', updateTime: new Date(), status: 1 };
  });
}

describe('ListAnalysisController', () => {
  let controller: ListAnalysisController;
  let organizationService: OrganizationService;
  beforeAll(async () => {
    sinon
      .stub(DataSource.prototype, 'getRepository')
      .withArgs(ListsAnalysisStatus)
      .returns(new MockRepository());
  });
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
    organizationService = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return analysis status', async () => {
    const listID = 123;
    const actualDate = new Date();
    const expectedResult = {
      listId: listID.toString(),
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      //expirationDate: '2023-09-28', // expirationDate is not tested, need to find a way to mock it
    };

    // Mock the request object with the 'x-api-key' header
    const requestMock = createRequest({
      method: 'GET',
      url: `/api/v1/list/${listID}/analysis/FCD/status`,
      headers: {
        'x-api-key': 'your-api-key',
      },
      user: {
        organizationId: 1,
      },
    }) as Request;

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: actualDate,
      subscriptionStatusId: 1,
    });

    const result = await controller.getAnalysisStatus(listID, requestMock);

    const { listId, status, errorsDetails, resultUrl } = result;

    expect({ listId, status, errorsDetails, resultUrl }).toEqual(expectedResult);
  });
});
