import { Module } from '@nestjs/common';
import { ListCopyMoveService } from './list.copy.move.service';
import { AwsModule } from '@wri-monorepos/aws';
import { ListModule } from '../commodity';
import { ListCopyMoveController } from './list.copy.move.controller';
import { LocationService } from './locations.service';
@Module({
  imports: [AwsModule, ListModule],
  controllers: [ListCopyMoveController],
  providers: [ListCopyMoveService, LocationService],
  exports: [ListCopyMoveService],
})
export class ListCopyMoveModule {}
