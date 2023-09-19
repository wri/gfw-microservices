import { Injectable } from '@nestjs/common';
import { Token } from '../token.entity';
import { FindManyOptions, QueryFailedError } from 'typeorm';

@Injectable()
export class TokenMockRepository {
  private readonly data: Token[] = [
    {
      awsId: '789',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '789',
      apiGroup: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      awsId: '101112',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '101112',
      apiGroup: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      awsId: '131415',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '131415',
      apiGroup: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      awsId: '161718',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '161718',
      apiGroup: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      awsId: '192021',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '192021',
      apiGroup: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      awsId: 'TOTESTDELETE',
      creatorUserId: 1,
      organizationId: 999,
      apiKey: 'T0D3L3T3',
      apiGroup: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
  ];

  async find(options?: FindManyOptions<Token>) {
    const [{ where }] = Array.isArray(options) ? options : [options];

    return this.data.filter((token) => token.organizationId === where.organizationId);
  }

  createQueryBuilder(/* not implemented alias: string*/) {
    // Mock the query builder methods if needed
    return {
      where: () => this,
      andWhere: () => this,
      getMany: () => this.data,
    };
  }

  // Implement other repository methods as needed
  async findOne(options?: FindManyOptions<Token>): Promise<Token | undefined> {
    const [{ where }] = Array.isArray(options) ? options : [options];

    return this.data.find(
      (token) =>
        token.organizationId === where.organizationId &&
        (where.awsId ? token.awsId === where.awsId : true)
    );
  }

  async save(token: Token): Promise<Token> {
    if (token.organizationId === 999) {
      throw new QueryFailedError('query', [], []);
    }

    token.user = {
      id: 123,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      tokens: [],
    };

    this.data.push(token);
    return token;
  }

  async delete(token: Token): Promise<void> {
    const index = this.data.findIndex((t) => t.awsId === token.awsId);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }
}
