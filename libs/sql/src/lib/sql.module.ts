import { UspGetListLocations } from './lists/uspGetListLocations';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseService } from './util/database.service';

import {
  UspGetAnalysisDataCountForUserList,
  UspGetPaginatedAnalysisDataForUserList,
  UspGetListNameSchema,
} from './llp';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useClass: DatabaseService })],
  controllers: [],
  providers: [
    UspGetAnalysisDataCountForUserList,
    UspGetPaginatedAnalysisDataForUserList,
    UspGetListNameSchema,
    UspGetListLocations,
  ],
  exports: [
    UspGetAnalysisDataCountForUserList,
    UspGetPaginatedAnalysisDataForUserList,
    UspGetListNameSchema,
    UspGetListLocations,
  ],
})
export class SqlModule {}
