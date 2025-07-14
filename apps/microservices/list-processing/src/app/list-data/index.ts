import { Module } from '@nestjs/common';
import { ListDataService } from './list-data.service';
import { ListPaginationService } from './list.pagination.service';
import { ListDataController } from './list-data.controller';
import { DeleteListTypeOrm, SqlModule } from '@wri-monorepos/sql';

@Module({
  imports: [SqlModule],
  controllers: [ListDataController],
  providers: [ListDataService, ListPaginationService, DeleteListTypeOrm],
  exports: [ListDataService],
})
export class ListDataModule {}
