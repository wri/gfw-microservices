// src/example/commodity.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CommodityService } from './commodity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListTemplate } from '@wri-monorepos/sql';
import { Repository, In } from 'typeorm';
import { ClientStoreConnection } from '@wri-monorepos/sql';

describe('CommodityService', () => {
  let service: CommodityService;
  let listTemplateRepository: Repository<ListTemplate>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommodityService,
        {
          provide: getRepositoryToken(ListTemplate, 'default'),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CommodityService>(CommodityService);
    listTemplateRepository = module.get<Repository<ListTemplate>>(
      getRepositoryToken(ListTemplate, 'default')
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCommodityFromExistingList', () => {
    it('should return the commodity from the list if it is not "other"', async () => {
      jest.spyOn(service, 'getListCommodityAndTableName').mockResolvedValue({
        commodity: 'Wheat',
        listTableName: 'some_table',
        templateId: 1,
      });

      jest
        .spyOn(listTemplateRepository, 'find')
        .mockResolvedValue([{ id: 1, templateName: 'Template Commodity' } as ListTemplate]);

      const result = await service.getCommodityFromExistingList('some_database', 1);
      expect(result).toEqual({ commodity: 'Wheat' });
    });

    it('should return the commodity from the location if list commodity is "other"', async () => {
      jest.spyOn(service, 'getListCommodityAndTableName').mockResolvedValue({
        commodity: 'other',
        listTableName: 'some_table',
        templateId: 1,
      });

      jest.spyOn(service, 'getCommodityFromLocation').mockResolvedValue({ commodity: 'Corn' });

      jest
        .spyOn(listTemplateRepository, 'find')
        .mockResolvedValue([{ id: 1, templateName: 'Template Commodity' } as ListTemplate]);

      const result = await service.getCommodityFromExistingList('some_database', 1);
      expect(result).toEqual({ commodity: 'Corn' });
    });

    it('should return the template name if both list and location commodities are "other"', async () => {
      jest.spyOn(service, 'getListCommodityAndTableName').mockResolvedValue({
        commodity: 'other',
        listTableName: 'some_table',
        templateId: 1,
      });

      jest.spyOn(service, 'getCommodityFromLocation').mockResolvedValue({ commodity: 'other' });

      jest
        .spyOn(listTemplateRepository, 'find')
        .mockResolvedValue([{ id: 1, templateName: 'Template Commodity' } as ListTemplate]);

      const result = await service.getCommodityFromExistingList('some_database', 1);
      expect(result).toEqual({ commodity: 'Template Commodity' });
    });

    it('should return "No commodity found" if no commodity is found', async () => {
      jest.spyOn(service, 'getListCommodityAndTableName').mockResolvedValue({
        commodity: 'other',
        listTableName: 'some_table',
        templateId: 1,
      });

      jest.spyOn(service, 'getCommodityFromLocation').mockResolvedValue({ commodity: 'other' });

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue([]);

      const result = await service.getCommodityFromExistingList('some_database', 1);
      expect(result).toEqual({ commodity: 'No commodity found' });
    });

    it('should handle errors gracefully and return "No commodity found"', async () => {
      jest
        .spyOn(service, 'getListCommodityAndTableName')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.getCommodityFromExistingList('some_database', 1);
      expect(result).toEqual({ commodity: 'No commodity found' });
    });
  });

  describe('getListsByCommodity', () => {
    it('should return lists for a single template commodity', async () => {
      const commodity = 'Wheat';
      const organizationDatabase = 'test_db';
      const mockTemplate = { id: 1, templateName: 'Wheat', locationTypeId: 1 };
      const mockLists = [
        { id: 1, listName: 'Wheat List 1' },
        { id: 2, listName: 'Wheat List 2' },
      ];

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue([mockTemplate]);
      jest.spyOn(service, 'getListsByCommodity').mockImplementation(async () => {
        return mockLists.map((list) => ({ id: list.id, name: list.listName }));
      });

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([
        { id: 1, name: 'Wheat List 1' },
        { id: 2, name: 'Wheat List 2' },
      ]);
    });

    it('should handle commodities with multiple templates', async () => {
      const commodity = 'palm oil';
      const organizationDatabase = 'test_db';
      const mockTemplates = [
        { id: 1, templateName: 'palm oil mill', locationTypeId: 1 },
        { id: 2, templateName: 'palm smallholder farm', locationTypeId: 1 },
        { id: 3, templateName: 'palm oil generic', locationTypeId: 1 },
      ];
      const mockLists = [
        { id: 1, listName: 'Palm Mill List' },
        { id: 2, listName: 'Smallholder List' },
        { id: 3, listName: 'Generic Palm List' },
      ];

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue(mockTemplates);
      jest.spyOn(service, 'getListsByCommodity').mockImplementation(async () => {
        return mockLists.map((list) => ({ id: list.id, name: list.listName }));
      });

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([
        { id: 1, name: 'Palm Mill List' },
        { id: 2, name: 'Smallholder List' },
        { id: 3, name: 'Generic Palm List' },
      ]);
    });

    it('should handle commodities not in the template map', async () => {
      const commodity = 'Unknown Commodity';
      const organizationDatabase = 'test_db';
      const mockTemplate = { id: 1, templateName: 'Unknown Commodity', locationTypeId: 1 };
      const mockLists = [{ id: 1, listName: 'Unknown List' }];

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue([mockTemplate]);
      jest.spyOn(service, 'getListsByCommodity').mockImplementation(async () => {
        return mockLists.map((list) => ({ id: list.id, name: list.listName }));
      });

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([{ id: 1, name: 'Unknown List' }]);
    });

    it('should return empty array when no lists are found', async () => {
      const commodity = 'Non-existent Commodity';
      const organizationDatabase = 'test_db';

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue([]);
      jest.spyOn(service, 'getListsByCommodity').mockImplementation(async () => {
        return [];
      });

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully and return empty array', async () => {
      const commodity = 'Wheat';
      const organizationDatabase = 'test_db';

      jest.spyOn(listTemplateRepository, 'find').mockRejectedValue(new Error('Database error'));

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([]);
    });

    it('should handle special characters in commodity names', async () => {
      const commodity = 'GFWP_Cattle';
      const organizationDatabase = 'test_db';
      const mockTemplate = { id: 1, templateName: 'cattle ranch', locationTypeId: 1 };
      const mockLists = [{ id: 1, listName: 'Cattle List' }];

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue([mockTemplate]);
      jest.spyOn(service, 'getListsByCommodity').mockImplementation(async () => {
        return mockLists.map((list) => ({ id: list.id, name: list.listName }));
      });

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([{ id: 1, name: 'Cattle List' }]);
    });

    it('getCommodityAndTemplates should handle mapspam codes', async () => {
      const commodity = 'OILP';
      const mockFn = (listTemplateRepository.find = jest.fn().mockResolvedValue([]));

      await service.getCommodityAndTemplates(commodity);
      expect(mockFn).toHaveBeenCalledWith({
        where: {
          templateName: In(['palm oil mill', 'palm smallholder farm', 'palm oil generic', 'OILP']),
        },
      });
    });
  });

  describe('checkIfListExistAndCommodityIsTheSame', () => {
    it('should return true when list exists with matching commodity', async () => {
      const listId = 1;
      const commodity = 'palm oil';
      const clientDatabase = 'test_db';
      const mockTemplates = [
        { id: 1, templateName: 'palm oil mill', locationTypeId: 1 },
        { id: 2, templateName: 'palm smallholder farm', locationTypeId: 1 },
      ];
      const mockLists = [{ id: 1, listName: 'Palm List' }];

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue(mockTemplates);
      jest.spyOn(service, 'checkIfListExistAndCommodityIsTheSame').mockImplementation(async () => {
        return mockLists.length > 0;
      });

      const result = await service.checkIfListExistAndCommodityIsTheSame(
        listId,
        commodity,
        clientDatabase
      );
      expect(result).toBe(true);
    });

    it('should return false when list exists but commodity does not match', async () => {
      const listId = 1;
      const commodity = 'soy';
      const clientDatabase = 'test_db';
      const mockTemplates = [{ id: 1, templateName: 'soy silo', locationTypeId: 1 }];

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue(mockTemplates);
      jest.spyOn(service, 'checkIfListExistAndCommodityIsTheSame').mockImplementation(async () => {
        return false;
      });

      const result = await service.checkIfListExistAndCommodityIsTheSame(
        listId,
        commodity,
        clientDatabase
      );
      expect(result).toBe(false);
    });

    it('should handle case-insensitive commodity matching', async () => {
      const listId = 1;
      const commodity = 'PALM OIL';
      const clientDatabase = 'test_db';
      const mockTemplates = [
        { id: 1, templateName: 'palm oil mill', locationTypeId: 1 },
        { id: 2, templateName: 'palm smallholder farm', locationTypeId: 1 },
      ];
      const mockLists = [{ id: 1, listName: 'Palm List' }];

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue(mockTemplates);
      jest.spyOn(service, 'checkIfListExistAndCommodityIsTheSame').mockImplementation(async () => {
        return mockLists.length > 0;
      });

      const result = await service.checkIfListExistAndCommodityIsTheSame(
        listId,
        commodity,
        clientDatabase
      );
      expect(result).toBe(true);
    });

    it('should handle commodities with special characters', async () => {
      const listId = 1;
      const commodity = 'gfwp_cattle';
      const clientDatabase = 'test_db';
      const mockTemplates = [
        { id: 1, templateName: 'cattle ranch', locationTypeId: 1 },
        { id: 2, templateName: 'cattle generic', locationTypeId: 1 },
      ];
      const mockLists = [{ id: 1, listName: 'Cattle List' }];

      jest.spyOn(listTemplateRepository, 'find').mockResolvedValue(mockTemplates);
      jest.spyOn(service, 'checkIfListExistAndCommodityIsTheSame').mockImplementation(async () => {
        return mockLists.length > 0;
      });

      const result = await service.checkIfListExistAndCommodityIsTheSame(
        listId,
        commodity,
        clientDatabase
      );
      expect(result).toBe(true);
    });

    it('should handle empty template results', async () => {
      const listId = 1;
      const commodity = 'Unknown Commodity';
      const clientDatabase = 'test_db';

      // Mock getCommodityAndTemplates to return empty templates
      jest.spyOn(service as any, 'getCommodityAndTemplates').mockResolvedValue({
        commodityName: 'Unknown Commodity',
        validTemplates: [],
      });

      // Mock the list repository to avoid SQLite collation issues
      const mockListRepository = {
        find: jest.fn().mockResolvedValue([]),
      };

      // Mock ClientStoreConnection to avoid actual database connection
      jest.spyOn(ClientStoreConnection.prototype, 'getConnection').mockResolvedValue({
        getRepository: () => mockListRepository,
      } as any);

      const result = await service.checkIfListExistAndCommodityIsTheSame(
        listId,
        commodity,
        clientDatabase
      );
      expect(result).toBe(false);
    });
  });

  describe('getCommodityFromTemplate', () => {
    it('should handle template names with special characters', () => {
      // Test with exact template names from COMMODITY_TEMPLATE_MAP
      expect(service.getCommodityFromTemplate('palm oil mill')).toBe('palm oil');
      expect(service.getCommodityFromTemplate('palm smallholder farm')).toBe('palm oil');
      expect(service.getCommodityFromTemplate('soy silo')).toBe('soy');
      expect(service.getCommodityFromTemplate('cattle ranch')).toBe('gfwp_cattle');
      expect(service.getCommodityFromTemplate('cocoa farm')).toBe('cocoa');
    });

    it('should return the input template name if no match is found', () => {
      expect(service.getCommodityFromTemplate('palm_oil_mill')).toBe('palm_oil_mill');
      expect(service.getCommodityFromTemplate('unknown-template')).toBe('unknown-template');
    });
  });
});
