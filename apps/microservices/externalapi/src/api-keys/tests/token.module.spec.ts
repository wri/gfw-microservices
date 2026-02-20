import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ServiceException } from '@smithy/smithy-client';
import { APIGateway } from '@aws-sdk/client-api-gateway';
import { TokenService } from '../token.service';
import { TokenMockRepository, UserMockRepository } from './token.mock.service';
import { ConfigModule } from '@nestjs/config';
import * as sinon from 'sinon';
import { NotFoundException } from '@nestjs/common';
import { ExternalAPIKey, FeatureFlag, Organization, UserRoutes } from '@wri-monorepos/sql';

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
          entities: [Organization, ExternalAPIKey, UserRoutes, FeatureFlag],
        }),
        TypeOrmModule.forFeature(
          [Organization, ExternalAPIKey, UserRoutes, FeatureFlag],
          'default'
        ),
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

    tokenService = app.get<TokenService>(TokenService);

    // Mock the AWS.APIGateway constructor
    const apiGatewayInstance = {
      createApiKey: sandbox.stub().returns({
        promise: sandbox.stub().resolves({
          /* Mock response for createApiKey */
        }),
      }),
      // Note: createUsagePlanKey removed - not supported in API Gateway V2
      // You can add other methods and their responses as needed
    };
    // Redefine AWS.APIGateway.prototype to return the instance with the stubbed methods
    Object.defineProperty(APIGateway.constructor.prototype, 'createApiKey', {
      value: apiGatewayInstance.createApiKey,
    });

    //sandbox.stub(AWS, 'APIGateway').returns(new AWS.APIGateway());
    const dummyGateway = new APIGateway();

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

    // Note: createUsagePlanKey stub removed - not supported in API Gateway V2

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
        const awsError: ServiceException = {
          message: 'Key not found.',
          name: 'NotFoundException',
          $metadata: { httpStatusCode: 404, requestId: '123', attempts: 1, totalRetryDelay: 0 },
          $fault: 'client',
        };
        return Promise.reject(awsError);
      },
    });
  });

  describe('Token management for organizations', () => {
    it('Should return a new token object and it should be between 30 and 128 chars long', async () => {
      sandbox.stub(tokenService, 'generateAWSGatewayAPIToken').resolves({
        id: '123',
        value: 'TOTESTDELETEWITHMORETHAN30CHARS',
      });
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
      sandbox.stub(tokenService, 'deleteToken').rejects(new NotFoundException());
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
    const mockExpectedUser = {
      id: 24,
      organization_id: 778,
      organization_user_id: 7,
      organization_user_status_id: 1,
      tokens: [],
      user_email: 'user1@valid.com',
    };
    it('Should validate userEmail', async () => {
      const hasValidEmail = await tokenService.findUserEmailByToken(
        ORGANIZATION_ID_VALID_USER,
        VALID_USER_EMAIL
      );
      expect(hasValidEmail).toEqual(mockExpectedUser);
    });
    it('Should verify userEmail is not valid', async () => {
      const NOT_VALID_USER_EMAIL = 'not.valid@valid.com';
      const hasValidEmail = await tokenService.findUserEmailByToken(
        ORGANIZATION_ID_VALID_USER,
        NOT_VALID_USER_EMAIL
      );
      expect(hasValidEmail).toBe(null);
    });
    it('Should verify userEmail is not valid for empty parameter', async () => {
      const hasValidEmail = await tokenService.findUserEmailByToken(ORGANIZATION_ID_VALID_USER, '');
      expect(hasValidEmail).toBe(null);
    });
  });
  afterAll(async () => {
    sandbox.restore();
    await app.close();
  });
});
