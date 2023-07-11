import { UspGetListLocations } from './lists/uspGetListLocations';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UspGetListAnalysis } from './lists';

import { DatabaseService } from './util/database.service';

import { UspGetPaginatedAnalysisDataForUserList } from './llp';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useClass: DatabaseService })],
  controllers: [],
  providers: [UspGetPaginatedAnalysisDataForUserList, UspGetListLocations, UspGetListAnalysis],
  exports: [UspGetPaginatedAnalysisDataForUserList, UspGetListLocations, UspGetListAnalysis],
})
export class SqlModule {}
