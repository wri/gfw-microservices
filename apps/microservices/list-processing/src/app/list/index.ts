import { Module } from '@nestjs/common';
import { DeleteListTypeOrm, ListTemplate, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommodityController } from './commodity.controller';
import { CommodityService } from './commodity.service';
import { ListController } from './list.controller';
import { ListPaginationService } from './list.pagination.service';
import { DeleteListService } from './delete.list.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListTemplate], 'default'), SqlModule],
  controllers: [CommodityController, ListController],
  providers: [CommodityService, ListPaginationService, DeleteListService, DeleteListTypeOrm],
  exports: [CommodityService],
})
export class ListModule {}
