import { UspGetListLocations } from './lists/uspGetListLocations';
import { Module } from '@nestjs/common';
import { UspGetListAnalysis } from './lists';
import { UspGetAnalysisDataCountForUserList, UspGetPaginatedAnalysisDataForUserList } from './llp';
import { ClientStoreConnection } from './util/typeORM.utils';

@Module({
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
