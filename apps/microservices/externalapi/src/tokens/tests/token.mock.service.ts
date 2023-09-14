import { Injectable } from '@nestjs/common';
import { Token } from '../token.entity';
import { FindManyOptions, QueryFailedError } from 'typeorm';

@Injectable()
export class TokenMockRepository {
  private readonly data: Token[] = [
    {
      id: '789',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '789',
      apiGroup: 'FCD',
      createdDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      id: '101112',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '101112',
      apiGroup: 'FCD',
      createdDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      id: '131415',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '131415',
      apiGroup: 'FCD',
      createdDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      id: '161718',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '161718',
      apiGroup: 'FCD',
      createdDateTime: new Date(),
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        tokens: [],
      },
    },
    {
      id: '192021',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '192021',
      apiGroup: 'FCD',
      createdDateTime: new Date(),
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

    return this.data.find((token) => token.organizationId === where.organizationId);
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
    const index = this.data.findIndex((t) => t.id === token.id);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }
}
