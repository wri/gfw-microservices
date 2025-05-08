import { Test, TestingModule } from '@nestjs/testing';
import { PreviewListUploadController } from './preview.list.upload.controller';
import { PreviewListUploadService } from './preview.list.upload.service';
import { FeatureCollection } from '@wri-monorepos/geo';

interface PreviewRequest {
  path: string;
}

describe('ListUploadController', () => {
  let previewListUploadController: PreviewListUploadController;
  let previewListUploadService: PreviewListUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreviewListUploadController],
      providers: [
        {
          provide: PreviewListUploadService,
          useValue: {
            previewData: jest.fn(),
          },
        },
      ],
    }).compile();

    previewListUploadController = module.get<PreviewListUploadController>(
      PreviewListUploadController
    );
    previewListUploadService = module.get<PreviewListUploadService>(PreviewListUploadService);
  });

  describe('preview', () => {
    it('should return a FeatureCollection when given a valid path', async () => {
      const mockFeatureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      jest.spyOn(previewListUploadService, 'previewData').mockResolvedValue(mockFeatureCollection);

      const request: PreviewRequest = { path: '/valid/path' };
      const result = await previewListUploadController.preview(request);

      expect(result).toEqual(mockFeatureCollection);
      expect(previewListUploadService.previewData).toHaveBeenCalledWith('/valid/path');
    });

    it('should throw an error when given an invalid path', async () => {
      const request = { path: 123 }; // Invalid path type

      try {
        await previewListUploadController.preview(request as unknown as PreviewRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Invalid input');
      }
    });
  });
});
