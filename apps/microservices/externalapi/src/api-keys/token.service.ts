import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  APIGateway,
  CreateApiKeyCommandInput,
  CreateUsagePlanKeyCommandInput,
  DeleteApiKeyCommandInput,
} from '@aws-sdk/client-api-gateway';
import { ConfigService } from '@nestjs/config';
import { transformApiKey, transformApiKeys } from './transformers';
import { ViewApiKeyResponse } from './dtos';
import { ExternalAPIKey, UserRoutes } from '@wri-monorepos/sql';
const DEFAULT_API_GROUP = 'FCD';
const DEFAULT_KEY_TYPE = 'API_KEY';
@Injectable()
export class TokenService {
  private readonly apiGateway: APIGateway;

  constructor(
    @InjectRepository(ExternalAPIKey, 'default')
    private tokenRepository: Repository<ExternalAPIKey>,
    @InjectRepository(UserRoutes, 'default')
    private userRepository: Repository<UserRoutes>,
    private readonly configService: ConfigService
  ) {
    this.apiGateway = new APIGateway({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },

      region: this.configService.get('AWS_REGION'),
    });
  }

  async generateAWSGatewayAPIToken(tokenName: string) {
    try {
      const params: CreateApiKeyCommandInput = {
        name: tokenName,
        enabled: true,
      };

      const apiKey = await this.apiGateway.createApiKey(params);
      const usagePlanParams: CreateUsagePlanKeyCommandInput = {
        keyId: apiKey.id,
        usagePlanId: this.configService.get('AWS_API_USAGE_PLAN_ID'),
        keyType: DEFAULT_KEY_TYPE,
      };

      await this.apiGateway.createUsagePlanKey(usagePlanParams);

      return apiKey;
    } catch (error) {
      Logger.error(error);
      if (error.name === 'UnrecognizedClientException') {
        throw new InternalServerErrorException('Error with AWS credentials.');
      }
      if (error.name === 'ServiceUnavailable') {
        throw new ServiceUnavailableException('AWS service is currently unavailable.');
      }

      if (error.name === 'NotFoundException') {
        throw new NotFoundException(error.message);
      }

      // Catch-all
      throw new InternalServerErrorException('An internal error has occurred.' + error.message);
    }
  }

  async createToken(organizationId: number, userId: number): Promise<ViewApiKeyResponse> {
    const actualDate = new Date();
    const tokenName = `APITOKEN-${this.configService.get(
      'NODE_ENV'
    )}-ORG${organizationId}-${actualDate.toISOString()}`;

    const awsToken = await this.generateAWSGatewayAPIToken(tokenName);

    const user = await this.userRepository.findOne({
      where: { organization_id: organizationId, organization_user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User or organization not found');
    }

    const token = new ExternalAPIKey();
    token.awsId = awsToken.id;
    token.creatorUserId = userId;
    token.organizationId = organizationId;
    token.updateDateTime = new Date();
    token.apiKey = awsToken.value;
    token.apiGroups = DEFAULT_API_GROUP;
    token.user = user;

    try {
      const newToken = await this.tokenRepository.save(token);
      return transformApiKey(newToken);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to store token in database. ${error.message}`);
    }
  }
  async findTokenByOrganizationId(organizationId: number): Promise<ViewApiKeyResponse[]> {
    const tokens = await this.tokenRepository.find({ where: { organizationId } });

    if (tokens.length === 0) {
      throw new NotFoundException('Organization not found');
    }

    return transformApiKeys(tokens);
  }

  async findToken(token: string): Promise<ViewApiKeyResponse> {
    const organizationToken = await this.tokenRepository.findOne({ where: { apiKey: token } });
    if (!organizationToken) {
      return undefined;
    }
    return transformApiKey(organizationToken);
  }

  async deleteToken(organizationId: number, tokenId: string): Promise<boolean> {
    const token = await this.tokenRepository.findOne({ where: { organizationId, awsId: tokenId } });
    if (!token) {
      throw new NotFoundException('Token not found.');
    }

    try {
      await this.tokenRepository.delete(token.awsId);
      const apiGatewayDeleteParams: DeleteApiKeyCommandInput = {
        apiKey: tokenId,
      };
      await this.apiGateway.deleteApiKey(apiGatewayDeleteParams);
      return true;
    } catch (error) {
      Logger.error(error);
      if (error.name === 'NotFoundException') {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserEmailByToken(organizationId: number, userEmail: string): Promise<UserRoutes> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          organization_id: organizationId,
          user_email: userEmail,
        },
      });
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      Logger.warn('Error finding user email by token', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
