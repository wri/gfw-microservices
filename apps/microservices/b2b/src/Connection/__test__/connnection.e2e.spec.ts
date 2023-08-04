import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConnectionRequest } from '../domain/connection.entity';
import { createMockModule } from '@wri-monorepos/shared';
import { DataSource, Repository } from 'typeorm';
import { ConnectionRepositorySqlite } from './connection.repository.sqlite';
import { ConnectionRepositorySP } from '../domain/connection.repository.sp';
import { CreateConnectionDto } from '../application/dtos/connection.dto';
import { List } from '../../List/domain/list.entity';
import { Organization } from '../../Organization/domain/organization.entity';
import { EmailService } from '@wri-monorepos/aws';
import { ConnectionModule } from '../connection.module';
import { ConnectionController } from '../infraestructure/connection.controller';
import Result from '../../Shared/domain/result';
import { ActivityLogUseCases } from '../../ActivityLog/application/activity-log.use-case';
import { ConnectionStatus } from '../domain/connection';

describe('ConnectionController (e2e)', () => {
  let app: INestApplication;
  let AppDataSource: DataSource;

  let repoOrganization: Repository<Organization>;
  let repoList: Repository<List>;
  let repoConnectionSP: ConnectionRepositorySqlite;
  let repoConnection: Repository<ConnectionRequest>;

  let mockEmailService;
  let mockActivityLog;
  let mockConnectionsCollection: ConnectionRequest[];
  let mockConnection: ConnectionRequest;

  beforeAll(async () => {
    AppDataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [ConnectionRequest, Organization, List],
      synchronize: true,
    });
    AppDataSource = await AppDataSource.initialize();

    repoOrganization = AppDataSource.getRepository(Organization);
    repoList = AppDataSource.getRepository(List);
    repoConnectionSP = new ConnectionRepositorySqlite(AppDataSource);
    repoConnection = AppDataSource.getRepository(ConnectionRequest);

    mockEmailService = { sendEmail: jest.fn() };
    mockActivityLog = { saveActivityLog: jest.fn() };

    const module = await createMockModule({
      imports: [ConnectionModule],
      controllers: [ConnectionController],
    })
      .overrideProvider(getRepositoryToken(ConnectionRequest))
      .useValue(repoConnection)
      .overrideProvider(ConnectionRepositorySP)
      .useValue(repoConnectionSP)
      .overrideProvider(getRepositoryToken(List))
      .useValue(repoList)
      .overrideProvider(getRepositoryToken(Organization))
      .useValue(repoOrganization)
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .overrideProvider(ActivityLogUseCases)
      .useValue(mockActivityLog)
      .compile();

    app = module.createNestApplication();
    await app.init();

    //connectionUseCases = module.get<ConnectionUseCases>(ConnectionUseCases);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    mockConnection = {
      id: 1,
      idSourceOrganization: 2,
      idTargetOrganization: 1,
      createDate: new Date(),
      sourceEmail: 'test1@gmail.com',
      initialTargetEmail: 'test2@gmail.com',
    };

    mockConnectionsCollection = [
      mockConnection,
      {
        id: 2,
        idSourceOrganization: 3,
        idTargetOrganization: 1,
        createDate: new Date(),
        sourceEmail: 'test3@gmail.com',
        initialTargetEmail: 'test4@gmail.com',
      },
    ];

    const promises = mockConnectionsCollection.map((connection) => {
      return repoConnection.save(connection);
    });
    await Promise.all(promises);
  });

  it('should send a connection invitation', async () => {
    const connectionDto: CreateConnectionDto = {
      sourceEmail: 'jose.quiroz.5@wriconsultant.org',
      targetEmail: 'prosupertester1@gmail.com',
      targetOrganization: 1,
      sourceOrganization: 2,
    };

    jest
      .spyOn(repoConnectionSP, 'createConnection')
      .mockReturnValue(Promise.resolve(Result.ok(true)));

    const response = await request(app.getHttpServer())
      .post(`/connections`)
      .send(connectionDto)
      .expect(201);

    expect(response.body).toEqual({ msg: 'Invitation sent' });
  });

  it('should accept a connection invitation', async () => {
    const connectionId = 1;
    const connectionAcceptDto = { status: 'accepted' };

    jest
      .spyOn(repoConnectionSP, 'updateStatusConnection')
      .mockReturnValue(Promise.resolve(Result.ok({ id: 1 })));

    const response = await request(app.getHttpServer())
      .post(`/connections/${connectionId}/accept`)
      .send(connectionAcceptDto)
      .expect(201);

    expect(response.body).toEqual({ msg: 'Connection accepted' });
  });

  it('should reject a connection invitation', async () => {
    const connectionId = 1;
    const connectionRejectDto = { status: 'rejected' };

    jest
      .spyOn(repoConnectionSP, 'updateStatusConnection')
      .mockReturnValue(Promise.resolve(Result.ok({ id: 1 })));

    const response = await request(app.getHttpServer())
      .post(`/connections/${connectionId}/reject`)
      .send(connectionRejectDto)
      .expect(201);

    expect(response.body).toEqual({ msg: 'Connection rejected' });
  });

  it('should cancel a connection invitation', async () => {
    const connectionId = 1;
    const connectionCancelDto = { status: 'canceled' };

    jest
      .spyOn(repoConnectionSP, 'updateStatusConnection')
      .mockReturnValue(Promise.resolve(Result.ok({ id: 1 })));

    const response = await request(app.getHttpServer())
      .post(`/connections/${connectionId}/cancel`)
      .send(connectionCancelDto)
      .expect(201);

    expect(response.body).toEqual({ msg: 'Connection canceled' });
  });

  it('should get the list of invitations for an organization', async () => {
    const orgId = 1;
    const mockResult = [
      {
        id: 1,
        createDate: new Date(),
        sourceOrganization: 'test',
        targetOrganization: 'test',
        sourceEmail: 'test1@test.com',
        editorEmail: 'test2@test.com',
        editedDate: new Date(),
        status: ConnectionStatus.accepted,
        description: 'test',
        idSourceOrganization: 2,
        idTargetOrganization: 1,
      },
      {
        id: 2,
        createDate: new Date(),
        sourceOrganization: 'test',
        targetOrganization: 'test',
        sourceEmail: 'test1@test.com',
        editorEmail: 'test2@test.com',
        editedDate: new Date(),
        status: ConnectionStatus.rejected,
        description: 'test',
        idSourceOrganization: 3,
        idTargetOrganization: 1,
      },
    ];

    jest
      .spyOn(repoConnectionSP, 'getConnections')
      .mockReturnValue(Promise.resolve(Result.ok(mockResult)));

    await request(app.getHttpServer())
      .get(`/connections/organization/${orgId}`)
      .expect(200);
  });

  it('should search for connections', async () => {
    const searchDto = { filters: [], orders: [], limit: 10, offset: 0 };
    const orgId = '1';

    await request(app.getHttpServer())
      .get(
        `/connections/search?limit=${searchDto.limit}&offset=${searchDto.offset}&orgId=${orgId}`,
      )
      .expect(200);
  });
});
