// src/example/commodity.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CommodityService } from './commodity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListTemplate } from '@wri-monorepos/sql';
import { Repository } from 'typeorm';

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

      jest.spyOn(listTemplateRepository, 'findOne').mockResolvedValue(mockTemplate);
      jest
        .spyOn(service, 'getListsByCommodity')
        .mockResolvedValue(mockLists.map((list) => ({ id: list.id, name: list.listName })));

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([
        { id: 1, name: 'Wheat List 1' },
        { id: 2, name: 'Wheat List 2' },
      ]);
    });

    it('should return lists for multiple templates of the same commodity', async () => {
      const commodity = 'Palm Oil';
      const organizationDatabase = 'test_db';
      const mockTemplates = [
        { id: 1, templateName: 'Palm oil mill', locationTypeId: 1 },
        { id: 2, templateName: 'Palm smallholder farm', locationTypeId: 1 },
        { id: 3, templateName: 'Palm oil generic', locationTypeId: 1 },
      ];
      const mockLists = [
        { id: 1, listName: 'Palm Mill List' },
        { id: 2, listName: 'Smallholder List' },
        { id: 3, listName: 'Generic Palm List' },
      ];

      jest.spyOn(listTemplateRepository, 'findOne').mockImplementation((options) => {
        const template = mockTemplates.find(
          (t) =>
            t.templateName === (options.where as unknown as { templateName: string }).templateName
        );
        return Promise.resolve(template);
      });
      jest
        .spyOn(service, 'getListsByCommodity')
        .mockResolvedValue(mockLists.map((list) => ({ id: list.id, name: list.listName })));

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

      jest.spyOn(listTemplateRepository, 'findOne').mockResolvedValue(mockTemplate);
      jest
        .spyOn(service, 'getListsByCommodity')
        .mockResolvedValue(mockLists.map((list) => ({ id: list.id, name: list.listName })));

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([{ id: 1, name: 'Unknown List' }]);
    });

    it('should return empty array when no lists are found', async () => {
      const commodity = 'Non-existent Commodity';
      const organizationDatabase = 'test_db';

      jest.spyOn(listTemplateRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(service, 'getListsByCommodity').mockResolvedValue([]);

      const result = await service.getListsByCommodity({ commodity, organizationDatabase });
      expect(result).toEqual([]);
    });
  });

  describe('getCommodityFromTemplate', () => {
    it('should return the correct commodity for a given template name', () => {
      expect(service.getCommodityFromTemplate('palm oil mill')).toBe('palm oil');
      expect(service.getCommodityFromTemplate('palm smallholder farm')).toBe('palm oil');
      expect(service.getCommodityFromTemplate('soy silo')).toBe('soy');
      expect(service.getCommodityFromTemplate('cattle ranch')).toBe('gfwp_cattle');
      expect(service.getCommodityFromTemplate('cocoa farm')).toBe('cocoa');
    });

    it('should handle case insensitivity', () => {
      expect(service.getCommodityFromTemplate('PALM OIL MILL')).toBe('palm oil');
      expect(service.getCommodityFromTemplate('Palm Oil Mill')).toBe('palm oil');
    });

    it('should return the input template name if no match is found', () => {
      expect(service.getCommodityFromTemplate('unknown template')).toBe('unknown template');
      expect(service.getCommodityFromTemplate('')).toBe('');
    });
  });
});
