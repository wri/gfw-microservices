import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalAPIKey } from './external-api-key.entity';
import { APIGateway } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { transformApiKey, transformApiKeys } from './transformers';
import { User } from './user.entity';
import { ViewApiKeyResponse } from './dtos';
const DEFAULT_API_GROUP = 'FCD';
const DEFAULT_KEY_TYPE = 'API_KEY';
@Injectable()
export class TokenService {
  private readonly apiGateway: APIGateway;

  constructor(
    @InjectRepository(ExternalAPIKey, 'client')
    private tokenRepository: Repository<ExternalAPIKey>,
    @InjectRepository(User, 'client')
    private userRepository: Repository<User>,
    private readonly configService: ConfigService
  ) {
    this.apiGateway = new APIGateway({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async generateAWSGatewayAPIToken(tokenName: string) {
    try {
      const params: APIGateway.CreateApiKeyRequest = {
        name: tokenName,
        enabled: true,
      };

      const apiKey = await this.apiGateway.createApiKey(params).promise();
      const usagePlanParams: APIGateway.CreateUsagePlanKeyRequest = {
        keyId: apiKey.id,
        usagePlanId: this.configService.get('AWS_API_USAGE_PLAN_ID'),
        keyType: DEFAULT_KEY_TYPE,
      };

      await this.apiGateway.createUsagePlanKey(usagePlanParams).promise();

      return apiKey;
    } catch (error) {
      Logger.error(error);
      if (error.code === 'UnrecognizedClientException') {
        throw new InternalServerErrorException('Error with AWS credentials.');
      }
      if (error.code === 'ServiceUnavailable') {
        throw new ServiceUnavailableException('AWS service is currently unavailable.');
      }

      if (error.code === 'NotFoundException') {
        throw new NotFoundException(error.message);
      }

      // Catch-all
      throw new InternalServerErrorException('An internal error has occurred.' + error.message);
    }
  }

  async createToken(organizationId: number, userId: number): Promise<ViewApiKeyResponse> {
    const actualDate = new Date();
    const formatDate = `${actualDate.getFullYear()}-${actualDate.getMonth()}-${actualDate.getDay()}`;
    const tokenName = `APITOKEN-${this.configService.get(
      'NODE_ENV'
    )}-ORG${organizationId}-${formatDate}`;

    const awsToken = await this.generateAWSGatewayAPIToken(tokenName);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    const token = new ExternalAPIKey();
    token.awsId = awsToken.id;
    token.creatorUserId = userId;
    token.organizationId = organizationId;
    token.updateDateTime = new Date();
    token.apiKey = awsToken.value;
    token.apiGroup = DEFAULT_API_GROUP;
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
    return transformApiKeys(tokens);
  }

  async deleteToken(organizationId: number, tokenId: string): Promise<boolean> {
    const token = await this.tokenRepository.findOne({ where: { organizationId, awsId: tokenId } });
    if (!token) {
      throw new NotFoundException('Token not found.');
    }

    try {
      await this.tokenRepository.delete(token.awsId);
      const apiGatewayDeleteParams: APIGateway.DeleteApiKeyRequest = {
        apiKey: tokenId,
      };
      await this.apiGateway.deleteApiKey(apiGatewayDeleteParams).promise();
      return true;
    } catch (error) {
      Logger.error(error);
      if (error.code === 'NotFoundException') {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
