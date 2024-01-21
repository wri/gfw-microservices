import { UspGetListLocations } from './lists';
import { Module } from '@nestjs/common';
import { UspGetListAnalysis } from './lists';
import { UspGetAnalysisDataCountForUserList, UspGetPaginatedAnalysisDataForUserList } from './llp';
import { ClientStoreConnection } from './util';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
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
