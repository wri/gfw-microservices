import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotImplementedException,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { FCDService } from './fcd.service';
import {
  DatabaseQueryParam,
  DatabaseQueryParamCountryDeforestation,
  FcdV2ControllerRequestBody,
} from '../../models';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { fcdCategoriesMap } from '@wri-monorepos/constants';

const DatabaseQuerySchema = z.object({
  clientDatabase: z.string(),
});

@Controller('fcd')
export class FCDController {
  constructor(private readonly fcdService: FCDService) {}

  @Post('/v2/:listId/:category')
  @HttpCode(200)
  async getFCDCategoryDataForListId(
    @Param('listId') listId: string,
    @Param('category') category: string,
    @Body() bodyPayload: FcdV2ControllerRequestBody
  ) {
    const categoryFor = fcdCategoriesMap[category];
    console.log('/v2/:listId/:category', listId, category, categoryFor);

    switch (categoryFor) {
      case fcdCategoriesMap.WDPA:
        return await this.fcdService.wdpaFcdCategory(listId, bodyPayload);

      case fcdCategoriesMap.landmark:
        return await this.fcdService.landmarkFcdCategory(listId, bodyPayload);

      case fcdCategoriesMap.country:
        throw new NotImplementedException();
        
      case fcdCategoriesMap.classified_region:
        throw new NotImplementedException();

      default:
        return new NotImplementedException(
          `getFCDCategoryDataForListId: category ['${category}'] not implemented`
        );
    }
  }

  @Get('/:listId/wdpa_overlap_country/:country')
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  async getAggregateOverlapByCountry(
    @Param('listId') listId: string,
    @Param('country') country: string,
    @Query() queryParam: DatabaseQueryParam
  ) {
    const { clientDatabase } = queryParam;
    return this.fcdService.aggregateOverlapByCountry(listId, country, clientDatabase);
  }

  @Get('/:listId/landmark_overlap_country/:country')
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  async getLandmarkOverlapCountry(
    @Param('listId') listId: string,
    @Param('country') country: string,
    @Query() queryParam: DatabaseQueryParam
  ) {
    const { clientDatabase } = queryParam;
    return this.fcdService.landmarkOverlapCountry(listId, country, clientDatabase);
  }

  @Get('/:listId/country_specific_deforestation')
  @UsePipes(new ZodValidationPipe(DatabaseQuerySchema))
  async getCountrySpecificDeforestation(
    @Param('listId') listId: string,
    @Query() queryParam: DatabaseQueryParamCountryDeforestation
  ) {
    const { clientDatabase, countryGadm, locationId } = queryParam;
    return this.fcdService.countrySpecificDeforestation(
      listId,
      clientDatabase,
      countryGadm,
      locationId
    );
  }
}
