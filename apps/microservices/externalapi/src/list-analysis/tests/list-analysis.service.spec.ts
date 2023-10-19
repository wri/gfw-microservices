import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisService } from '../list-analysis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../api-keys/organization.entity';
import { ConfigModule } from '@nestjs/config';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { UserRoutes } from '../../api-keys/user-route.entity';
import { UserService } from '../user.service';
import { ClientStoreConnection } from '../../shared/client-store-connection';
import { OrganizationService } from '../organization.service';
import sinon from 'sinon';
import { DataSource } from 'typeorm';
import { ListsAnalysisStatus } from '../list-analysis-status.entity';

class MockRepository {
  findOne = jest.fn(async () => {
    return { listId: 123, analysisId: 'FCD', updateTime: new Date(), status: 1 };
  });
}

describe('ListAnalysisService', () => {
  let service: ListAnalysisService;
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
      providers: [ListAnalysisService, UserService, ClientStoreConnection, OrganizationService],
    }).compile();
    organizationService = module.get<OrganizationService>(OrganizationService);
    service = module.get<ListAnalysisService>(ListAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get analysis status', async () => {
    const actualDate = new Date();
    const listID = 123;
    const organizationId = 1;
    const expectedResult = {
      listId: listID,
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      expirationDate: '2023-09-28',
    };

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: actualDate,
      subscriptionStatusId: 1,
    });

    const result = await service.getAnalysisStatus(organizationId, listID);
    const { listId, status, errorsDetails, resultUrl, expirationDate } = result;

    expect({ listId, status, errorsDetails, resultUrl, expirationDate }).toEqual(expectedResult);
  });
});
