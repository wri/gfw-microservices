import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  NotImplementedException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { FCDService } from './fcd.service';
import { FcdControllerRequestBody } from '../../models';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { fcdCategoriesMap } from '@wri-monorepos/constants';

const DatabaseQuerySchema = z.object({
  clientDatabase: z.string(),
});

@Controller('fcd')
export class FCDController {
  constructor(private readonly fcdService: FCDService) {}

  private readonly logger = new Logger(FCDService.name);

  @Post('/:listId/:category')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  async getFCDCategoryDataForListId(
    @Param('listId') listId: string,
    @Param('category') category: string,
    @Body() bodyPayload: FcdControllerRequestBody
  ) {
    const categoryFor = fcdCategoriesMap[category];
    this.logger.log('POST /:listId/:category', listId, category);

    switch (categoryFor) {
      case fcdCategoriesMap.WDPA:
        return await this.fcdService.handleWDPACategoryForList(listId, bodyPayload);

      case fcdCategoriesMap.landmark:
        return await this.fcdService.handleLandmarkCategoryForList(listId, bodyPayload);

      case fcdCategoriesMap.country:
        return await this.fcdService.handleCountryCategoryForList(listId, bodyPayload);

      case fcdCategoriesMap.classified_region:
        throw new NotImplementedException();

      default:
        throw new NotImplementedException(
          `getFCDCategoryDataForListId: category ['${category}'] not implemented`
        );
    }
  }
}
