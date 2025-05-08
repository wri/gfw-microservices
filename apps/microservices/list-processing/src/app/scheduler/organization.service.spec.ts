import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '@wri-monorepos/sql';
import { OrganizationService } from './organization.service';
import { Repository } from 'typeorm';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let repository: Repository<Organization>;

  const mockOrganizations: Organization[] = [
    {
      id: 1,
      organizationDb: 'test_db_1',
      organizationName: 'Test Organization 1',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
      featureFlags: [],
    },
    {
      id: 2,
      organizationDb: 'test_db_2',
      organizationName: 'Test Organization 2',
      organizationStatusId: 1,
      organizationActivatedTime: new Date(),
      renewalTime: new Date(),
      subscriptionStatusId: 1,
      featureFlags: [],
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn().mockResolvedValue(mockOrganizations),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getRepositoryToken(Organization, 'default'),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    repository = module.get(getRepositoryToken(Organization, 'default'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all organizations', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockOrganizations);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});
