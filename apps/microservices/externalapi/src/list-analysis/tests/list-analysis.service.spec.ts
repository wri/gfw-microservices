import { Test, TestingModule } from '@nestjs/testing';
import { ListAnalysisService } from '../list-analysis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../api-keys/organization.entity';
import { ConfigModule } from '@nestjs/config';
import { ExternalAPIKey } from '../../api-keys/external-api-key.entity';
import { User } from '../../api-keys/user.entity';
import { UserService } from '../user.service';
import { ExternalUpload } from '../external-upload.entity';

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
      providers: [ListAnalysisService, UserService],
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
