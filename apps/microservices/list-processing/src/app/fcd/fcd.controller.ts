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
import { FcdV2ControllerRequestBody } from '../../models';
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
    @Body() bodyPayload: FcdV2ControllerRequestBody
  ) {
    const categoryFor = fcdCategoriesMap[category];
    this.logger.log('POST /:listId/:category', listId, category);

    switch (categoryFor) {
      case fcdCategoriesMap.WDPA:
        return await this.handleWDPACategoryForList(listId, bodyPayload);

      case fcdCategoriesMap.landmark:
        return await this.handleLandmarkCategoryForList(listId, bodyPayload);

      case fcdCategoriesMap.country:
        return await this.handleCountryCategoryForList(listId, bodyPayload);

      case fcdCategoriesMap.classified_region:
        throw new NotImplementedException();

      default:
        throw new NotImplementedException(
          `getFCDCategoryDataForListId: category ['${category}'] not implemented`
        );
    }
  }

  async handleWDPACategoryForList(listId: string, params: FcdV2ControllerRequestBody) {
    const { clientDatabase, country, locationId } = params;

    const overlap = await this.fcdService.getAggregatedWDPAOverlapByCountry(
      listId,
      country,
      clientDatabase,
      locationId
    );

    return {
      overlap,
    };
  }

  async handleLandmarkCategoryForList(listId: string, params: FcdV2ControllerRequestBody) {
    const { clientDatabase, country, locationId } = params;

    const overlap = await this.fcdService.getAggregatedLandmarkOverlapByCountry(
      listId,
      country,
      clientDatabase,
      locationId
    );

    return {
      overlap,
    };
  }

  async handleCountryCategoryForList(listId: string, params: FcdV2ControllerRequestBody) {
    const { clientDatabase, countryGadm, locationId } = params;

    return this.fcdService.countrySpecificDeforestation(
      listId,
      clientDatabase,
      countryGadm,
      locationId
    );
  }
}
