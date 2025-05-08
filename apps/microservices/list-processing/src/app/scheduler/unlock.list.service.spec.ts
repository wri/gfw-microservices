import { Test, TestingModule } from '@nestjs/testing';
import { Organization } from '@wri-monorepos/sql';
import { UnlockListService } from './unlock.list.service';
import { OrganizationService } from './organization.service';
import { ListService } from './list.service';

describe('UnlockListService', () => {
  let service: UnlockListService;
  let organizationService: OrganizationService;
  let listService: ListService;

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
    const mockOrganizationService = {
      findAll: jest.fn().mockResolvedValue(mockOrganizations),
    };

    const mockListService = {
      unlockLists: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnlockListService,
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
        {
          provide: ListService,
          useValue: mockListService,
        },
      ],
    }).compile();

    service = module.get<UnlockListService>(UnlockListService);
    organizationService = module.get(OrganizationService);
    listService = module.get(ListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should unlock lists for all organizations', async () => {
      await service.execute();

      expect(organizationService.findAll).toHaveBeenCalled();
      expect(listService.unlockLists).toHaveBeenCalledTimes(2);
      expect(listService.unlockLists).toHaveBeenCalledWith(mockOrganizations[0]);
      expect(listService.unlockLists).toHaveBeenCalledWith(mockOrganizations[1]);
    });
  });
});
