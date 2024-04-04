import { Test, TestingModule } from '@nestjs/testing';
import { ListUseCases } from './list.use-case';
import { OrganizationUseCases } from '../../Organization/application/organization.use-case';
import { List } from '../domain/list.entity';
import { ListRepository } from '../domain/list.repository';
import Result from '../../Shared/domain/result';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Organization } from '../../Organization/domain/organization.entity';
import { ERRORS } from '../../Shared/domain/constants';

const moduleMocker = new ModuleMocker(global);

describe('ListUseCases', () => {
  let useCases: ListUseCases;
  let organizationUseCases: OrganizationUseCases;
  const listRepository: ListRepository = {
    findListsByFilters: jest.fn(),
    findListById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUseCases,
        OrganizationUseCases,
        { provide: ListRepository, useValue: listRepository },
      ],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    useCases = module.get<ListUseCases>(ListUseCases);
    organizationUseCases =
      module.get<OrganizationUseCases>(OrganizationUseCases);
  });

  describe('findListsByFilters', () => {
    it('should find lists by filters when the organization exists', async () => {
      const filters = {};
      const orgId = 1;
      const orgRes: Organization = {
        id: 1,
        organizationName: 'test',
        organizationDb: 'db1',
        organizationStatusId: 1,
        organizationActivatedTime: new Date('2022-01-01'),
        renewalTime: new Date('2022-01-01'),
        subscriptionStatusId: 1,
      };
      const lists: List[] = [
        {
          id: 1,
          userId: 2,
          templateId: 3,
          listName: 'test',
          listTableName: 'test',
          listAnalysisTableName: 'test',
          listStatusId: 0,
          listErrorMessage: 'test',
          locationClassification: 'test',
          customAttributeNames: 'test',
          customAttributeTypes: 'test',
          listLocationsCount: 0,
          lockStatus: 0,
          lockUserId: 0,
          associatedGfwlist: 0,
          dashboardLastSubmit: new Date('2022-01-01'),
          dashboardLastResults: new Date('2022-01-01'),
          vectorTilesStoragePath: 'test',
          errorFileStoragePath: 'test',
          vectorTilesLastUpdated: new Date('2022-01-01'),
        },
        {
          id: 2,
          userId: 2,
          templateId: 3,
          listName: 'test2',
          listTableName: 'test2',
          listAnalysisTableName: 'testest2t',
          listStatusId: 0,
          listErrorMessage: 'test2',
          locationClassification: 'test2',
          customAttributeNames: 'test2',
          customAttributeTypes: 'test2',
          listLocationsCount: 0,
          lockStatus: 0,
          lockUserId: 0,
          associatedGfwlist: 0,
          dashboardLastSubmit: new Date('2022-01-01'),
          dashboardLastResults: new Date('2022-01-01'),
          vectorTilesStoragePath: 'test2',
          errorFileStoragePath: 'test2',
          vectorTilesLastUpdated: new Date('2022-01-01'),
        },
      ];

      jest
        .spyOn(organizationUseCases, 'findById')
        .mockResolvedValue(Result.ok(orgRes));
      jest
        .spyOn(listRepository, 'findListsByFilters')
        .mockResolvedValue(Result.ok(lists));

      const result = await useCases.findListsByFilters(filters, orgId);

      expect(organizationUseCases.findById).toHaveBeenCalledWith(orgId);
      expect(listRepository.findListsByFilters).toHaveBeenCalledWith(
        filters,
        'db1',
      );
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(lists);
    });

    it('should return failure if the organization does not exist', async () => {
      const filters = {};
      const orgId = 1;
      const orgRes = Result.fail(ERRORS.NOT_ELEMENTS_FOUND);

      jest.spyOn(organizationUseCases, 'findById').mockResolvedValue(orgRes);

      const result = await useCases.findListsByFilters(filters, orgId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.NOT_ELEMENTS_FOUND);
    });
  });

  describe('findListById', () => {
    it('should find a list by ID when the organization exists', async () => {
      const id = 1;
      const orgId = 1;
      const orgRes: Organization = {
        id: 1,
        organizationName: 'test',
        organizationDb: 'db1',
        organizationStatusId: 1,
        organizationActivatedTime: new Date('2022-01-01'),
        renewalTime: new Date('2022-01-01'),
        subscriptionStatusId: 1,
      };
      const list: List = {
        id: 1,
        userId: 2,
        templateId: 3,
        listName: 'test',
        listTableName: 'test',
        listAnalysisTableName: 'test',
        listStatusId: 0,
        listErrorMessage: 'test',
        locationClassification: 'test',
        customAttributeNames: 'test',
        customAttributeTypes: 'test',
        listLocationsCount: 0,
        lockStatus: 0,
        lockUserId: 0,
        associatedGfwlist: 0,
        dashboardLastSubmit: new Date('2022-01-01'),
        dashboardLastResults: new Date('2022-01-01'),
        vectorTilesStoragePath: 'test',
        errorFileStoragePath: 'test',
        vectorTilesLastUpdated: new Date('2022-01-01'),
      };

      jest
        .spyOn(organizationUseCases, 'findById')
        .mockResolvedValue(Result.ok(orgRes));
      jest
        .spyOn(listRepository, 'findListById')
        .mockResolvedValue(Result.ok(list));

      const result = await useCases.findListById(id, orgId);

      expect(organizationUseCases.findById).toHaveBeenCalledWith(orgId);
      expect(listRepository.findListById).toHaveBeenCalledWith(id, 'db1');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(list);
    });

    it('should return failure if the organization does not exist', async () => {
      const id = 1;
      const orgId = 1;
      const orgRes = Result.fail(ERRORS.NOT_ELEMENTS_FOUND);

      jest.spyOn(organizationUseCases, 'findById').mockResolvedValue(orgRes);

      const result = await useCases.findListById(id, orgId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(ERRORS.NOT_ELEMENTS_FOUND);
    });
  });
});
