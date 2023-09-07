import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { Organization } from './organization.entity';
import { APIGateway } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  private readonly apiGateway: APIGateway;

  constructor(
    @InjectRepository(Token, 'client')
    private tokenRepository: Repository<Token>,

    @InjectRepository(Organization, 'default')
    private organizationRepository: Repository<Organization>,

    private readonly configService: ConfigService
  ) {
    this.apiGateway = new APIGateway({ region: 'us-east-1' });
  }

  async generateGatewayAPIToken(tokenName: string) {
    const params: APIGateway.CreateApiKeyRequest = {
      name: tokenName,
      enabled: true,
    };

    const apiKey = await this.apiGateway.createApiKey(params).promise();

    const usagePlanParams: APIGateway.CreateUsagePlanKeyRequest = {
      keyId: apiKey.id,
      usagePlanId: '3q5uj0',
      keyType: 'API_KEY',
    };

    await this.apiGateway.createUsagePlanKey(usagePlanParams).promise();

    return apiKey;
  }

  async createToken(organizationId: number, userId: number): Promise<Token> {
    // compose token name
    const actualDate = new Date();
    const formatDate = `${actualDate.getFullYear()}-${actualDate.getMonth()}-${actualDate.getDay()}`;
    const tokenName = `APITOKEN-${this.configService.get(
      'NODE_ENV'
    )}-ORG${organizationId}-${formatDate}`;

    const awsToken = await this.generateGatewayAPIToken(tokenName);

    const token = new Token();
    token.id = awsToken.id;
    token.userId = userId;
    token.name = tokenName;
    token.organizationId = organizationId;
    token.createdAt = new Date();
    token.tokenValue = this.generateAPIToken();

    return await this.tokenRepository.save(token);
  }

  async findTokenByUserId(userId: number): Promise<Token | undefined> {
    return this.tokenRepository.findOne({ where: { userId } });
  }

  async getOrgs(): Promise<Organization[]> {
    return await this.organizationRepository.find({});
  }

  generateAPIToken(): string {
    // Generate a random API token with the desired length
    const tokenLength = 50;
    return this.generateString(tokenLength);
  }

  getChar = (a) => String.fromCharCode(a);

  randomNumber = (x) => Math.floor(Math.random() * x);

  getRandomElement = (xs) => xs.at(this.randomNumber(xs.length));

  charsRange = (x) => (y) => x > y ? [] : [x, ...this.charsRange(x + 1)(y)];

  randomString = (chars) => (len) =>
    len <= 0 ? '' : this.getChar(this.getRandomElement(chars)) + this.randomString(chars)(len - 1);

  generateString = this.randomString([
    ...this.charsRange(48)(57), // include 0-9
    ...this.charsRange(65)(90), // include A-Z
    ...this.charsRange(97)(122), // include a-z
  ]);
}
