import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConnectionController } from '../infraestructure/connection.controller';
import { ConnectionUseCases } from '../application/connection.use-case';

describe('ConnectionController (e2e)', () => {
  let app: INestApplication;
  let connectionUseCases: ConnectionUseCases;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionController],
      providers: [ConnectionUseCases],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connectionUseCases = moduleFixture.get<ConnectionUseCases>(
      ConnectionUseCases,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('should accept a connection invitation', async () => {
    const connectionId = 1;
    const connectionAcceptDto = { status: 'accepted' };

    jest
      .spyOn(connectionUseCases, 'acceptConnection')
      .mockResolvedValueOnce({ isSuccess: true });

    const response = await request(app.getHttpServer())
      .post(`/connections/${connectionId}/accept`)
      .send(connectionAcceptDto)
      .expect(200);

    expect(response.body).toEqual({ msg: 'Connection accepted' });
  });

  it('should reject a connection invitation', async () => {
    const connectionId = 1;
    const connectionRejectDto = { status: 'rejected' };

    jest
      .spyOn(connectionUseCases, 'rejectConnection')
      .mockResolvedValueOnce({ isSuccess: true });

    const response = await request(app.getHttpServer())
      .post(`/connections/${connectionId}/reject`)
      .send(connectionRejectDto)
      .expect(200);

    expect(response.body).toEqual({ msg: 'Connection rejected' });
  });

  it('should cancel a connection invitation', async () => {
    const connectionId = 1;
    const connectionCancelDto = { status: 'canceled' };

    jest
      .spyOn(connectionUseCases, 'cancelConnection')
      .mockResolvedValueOnce({ isSuccess: true });

    const response = await request(app.getHttpServer())
      .post(`/connections/${connectionId}/cancel`)
      .send(connectionCancelDto)
      .expect(200);

    expect(response.body).toEqual({ msg: 'Connection canceled' });
  });

  it('should get the list of invitations for an organization', async () => {
    const orgId = 1;
    const mockResult = [];

    jest
      .spyOn(connectionUseCases, 'getConnections')
      .mockResolvedValueOnce({ isSuccess: true, getValue: () => mockResult });

    const response = await request(app.getHttpServer())
      .get(`/connections/organization/${orgId}`)
      .expect(200);

    expect(response.body).toEqual(mockResult);
  });

  it('should search for connections', async () => {
    const searchDto = { filters: [], orders: [], limit: 10, offset: 0 };
    const orgId = '1';
    const mockResult = [];

    jest
      .spyOn(connectionUseCases, 'search')
      .mockResolvedValueOnce({ isSuccess: true, getValue: () => mockResult });

    const response = await request(app.getHttpServer())
      .get(`/connections/search?limit=${searchDto.limit}&offset=${searchDto.offset}&orgId=${orgId}`)
      .expect(200);

    expect(response.body).toEqual(mockResult);
  });

});