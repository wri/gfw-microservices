import { Module } from '@nestjs/common';
import { ListDataService } from './list-data.service';
import { ListPaginationService } from './list.pagination.service';
import { ListDataController } from './list-data.controller';

@Module({
  imports: [],
  controllers: [ListDataController],
  providers: [ListDataService, ListPaginationService],
  exports: [ListDataService],
})
export class ListDataModule {}
