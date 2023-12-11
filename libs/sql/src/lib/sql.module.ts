import { UspGetListLocations } from './lists/uspGetListLocations';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UspGetListAnalysis } from './lists';

import { DatabaseService } from './util/database.service';

import { UspGetAnalysisDataCountForUserList, UspGetPaginatedAnalysisDataForUserList } from './llp';
import { ClientStoreConnection } from './util/typeORM.utils';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useClass: DatabaseService })],
  controllers: [],
  providers: [
    UspGetAnalysisDataCountForUserList,
    UspGetPaginatedAnalysisDataForUserList,
    UspGetListLocations,
    UspGetListAnalysis,
    ClientStoreConnection,
  ],
  exports: [
    UspGetAnalysisDataCountForUserList,
    UspGetPaginatedAnalysisDataForUserList,
    UspGetListLocations,
    UspGetListAnalysis,
    ClientStoreConnection,
  ],
})
export class SqlModule {}
