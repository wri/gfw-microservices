import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AppController } from '../app.controller';
import { ApiTags } from '@nestjs/swagger';
import { RequestTriggerProcessLargeList } from '../../models';
import { ListCreationService } from '../../services/list.creation.service';
import { LocationService } from '@wri-monorepos/geo';
import { ListPaginationService } from '../../services/list.pagination.service';
import { AppService } from '../app.service';
import { ListService } from '../../services/list.service';
import { FeatureFlagEnabledGuard } from '../../guards/feature.flag.enabled.guard';

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
    protected readonly listPaginationService: ListPaginationService,
    protected readonly listCreationService: ListCreationService
  ) {
    super(appService, listService, locationService, listPaginationService);
  }

  @Post('/create-list-tables')
  @UseGuards(new FeatureFlagEnabledGuard('UploadListLp'))
  createListTables(@Body() request: RequestTriggerProcessLargeList, @Request() req) {
    if (req.featureFlag.featureFlagEnabled) {
      return this.listCreationService.createNewList(
        request.list_name,
        request.user_id,
        request.client_database,
        request.analysisIds
      );
    }
    return this.listService.createListTables(
      request.list_name,
      request.user_id,
      request.client_database,
      request.analysisIds
    );
  }
}
