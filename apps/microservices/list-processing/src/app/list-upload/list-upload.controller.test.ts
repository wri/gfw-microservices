import { Test, TestingModule } from '@nestjs/testing';
import { ListUploadController } from './list-upload.controller';
import { ListUploadService } from './list-upload.service';
import { FeatureCollection } from '@wri-monorepos/geo';

describe('ListUploadController', () => {
  let listUploadController: ListUploadController;
  let listUploadService: ListUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListUploadController],
      providers: [
        {
          provide: ListUploadService,
          useValue: {
            previewData: jest.fn(),
          },
        },
      ],
    }).compile();

    listUploadController = module.get<ListUploadController>(ListUploadController);
    listUploadService = module.get<ListUploadService>(ListUploadService);
  });

  describe('preview', () => {
    it('should return a FeatureCollection when given a valid path', async () => {
      const mockFeatureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      jest.spyOn(listUploadService, 'previewData').mockResolvedValue(mockFeatureCollection);

      const request = { path: '/valid/path' };
      const result = await listUploadController.preview(request);

      expect(result).toEqual(mockFeatureCollection);
      expect(listUploadService.previewData).toHaveBeenCalledWith('/valid/path');
    });

    it('should throw an error when given an invalid path', async () => {
      const request = { path: 123 }; // Invalid path type

      try {
        await listUploadController.preview(request as any);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Invalid input');
      }
    });
  });
});
