import { Module } from '@nestjs/common';
import { ListCopyMoveService } from './list.copy.move.service';
import { AwsModule } from '@wri-monorepos/aws';
import { ListModule } from '../list';
import { ListCopyMoveController } from './list.copy.move.controller';
import { LocationService } from './locations.service';
import { GeoService } from '@wri-monorepos/geo';
@Module({
  imports: [AwsModule, ListModule],
  controllers: [ListCopyMoveController],
  providers: [ListCopyMoveService, LocationService, GeoService],
  exports: [ListCopyMoveService],
})
export class ListCopyMoveModule {}
