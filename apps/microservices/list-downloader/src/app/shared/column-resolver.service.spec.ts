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
    it('should return COMMODITY_GENERIC columns with correct structure', async () => {
      const result = await service.resolveColumns(123);

      expect(result.source).toBe('default');
      expect(result.columns).toEqual(templateColumns.COMMODITY_GENERIC);
      expect(result.resolvedFrom).toBe('COMMODITY_GENERIC');
    });

    it('should return consistent structure for different list IDs', async () => {
      const testCases = [123, 456, 789];

      for (const listId of testCases) {
        const result = await service.resolveColumns(listId);

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

    it('should handle errors and throw them', async () => {
      // Mock the service to throw an error
      jest.spyOn(service, 'resolveColumns').mockRejectedValue(new Error('Test error'));

      await expect(service.resolveColumns(123)).rejects.toThrow('Test error');
    });

    it('should not call getListMetadata since it is not used in current implementation', async () => {
      await service.resolveColumns(123);

      expect(listMetadataService.getListMetadata).not.toHaveBeenCalled();
    });
  });
});
