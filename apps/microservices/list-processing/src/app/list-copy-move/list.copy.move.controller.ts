import { Body, Controller, Post, UsePipes, Request } from '@nestjs/common';
import { CopyOrMoveLargeListRequestLLP } from '../../models';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { copyOrMoveLargeListRequestSchema } from '../validators';
import { LocationService } from './locations.service';

@Controller()
export class ListCopyMoveController {
  constructor(private readonly locationService: LocationService) {}

  @Post('/CopyOrMoveLargeList')
  @UsePipes(new ZodValidationPipe(copyOrMoveLargeListRequestSchema))
  CopyOrMoveLargeList(
    @Body()
    request: CopyOrMoveLargeListRequestLLP,
    @Request() req?
  ) {
    const { featureFlag } = req;
    return this.locationService.MoveLocations({
      ...request,
      isUploadListLpEnabled: featureFlag.enabled,
    });
  }
}
