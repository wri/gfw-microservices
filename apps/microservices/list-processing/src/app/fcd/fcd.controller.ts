import { Body, Controller, HttpCode, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { FCDService } from './fcd.service';
import { FcdControllerRequestBody } from '../../models';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';

const databaseQuerySchema = z.object({
  clientDatabase: z.string(),
  country: z.string().optional(),
  countryGadm: z.string().optional(),
  locationId: z.coerce.number().optional(),
});

const fcdServiceFunctionsMap = Object.freeze({
  WDPA: 'handleWDPACategoryForList',
  landmark: 'handleLandmarkCategoryForList',
  country: 'handleCountryCategoryForList',
  classified_region: 'handleClassifiedRegionCategoryForList',
});

const fcdServiceFunctionsInputArray = Object.keys(fcdServiceFunctionsMap) as [
  keyof typeof fcdServiceFunctionsMap
];

const fcdServiceFunctionsInputArraySchema = z.enum(fcdServiceFunctionsInputArray);

@Controller('fcd')
export class FCDController {
  constructor(private readonly fcdService: FCDService) {}

  private readonly logger = new Logger(FCDController.name);

  @Post('/:listId/:category')
  @HttpCode(HttpStatus.OK)
  async getFCDCategoryDataForListId(
    @Param('listId') listId: number,
    @Param('category', new ZodValidationPipe(fcdServiceFunctionsInputArraySchema))
    category: keyof typeof fcdServiceFunctionsMap,
    @Body(new ZodValidationPipe(databaseQuerySchema)) bodyPayload: FcdControllerRequestBody
  ) {
    this.logger.log('POST /:listId/:category', listId, category);

    const fcdFunctionName = fcdServiceFunctionsMap[category];
    return await this.fcdService[fcdFunctionName](listId, bodyPayload);
  }
}
