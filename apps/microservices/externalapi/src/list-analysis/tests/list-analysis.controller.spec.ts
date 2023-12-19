import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisController } from '../list-analysis.controller';
import { ListAnalysisService } from '../list-analysis.service';
import { createRequest } from 'node-mocks-http'; // Import the necessary library
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../api-keys/organization.entity';
import { UserRoutes } from '../../api-keys/user-route.entity';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { ConfigModule } from '@nestjs/config';

describe('ListAnalysisController', () => {
  let controller: ListAnalysisController;

  const expectedResult = {
    listId: 123,
    status: 'Completed',
    errorsDetails: [],
    resultUrl: 'https://example.com/results',
    creationDate: new Date('2023-09-28'),
    expirationDate: new Date('2023-09-28'),
  };

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
      providers: [
        {
          provide: ListAnalysisService,
          useValue: {
            getAnalysisStatus: jest.fn(() => expectedResult),
          },
        },
      ],
    }).compile();

    controller = module.get<ListAnalysisController>(ListAnalysisController);
  });

  it('should return analysis status', async () => {
    const listID = '123';

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
    });

    const result = await controller.getAnalysisStatus(listID, requestMock);
    expect(result).toMatchObject(expectedResult);
  });
});
