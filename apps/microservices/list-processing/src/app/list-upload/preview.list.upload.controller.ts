import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { FeatureCollection } from '@wri-monorepos/geo';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { z } from 'zod';
import { PreviewListUploadService } from './preview.list.upload.service';
import { Performance } from '@wri-monorepos/shared';

export class PreviewListRequest {
  path: string;
}

export const previewListSchema = z.object({
  path: z.string(),
});

@Controller('/list/upload')
export class PreviewListUploadController {
  constructor(private readonly previewListUploadService: PreviewListUploadService) {}

  @Post('/preview')
  @UsePipes(new ZodValidationPipe(previewListSchema))
  @Performance()
  async preview(@Body() request: PreviewListRequest): Promise<FeatureCollection> {
    const { path } = request;
    const data = await this.previewListUploadService.previewData(path);
    return data;
  }
}
