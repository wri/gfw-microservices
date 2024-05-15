import { Body, Controller, Post } from '@nestjs/common';
import { AppController } from '../app.controller';
import { ApiTags } from '@nestjs/swagger';
import { RequestTriggerProcessLargeList } from '../../models';

/*
Because this controler extends AppController there are some duplicated endpoints 
that comes from base Controller, in order to completely deprecate those endpoints
we need to copy the endpoints to this controller to remove it.
*/
@ApiTags('v1')
@Controller('v1/list')
export class ListController extends AppController {
  @Post('/create-list-tables')
  createListTables(@Body() request: RequestTriggerProcessLargeList) {
    return this.largeListService.createListTables(
      request.list_name,
      request.user_id,
      request.client_database,
      request.analysisIds
    );
  }
}
