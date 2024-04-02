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
import * as sinon from 'sinon';
import { DataSource } from 'typeorm';
import { ListsAnalysisStatus } from '../list-analysis-status.entity';
import { ListAnalysisStatusRepositoryMock } from './repositories/list-analysis-status.repository.mock';
import { ListAnalysisMessageModule } from '../../list-analysis-message-handler';

describe('ListAnalysisService', () => {
  let service: ListAnalysisService;
  let organizationService: OrganizationService;
  let module: TestingModule;

  beforeAll(async () => {
    sinon
      .stub(DataSource.prototype, 'getRepository')
      .withArgs(ListsAnalysisStatus)
      .returns(new ListAnalysisStatusRepositoryMock());

    module = await Test.createTestingModule({
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
        ListAnalysisMessageModule,
      ],
      providers: [ListAnalysisService, UserService, ClientStoreConnection, OrganizationService],
    }).compile();
  });

  beforeEach(async () => {
    organizationService = module.get<OrganizationService>(OrganizationService);
    service = module.get<ListAnalysisService>(ListAnalysisService);
  });

  it('should get analysis status', async () => {
    const listId = 123;
    const organizationId = 1;
    const expectedResult = {
      listId: listId.toString(),
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      creationDate: new Date().toLocaleDateString('en-US'),
      expirationDate: new Date('11/28/2999').toLocaleDateString('en-US'),
    };

    organizationService.findOrganizationById = jest.fn().mockResolvedValue({
      id: 1,
      organizationName: 'ABC Corp',
      organizationDb: ':memory:',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      subscriptionStatusId: 1,
    });

    const result = await service.getAnalysisStatus({ organizationId, listId, analysisId: 'FCD' });

    const resultWithDatesTransformed = {};
    for (const prop in result) {
      const value = result[prop];
      resultWithDatesTransformed[prop] =
        value instanceof Date ? value.toLocaleDateString('en-US') : value;
    }

    expect(resultWithDatesTransformed).toEqual(expectedResult);
  });
});
