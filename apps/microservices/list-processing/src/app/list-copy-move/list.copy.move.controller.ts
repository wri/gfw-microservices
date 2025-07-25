import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { copyOrMoveLargeListRequestSchema } from '../validators';
import { CopyOrMoveLargeListRequestLLP } from '../../models';
import { LocationService } from './locations.service';

@Controller()
export class ListCopyMoveController {
  constructor(private readonly locationService: LocationService) {}

  @Post('/CopyOrMoveLargeList')
  @UsePipes(new ZodValidationPipe(copyOrMoveLargeListRequestSchema))
  CopyOrMoveLargeList(
    @Body()
    request: CopyOrMoveLargeListRequestLLP
  ) {
    return this.locationService.MoveLocations({
      ...request,
      activeTemplate: '', // Templates are deprecated, provide empty default
      templateData: {}, // Templates are deprecated, provide empty default
    });
  }
}
