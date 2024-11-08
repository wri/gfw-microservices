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
});
