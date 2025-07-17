import { Test, TestingModule } from '@nestjs/testing';
import { ColumnResolverService } from './column-resolver.service';
import { ListMetadataService } from './list-metadata.service';
import { templateColumns } from './constants';

describe('ColumnResolverService', () => {
  let service: ColumnResolverService;
  let listMetadataService: jest.Mocked<ListMetadataService>;

  beforeEach(async () => {
    const mockListMetadataService = {
      getListMetadata: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnResolverService,
        {
          provide: ListMetadataService,
          useValue: mockListMetadataService,
        },
      ],
    }).compile();

    service = module.get<ColumnResolverService>(ColumnResolverService);
    listMetadataService = module.get(ListMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveColumns', () => {
    describe('Version 2 lists (commodity-based)', () => {
      it('should resolve columns for palm oil commodity', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 0,
          version: 2,
          commodity: 'POIL',
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('commodity');
        expect(result.columns).toEqual(templateColumns.PALM_OIL_GENERIC);
        expect(result.resolvedFrom).toContain('POIL -> PALM_OIL_GENERIC');
      });

      it('should resolve columns for soy commodity', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 0,
          version: 2,
          commodity: 'SOYB',
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('commodity');
        expect(result.columns).toEqual(templateColumns.SOY_GENERIC);
        expect(result.resolvedFrom).toContain('SOYB -> SOY_GENERIC');
      });

      it('should resolve columns for cocoa commodity', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 0,
          version: 2,
          commodity: 'COCO',
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('commodity');
        expect(result.columns).toEqual(templateColumns.COCOA_GENERIC);
        expect(result.resolvedFrom).toContain('COCO -> COCOA_GENERIC');
      });

      it('should resolve columns for GFWP prefixed commodity', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 0,
          version: 2,
          commodity: 'GFWP_Multiple',
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('commodity');
        expect(result.columns).toEqual(templateColumns.INVESTMENT);
        expect(result.resolvedFrom).toContain('GFWP_Multiple -> INVESTMENT');
      });

      it('should default to commodity generic for unknown commodity', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 0,
          version: 2,
          commodity: 'UNKNOWN_COMMODITY',
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('commodity');
        expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
        expect(result.resolvedFrom).toContain('UNKNOWN_COMMODITY -> COMMODITY_GENERIC');
      });

      it('should handle version 2 list with no commodity', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 0,
          version: 2,
          commodity: null,
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('default');
        expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
        expect(result.resolvedFrom).toBe('COMMODITY_GENERIC (no commodity specified)');
      });
    });

    describe('Version 1 lists (template-based)', () => {
      it('should resolve columns for template ID 5 (Palm Oil Generic)', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 5,
          version: 1,
          commodity: null,
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('template');
        expect(result.columns).toEqual(templateColumns.PALM_OIL_GENERIC);
        expect(result.resolvedFrom).toBe('templateId: 5');
      });

      it('should resolve columns for template ID 13 (Cocoa Generic)', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 13,
          version: 1,
          commodity: null,
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('template');
        expect(result.columns).toEqual(templateColumns.COCOA_GENERIC);
        expect(result.resolvedFrom).toBe('templateId: 13');
      });

      it('should fall back to default for unknown template ID', async () => {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          templateId: 999,
          version: 1,
          commodity: null,
          listName: 'Test List',
          locationClassification: 'Supply Shed',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('default');
        expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
        expect(result.resolvedFrom).toBe('templateId: 14 (default fallback)');
      });
    });

    describe('Error handling', () => {
      it('should handle metadata fetch failure with fallback template', async () => {
        listMetadataService.getListMetadata.mockResolvedValue(null);

        const result = await service.resolveColumns(123, 'testdb', false, 13);

        expect(result.source).toBe('template');
        expect(result.columns).toEqual(templateColumns.COCOA_GENERIC);
        expect(result.resolvedFrom).toBe('templateId: 13');
      });

      it('should handle metadata service error', async () => {
        listMetadataService.getListMetadata.mockRejectedValue(new Error('Database error'));

        const result = await service.resolveColumns(123, 'testdb', false, 5);

        expect(result.source).toBe('template');
        expect(result.columns).toEqual(templateColumns.PALM_OIL_GENERIC);
        expect(result.resolvedFrom).toBe('templateId: 5');
      });

      it('should default to generic when no fallback provided', async () => {
        listMetadataService.getListMetadata.mockResolvedValue(null);

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('default');
        expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
        expect(result.resolvedFrom).toBe('templateId: 14 (default fallback)');
      });
    });
  });
});
