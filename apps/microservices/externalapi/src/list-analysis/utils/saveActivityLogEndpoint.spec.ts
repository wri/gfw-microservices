// Unit test for saveActivityLogEndpoint
import { SaveActivityLogEndpoint } from './saveActivityLogEndpoint';
import { UserService } from '../user.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Organization } from '../../api-keys/organization.entity';
import { ListActivityTypesEnum } from '@wri-monorepos/constants';
import { ClientStoreConnection as ClientStoreConnectionLibSql } from '@wri-monorepos/sql';
import { LIST_ANALISYS_ENDPOINT_NAMES, PREPARE_UPLOAD } from '../../config';
import { UserRoutes } from '../../api-keys/user-route.entity';
import { Repository } from 'typeorm';

describe('SaveActivityLogEndpoint', () => {
  let clientStoreConnectionLibSql: ClientStoreConnectionLibSql;
  let userService: UserService;
  let userEmail: string;
  let organizationDetails: Organization;
  let userRepository: Repository<UserRoutes>;
  const organization_user_id = 1;
  beforeEach(() => {
    organizationDetails = {
      id: 1,
      organizationActivatedTime: 9999,
      organizationDb: 'organizationDb',
      organizationName: 'organizationName',
      organizationStatusId: 1,
      renewalTime: new Date(),
      subscriptionStatusId: 1,
    };
    userEmail = 'userEmail';
    clientStoreConnectionLibSql = new ClientStoreConnectionLibSql();
    userService = new UserService(userRepository);
  });
  describe('saveActivityLogEndpoint', () => {
    it('should save activity log', async () => {
      clientStoreConnectionLibSql.getConnection = jest.fn().mockResolvedValue({
        getRepository: () => ({
          findOne: () => true,
          save: () => true,
        }),
        options: {
          database: 'mock_db',
        },
      });
      const saveActivityLogEndpoint = new SaveActivityLogEndpoint(
        clientStoreConnectionLibSql,
        userService
      );
      userService.findUserByAttributes = jest.fn().mockResolvedValue({
        user_email: userEmail,
      });
      expect(
        await saveActivityLogEndpoint.saveActivityLogEndpoint(
          organizationDetails,
          organization_user_id,
          LIST_ANALISYS_ENDPOINT_NAMES[PREPARE_UPLOAD],
          ListActivityTypesEnum.ListPrepareUpload
        )
      ).toBeUndefined();
    });
    it('Should return when organization_user_id is undefined', async () => {
      const saveActivityLogEndpoint = new SaveActivityLogEndpoint(
        clientStoreConnectionLibSql,
        userService
      );
      expect(
        await saveActivityLogEndpoint.saveActivityLogEndpoint(
          organizationDetails,
          undefined,
          LIST_ANALISYS_ENDPOINT_NAMES[PREPARE_UPLOAD],
          ListActivityTypesEnum.ListPrepareUpload
        )
      ).toBeUndefined();
    });
  });
  it('Should failed when try to get userEmail', async () => {
    clientStoreConnectionLibSql.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: () => true,
        save: () => true,
      }),
      options: {
        database: 'mock_db',
      },
    });
    const saveActivityLogEndpoint = new SaveActivityLogEndpoint(
      clientStoreConnectionLibSql,
      userService
    );
    userService.findUserByAttributes = jest.fn().mockResolvedValue(undefined);
    expect(
      await saveActivityLogEndpoint.saveActivityLogEndpoint(
        organizationDetails,
        organization_user_id,
        LIST_ANALISYS_ENDPOINT_NAMES[PREPARE_UPLOAD],
        ListActivityTypesEnum.ListPrepareUpload
      )
    ).toBeUndefined();
  });
  it('Should failed when try to save activity log', async () => {
    clientStoreConnectionLibSql.getConnection = jest.fn().mockResolvedValue({
      getRepository: () => ({
        findOne: () => true,
        save: jest
          .fn()
          .mockRejectedValueOnce(() => {
            throw new InternalServerErrorException('Error saving activity log');
          })
          .mockResolvedValueOnce(() => true),
      }),
      options: {
        database: 'mock_db',
      },
    });
    const saveActivityLogEndpoint = new SaveActivityLogEndpoint(
      clientStoreConnectionLibSql,
      userService
    );
    userService.findUserByAttributes = jest.fn().mockResolvedValue({
      user_email: userEmail,
    });
    expect(
      await saveActivityLogEndpoint.saveActivityLogEndpoint(
        organizationDetails,
        organization_user_id,
        LIST_ANALISYS_ENDPOINT_NAMES[PREPARE_UPLOAD],
        ListActivityTypesEnum.ListPrepareUpload
      )
    ).toBeUndefined();
  });
});
