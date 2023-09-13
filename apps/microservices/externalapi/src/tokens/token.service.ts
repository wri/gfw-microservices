import { Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { Organization } from './organization.entity';
import { APIGateway } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
const DEFAULT_API_GROUP = 'FCD';
const DEFAULT_KEY_TYPE = 'API_KEY';
import * as AWS from 'aws-sdk';
@Injectable()
export class TokenService {
  private readonly apiGateway: APIGateway;

  constructor (
    @InjectRepository(Token, 'client')
    private tokenRepository: Repository<Token>,
    @InjectRepository(Organization, 'default')
    private organizationRepository: Repository<Organization>,
    private readonly configService: ConfigService
  ) {
    const awsConfig = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    };

    AWS.config.update(awsConfig);
    this.apiGateway = new APIGateway({ region: 'us-east-1' });
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
      throw new InternalServerErrorException('Failed to upload file to S3.');
    }
  }

  async createToken(organizationId: number, userId: number): Promise<Token> {

    const actualDate = new Date();
    const formatDate = `${actualDate.getFullYear()}-${actualDate.getMonth()}-${actualDate.getDay()}`;
    const tokenName = `APITOKEN-${this.configService.get(
      'NODE_ENV'
    )}-ORG${organizationId}-${formatDate}`;

    const awsToken = await this.generateAWSGatewayAPIToken(tokenName);

    const token = new Token();
    token.id = awsToken.id;
    token.creatorUserId = userId;
    token.organizationId = organizationId;
    token.createdDateTime = new Date();
    token.apiKey = awsToken.value;
    token.apiGroup = DEFAULT_API_GROUP;

    try {
      return await this.tokenRepository.save(token);
    } catch (error) {
      throw new InternalServerErrorException('Failed to store token in database.');
    }
  }

  async findTokenByUserId(creatorUserId: number): Promise<Token | undefined> {
    return this.tokenRepository.findOne({ where: { creatorUserId } });
  }

  async findTokenByOrganizationId(organizationId: number): Promise<Token[] | undefined> {
    return this.tokenRepository.find({ where: { organizationId } });
  }

  async getOrgs(): Promise<Organization[]> {
    return await this.organizationRepository.find({});
  }

  async deleteToken(organizationId: number, tokenId: string): Promise<boolean> {
    const token = await this.tokenRepository.findOne({ where: { organizationId, id: tokenId } });
    if (!token) {
      throw new NotFoundException('Token not found.');
    }

    try {
      await this.tokenRepository.delete(token.id);
      const apiGatewayDeleteParams: APIGateway.DeleteApiKeyRequest = {
        apiKey: tokenId
      }
      await this.apiGateway.deleteApiKey(apiGatewayDeleteParams).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFoundException') {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

}
