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
    it('should return COMMODITY_GENERIC columns when metadata is available', async () => {
      listMetadataService.getListMetadata.mockResolvedValue({
        id: 123,
        version: 2,
        commodity: 'POIL',
        listName: 'Test List',
      });

      const result = await service.resolveColumns(123, 'testdb', false);

      expect(result.source).toBe('default');
      expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
      expect(result.resolvedFrom).toBe('COMMODITY_GENERIC');
    });

    it('should return COMMODITY_GENERIC columns when metadata is null', async () => {
      listMetadataService.getListMetadata.mockResolvedValue(null);

      const result = await service.resolveColumns(123, 'testdb', false);

      expect(result.source).toBe('default');
      expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
      expect(result.resolvedFrom).toBe('COMMODITY_GENERIC');
    });

    it('should return COMMODITY_GENERIC columns for version 1 lists', async () => {
      listMetadataService.getListMetadata.mockResolvedValue({
        id: 123,
        version: 1,
        commodity: null,
        listName: 'Test List',
      });

      const result = await service.resolveColumns(123, 'testdb', false);

      expect(result.source).toBe('default');
      expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
      expect(result.resolvedFrom).toBe('COMMODITY_GENERIC');
    });

    it('should return COMMODITY_GENERIC columns for version 2 lists with any commodity', async () => {
      const commodities = ['POIL', 'SOYB', 'COCO', 'GFWP_Multiple', 'UNKNOWN_COMMODITY'];

      for (const commodity of commodities) {
        listMetadataService.getListMetadata.mockResolvedValue({
          id: 123,
          version: 2,
          commodity,
          listName: 'Test List',
        });

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result.source).toBe('default');
        expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
        expect(result.resolvedFrom).toBe('COMMODITY_GENERIC');
      }
    });

    it('should call getListMetadata with correct parameters', async () => {
      listMetadataService.getListMetadata.mockResolvedValue({
        id: 123,
        version: 2,
        commodity: 'POIL',
        listName: 'Test List',
      });

      await service.resolveColumns(123, 'testdb', true);

      expect(listMetadataService.getListMetadata).toHaveBeenCalledWith(123, 'testdb', true);
    });

    it('should handle metadata service errors and throw them', async () => {
      const error = new Error('Database error');
      listMetadataService.getListMetadata.mockRejectedValue(error);

      await expect(service.resolveColumns(123, 'testdb', false)).rejects.toThrow('Database error');
    });

    it('should return consistent structure for all scenarios', async () => {
      const testCases = [
        { metadata: null, description: 'null metadata' },
        {
          metadata: { id: 123, version: 1, commodity: null, listName: 'Test' },
          description: 'version 1 list',
        },
        {
          metadata: { id: 123, version: 2, commodity: 'POIL', listName: 'Test' },
          description: 'version 2 palm oil list',
        },
        {
          metadata: { id: 123, version: 2, commodity: 'SOYB', listName: 'Test' },
          description: 'version 2 soy list',
        },
      ];

      for (const testCase of testCases) {
        listMetadataService.getListMetadata.mockResolvedValue(testCase.metadata);

        const result = await service.resolveColumns(123, 'testdb', false);

        expect(result).toHaveProperty('columns');
        expect(result).toHaveProperty('source');
        expect(result).toHaveProperty('resolvedFrom');
        expect(Array.isArray(result.columns)).toBe(true);
        expect(typeof result.source).toBe('string');
        expect(typeof result.resolvedFrom).toBe('string');
        expect(result.source).toBe('default');
        expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
        expect(result.resolvedFrom).toBe('COMMODITY_GENERIC');
      }
    });
  });
});
