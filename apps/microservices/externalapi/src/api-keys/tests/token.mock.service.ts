import { Injectable } from '@nestjs/common';
import { ExternalAPIKey } from '../external-api-key.entity';
import { FindManyOptions, QueryFailedError } from 'typeorm';
import { UserRoutes } from '../user-route.entity';

@Injectable()
export class TokenMockRepository {
  private readonly data: ExternalAPIKey[] = [
    {
      awsId: '789',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '789',
      apiGroups: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        user_email: 'user1@example.com',
        organization_id: 1,
        organization_user_id: 1,
        organization_user_status_id: 1,
        tokens: [],
      },
    },
    {
      awsId: '101112',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '101112',
      apiGroups: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        user_email: 'user1@example.com',
        organization_id: 1,
        organization_user_id: 1,
        organization_user_status_id: 1,
        tokens: [],
      },
    },
    {
      awsId: '131415',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '131415',
      apiGroups: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        user_email: 'user1@example.com',
        organization_id: 1,
        organization_user_id: 1,
        organization_user_status_id: 1,
        tokens: [],
      },
    },
    {
      awsId: '161718',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '161718',
      apiGroups: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        user_email: 'user1@example.com',
        organization_id: 1,
        organization_user_id: 1,
        organization_user_status_id: 1,
        tokens: [],
      },
    },
    {
      awsId: '192021',
      creatorUserId: 1,
      organizationId: 9,
      apiKey: '192021',
      apiGroups: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        user_email: 'user1@example.com',
        organization_id: 1,
        organization_user_id: 1,
        organization_user_status_id: 1,
        tokens: [],
      },
    },
    {
      awsId: 'TOTESTDELETE',
      creatorUserId: 1,
      organizationId: 999,
      apiKey: 'T0D3L3T3',
      apiGroups: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        user_email: 'user1@example.com',
        organization_id: 1,
        organization_user_id: 1,
        organization_user_status_id: 1,
        tokens: [],
      },
    },
    {
      awsId: 'VALID_USER_EMAIL',
      creatorUserId: 24,
      organizationId: 778,
      apiKey: 'V4L1DUS3R',
      apiGroups: 'FCD',
      updateDateTime: new Date(),
      user: {
        id: 123,
        user_email: 'user1@example.com',
        organization_id: 1,
        organization_user_id: 1,
        organization_user_status_id: 1,
        tokens: [],
      },
    },
  ];

  async find(options?: FindManyOptions<ExternalAPIKey>) {
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
  async findOne(options?: FindManyOptions<ExternalAPIKey>): Promise<ExternalAPIKey | undefined> {
    const [{ where }] = Array.isArray(options) ? options : [options];

    return this.data.find((token) => Object.keys(where).every((key) => token[key] === where[key]));
  }

  async save(token: ExternalAPIKey): Promise<ExternalAPIKey> {
    if (token.organizationId === 999) {
      throw new QueryFailedError('query', [], []);
    }

    token.user = {
      id: 123,
      user_email: 'user1@example.com',
      organization_id: 1,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    };

    this.data.push(token);
    return token;
  }

  async delete(token: ExternalAPIKey): Promise<void> {
    const index = this.data.findIndex((t) => t.awsId === token.awsId);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }
}
export class UserMockRepository {
  private readonly data: UserRoutes[] = [
    {
      id: 23,
      user_email: 'user1@example.com',
      organization_id: 10,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    },
    {
      id: 23,
      user_email: 'user1@example.com',
      organization_id: 777,
      organization_user_id: 1,
      organization_user_status_id: 1,
      tokens: [],
    },
    {
      id: 24,
      user_email: 'user1@valid.com',
      organization_id: 778,
      organization_user_id: 7,
      organization_user_status_id: 1,
      tokens: [],
    },
  ];

  async findOne(options?: FindManyOptions<UserRoutes>): Promise<UserRoutes | undefined> {
    const [{ where }] = Array.isArray(options) ? options : [options];

    return this.data.find((user) =>
      Object.keys(where).every(
        (key) => user[key == 'organization_user_id' ? 'id' : key] === where[key]
      )
    );
  }
}
