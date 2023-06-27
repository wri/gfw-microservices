import { UspGetListLocations } from './lists/uspGetListLocations';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UspGetListAnalysis } from './lists';

import { DatabaseService } from './util/database.service';

import { UspGetAnalysisDataCountForUserList, UspGetPaginatedAnalysisDataForUserList } from './llp';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useClass: DatabaseService })],
  controllers: [],
  providers: [
    UspGetAnalysisDataCountForUserList,
    UspGetPaginatedAnalysisDataForUserList,
    UspGetListLocations,
    UspGetListAnalysis,
  ],
  exports: [
    UspGetAnalysisDataCountForUserList,
    UspGetPaginatedAnalysisDataForUserList,
    UspGetListLocations,
    UspGetListAnalysis,
  ],
})
export class SqlModule {}
