import { ExternalAPIKey } from '../external-api-key.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { TokenService } from '../token.service';
import { Organization } from '../organization.entity';
import { TokenMockRepository, UserMockRepository } from './token.mock.service';
import { ConfigModule } from '@nestjs/config';
import { UserRoutes } from '../user-route.entity';
import * as sinon from 'sinon';
import { NotFoundException } from '@nestjs/common';
import { AWSError } from 'aws-sdk';

const TEST_NEW_ORGANIZATION_ID = 10;
const TEST_ORGANIZATION_ID = 9;
const TEST_USER_ID = 23;
const TEST_INVALID_ORGANIZATION_ID = 999;
const TEST_MOCK_ORG = 777;

const MINIMUM_TOKEN_LEN = 30;
const MAXIMUM_TOKEN_LEN = 128;
const ORGANIZATION_ID_VALID_USER = 778;
const VALID_USER_EMAIL = 'user1@valid.com';
jest.setTimeout(30_000);
describe('Test Token Module', () => {
  let tokenService: TokenService;
  const sandbox = sinon.createSandbox();
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          logging: true,
          entities: [Organization, ExternalAPIKey, UserRoutes],
        }),
        TypeOrmModule.forFeature([Organization, ExternalAPIKey, UserRoutes], 'default'),
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(ExternalAPIKey, 'default'),
          useClass: TokenMockRepository,
        },
        {
          provide: getRepositoryToken(UserRoutes, 'default'),
          useClass: UserMockRepository,
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

    tokenService = app.get<TokenService>(TokenService);

    // Mock the AWS.APIGateway constructor
    const apiGatewayInstance = {
      createApiKey: sandbox.stub().returns({
        promise: sandbox.stub().resolves({
          /* Mock response for createApiKey */
        }),
      }),
      createUsagePlanKey: sandbox.stub().returns({
        promise: sandbox.stub().resolves({
          /* Mock response for createUsagePlanKey */
        }),
      }),
      // You can add other methods and their responses as needed
    };

    // Redefine AWS.APIGateway.prototype to return the instance with the stubbed methods
    Object.defineProperty(AWS.APIGateway.prototype, 'createApiKey', {
      value: apiGatewayInstance.createApiKey,
    });

    Object.defineProperty(AWS.APIGateway.prototype, 'createUsagePlanKey', {
      value: apiGatewayInstance.createUsagePlanKey,
    });

    //sandbox.stub(AWS, 'APIGateway').returns(new AWS.APIGateway());
    const dummyGateway = new AWS.APIGateway();
    sandbox.stub(dummyGateway.constructor.prototype, 'createApiKey').returns({
      promise: () => {
        return {
          id: 'd3grev7wa4',
          value: 'HkIXacIxu73fo9T3EfRaP9OnUryUCLOV8WO87oIL',
          name: 'externalapi',
          enabled: true,
          createdDate: new Date(),
          lastUpdatedDate: new Date(),
          stageKeys: [],
        };
      },
    });

    sandbox.stub(dummyGateway.constructor.prototype, 'createUsagePlanKey').returns({
      promise: () => {
        return {
          /**
           * The Id of a usage plan key.
           */
          id: 'string',
          /**
           * The type of a usage plan key. Currently, the valid key type is API_KEY.
           */
          type: 'API_KEY',
          /**
           * The value of a usage plan key.
           */
          value: 'string',
          /**
           * The name of a usage plan key.
           */
          name: 'string',
        };
      },
    });

    const stub = sandbox.stub(dummyGateway.constructor.prototype, 'deleteApiKey');

    stub.withArgs({ apiKey: 'd3grev7wa4' }).returns({
      promise: () => {
        return {};
      },
    });

    stub.withArgs({ apiKey: '123' }).returns({
      promise: () => {
        return Promise.reject('Error deleting token');
      },
    });

    stub.withArgs({ apiKey: 'TOTESTDELETE' }).returns({
      promise: () => {
        const awsError: AWSError = {
          code: 'NotFoundException',
          message: 'Key not found.',
          retryable: false,
          statusCode: 404,
          time: new Date(),
          hostname: 'localhost',
          region: 'us-east-1',
          requestId: '123',
          extendedRequestId: '123',
          cfId: '123',
          name: 'NotFoundException',
        };
        return Promise.reject(awsError);
      },
    });
  });

  describe('Token management for organizations', () => {
    it('Should return a new token object and it should be between 30 and 128 chars long', async () => {
      const token = await tokenService.createToken(TEST_NEW_ORGANIZATION_ID, TEST_USER_ID);
      expect(token.apiKey.length).toBeGreaterThanOrEqual(MINIMUM_TOKEN_LEN);
      expect(token.apiKey.length).toBeLessThanOrEqual(MAXIMUM_TOKEN_LEN);
    });

    it('Should return 5 objects within the token', async () => {
      const tokens = await tokenService.findTokenByOrganizationId(TEST_ORGANIZATION_ID);
      expect(tokens).toBeDefined();
      expect(tokens.length).toBe(5);
    });

    it('Should throw an error when creating a token for invalid organization', () => {
      expect(
        tokenService.createToken(TEST_INVALID_ORGANIZATION_ID, TEST_USER_ID)
      ).rejects.toThrowError();
    });

    it('Should create a token and delete it successfully', async () => {
      const token = await tokenService.createToken(TEST_MOCK_ORG, TEST_USER_ID);
      const result = await tokenService.deleteToken(TEST_MOCK_ORG, token.id);

      expect(result).toBeDefined();
      expect(result).toBe(true);
    });

    it('Should throw an error when token does not exist', () => {
      expect(tokenService.deleteToken(TEST_MOCK_ORG, '123')).rejects.toThrow(NotFoundException);
    });

    it('Should throw an error when token does not exist', () => {
      expect(
        tokenService.deleteToken(TEST_INVALID_ORGANIZATION_ID, 'TOTESTDELETE')
      ).rejects.toThrow(NotFoundException);
    });

    it('Should throw an error when user does not exist', () => {
      expect(tokenService.createToken(TEST_NEW_ORGANIZATION_ID, 444)).rejects.toThrow(
        NotFoundException
      );
    });

    it('Should throw an error when organization does not exist', () => {
      expect(tokenService.createToken(444, TEST_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
  describe('Validate user email', () => {
    it('Should validate userEmail', async () => {
      const hasValidEmail = await tokenService.findUserEmailByToken(
        ORGANIZATION_ID_VALID_USER,
        VALID_USER_EMAIL
      );
      expect(hasValidEmail).toEqual(true);
    });
    it('Should verify userEmail is not valid', async () => {
      const NOT_VALID_USER_EMAIL = 'not.valid@valid.com';
      const hasValidEmail = await tokenService.findUserEmailByToken(
        ORGANIZATION_ID_VALID_USER,
        NOT_VALID_USER_EMAIL
      );
      expect(hasValidEmail).toEqual(false);
    });
    it('Should verify userEmail is not valid for empty parameter', async () => {
      const hasValidEmail = await tokenService.findUserEmailByToken(ORGANIZATION_ID_VALID_USER, '');
      expect(hasValidEmail).toEqual(false);
    });
  });
  afterAll(async () => {
    sandbox.restore();
    await app.close();
  });
});
