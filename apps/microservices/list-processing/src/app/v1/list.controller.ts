import { CreateListRequest } from './../../models/index';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AppController } from '../app.controller';
import { ApiTags } from '@nestjs/swagger';
import { ListPaginationService } from '../../services/list.pagination.service';
import { AppService } from '../app.service';
import { ListService } from '../../services/list.service';
import { FeatureFlagCheckGuard } from '../../guards/feature.flag.enabled.guard';
import { LocationService } from '../../services/locations.service';
/*
Because this controler extends AppController there are some duplicated endpoints 
that comes from base Controller, in order to completely deprecate those endpoints
we need to copy the endpoints to this controller to remove it.
*/
@ApiTags('v1')
@Controller('v1/list')
export class ListController extends AppController {
  constructor(
    protected readonly appService: AppService,
    protected readonly listService: ListService,
    protected readonly locationService: LocationService,
    protected readonly listPaginationService: ListPaginationService
  ) {
    super(appService, listService, locationService, listPaginationService);
  }

  @Post('/create-list')
  @UseGuards(new FeatureFlagCheckGuard('UploadListLp'))
  createList(@Body() request: CreateListRequest) {
    return this.listService.createNewList(request);
  }
}
