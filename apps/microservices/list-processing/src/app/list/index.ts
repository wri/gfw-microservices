import { Module } from '@nestjs/common';
import { DeleteListTypeOrm, ListTemplate, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommodityController } from './commodity.controller';
import { CommodityService } from './commodity.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListTemplate], 'default'), SqlModule],
  controllers: [CommodityController],
  providers: [CommodityService, DeleteListTypeOrm],
  exports: [CommodityService],
})
export class ListModule {}
