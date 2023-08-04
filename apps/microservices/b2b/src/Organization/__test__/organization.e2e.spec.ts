import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrganizationController } from '../infrastructure/organization.controller';
import { OrganizationUseCases } from '../application/organization.use-case';
import { Organization } from '../domain/organization.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockModule } from '@wri-monorepos/shared';
import { OrganizationModule } from '../organization.module';
import { DataSource, Repository } from 'typeorm';

describe('OrganizationController (e2e)', () => {
  let app: INestApplication;
  let organizationUseCases: OrganizationUseCases;
  let AppDataSource: DataSource;
  let repository: Repository<Organization>;
  let mockOrganization1: Organization;
  let mockOrganization2: Organization;
  let mockCollection: Organization[];

  beforeAll(async () => {
    AppDataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [Organization],
      synchronize: true,
    });
    AppDataSource = await AppDataSource.initialize();

    repository = AppDataSource.getRepository(Organization);

    const module = await createMockModule({
      imports: [OrganizationModule],
      controllers: [OrganizationController],
    })
      .overrideProvider(getRepositoryToken(Organization))
      .useValue(repository)
      .compile();

    app = module.createNestApplication();
    await app.init();

    organizationUseCases =
      module.get<OrganizationUseCases>(OrganizationUseCases);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);
    mockOrganization1 = {
      id: 1,
      organizationName: 'test1',
      organizationDb: 'test1',
      organizationStatusId: 1,
      organizationActivatedTime: new Date('2018-10-02 18:56:00'),
      subscriptionStatusId: 1,
    };

    mockOrganization2 = {
      id: 2,
      organizationName: 'test2',
      organizationDb: 'test2',
      organizationStatusId: 1,
      organizationActivatedTime: new Date('2019-11-10 19:00:00'),
      subscriptionStatusId: 1,
    };

    mockCollection = [mockOrganization1, mockOrganization2];

    await Promise.all([
      repository.save(mockOrganization1),
      repository.save(mockOrganization2),
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should find an organization by id', async () => {
    const organizationId = 1;
    jest.spyOn(organizationUseCases, 'findById');

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .expect(200);
    const compareObj = {
      ...mockOrganization1,
      organizationActivatedTime:
        mockOrganization1.organizationActivatedTime.toISOString(),
    };

    expect(response.body).toEqual(compareObj);
  });

  it('should get all organizations', async () => {
    jest.spyOn(organizationUseCases, 'getAll');

    const response = await request(app.getHttpServer())
      .get('/organizations')
      .expect(200);

    const compareCollection = mockCollection.map((item) => ({
      ...item,
      organizationActivatedTime: item.organizationActivatedTime.toISOString(),
    }));

    expect(response.body).toEqual(compareCollection);
  });
});
