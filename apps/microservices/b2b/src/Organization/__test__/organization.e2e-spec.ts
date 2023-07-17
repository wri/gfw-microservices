import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrganizationController } from '../infrastructure/organization.controller';
import { OrganizationUseCases } from '../application/organization.use-case';
import { Organization } from '../domain/organization.entity';

describe('OrganizationController (e2e)', () => {
  let app: INestApplication;
  let organizationUseCases: OrganizationUseCases;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [OrganizationUseCases],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    organizationUseCases =
      moduleFixture.get<OrganizationUseCases>(OrganizationUseCases);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should find an organization by id', async () => {
    const organizationId = 1;
    const mockOrganization: Organization = {
      id: 0,
      organizationName: '',
      organizationDb: '',
      organizationStatusId: 0,
      organizationActivatedTime: undefined,
      subscriptionStatusId: 0
    };

    jest.spyOn(organizationUseCases, 'findById').mockResolvedValueOnce({
      isSuccess: true,
      getValue: () => mockOrganization,
    });

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .expect(200);

    expect(response.body).toEqual(mockOrganization);
  });

  it('should get all organizations', async () => {
    const mockOrganizations: Organization[] = [
    ];

    jest.spyOn(organizationUseCases, 'getAll').mockResolvedValueOnce({
      isSuccess: true,
      getValue: () => mockOrganizations,
    });

    const response = await request(app.getHttpServer())
      .get('/organizations')
      .expect(200);

    expect(response.body).toEqual(mockOrganizations);
  });

  // Resto de las pruebas...
});
