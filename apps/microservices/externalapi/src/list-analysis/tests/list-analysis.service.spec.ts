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

describe('ListAnalysisService', () => {
  let service: ListAnalysisService;

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

    service = module.get<ListAnalysisService>(ListAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get analysis status', async () => {
    const listID = '123';
    const expectedResult = {
      listId: listID,
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      creationDate: '2023-09-21',
      expirationDate: '2023-09-28',
    };

    const result = await service.getAnalysisStatus(listID);

    expect(result).toEqual(expectedResult);
  });
});
