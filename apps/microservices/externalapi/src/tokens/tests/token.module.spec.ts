import { Token } from './../token.entity';
import { Test } from '@nestjs/testing';
import { AppService } from '../../app/app.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { TokenService } from '../token.service';
import { Organization } from '../organization.entity';
import { TokenMockRepository } from './token.mock.service';
import { ConfigModule } from '@nestjs/config';
import { User } from '../user.entity';

const TEST_NEW_ORGANIZATION_ID = 10;
const TEST_ORGANIZATION_ID = 9;
const TEST_USER_ID = 23;
const TEST_INVALID_ORGANIZATION_ID = 999;
const TEST_MOCK_ORG = 777;
jest.setTimeout(30000);
describe('Test Token Module', () => {
  let tokenService: TokenService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
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
          entities: [Token, User],
        }),
        TypeOrmModule.forFeature([Organization], 'default'),
        TypeOrmModule.forFeature([Token, User], 'client'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [
        AppService,
        {
          provide: getRepositoryToken(Token, 'client'),
          useClass: TokenMockRepository,
        },
        TokenService,
      ],
    }).compile();

    const awsConfig = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    };

    AWS.config.update(awsConfig);

    //service = app.get<AppService>(AppService);
    tokenService = app.get<TokenService>(TokenService);
  });

  describe('Test token creation for premium organzation', () => {
    it('Should return a new token object and token should be 50 chars long', async () => {
      const token = await tokenService.createToken(TEST_NEW_ORGANIZATION_ID, TEST_USER_ID);
      expect(token).toBeDefined();
      expect(token.apiKey.length).toBe(40);
    });

    it('Should return 5 token objects and token should be 50 chars long', async () => {
      const tokens = await tokenService.findTokenByOrganizationId(TEST_ORGANIZATION_ID);
      expect(tokens).toBeDefined();
      expect(tokens.length).toBe(5);
    });

    it('Expect error saving data to database', async () => {
      expect(async () => {
        await tokenService.createToken(TEST_INVALID_ORGANIZATION_ID, TEST_USER_ID);
      }).rejects.toThrowError();
    });

    it('Should create a token and delete the created token', async () => {
      const token = await tokenService.createToken(TEST_MOCK_ORG, TEST_USER_ID);
      expect(token).toBeDefined();
      expect(token.apiKey.length).toBe(40);

      const result = await tokenService.deleteToken(TEST_MOCK_ORG, token.id);

      expect(result).toBeDefined();
      expect(result).toBe(true);
    });
  });
});
