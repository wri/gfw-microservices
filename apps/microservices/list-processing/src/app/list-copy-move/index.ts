import { Module } from '@nestjs/common';
import { ListCopyMoveService } from './list.copy.move.service';
import { AwsModule } from '@wri-monorepos/aws';
import { ListModule } from '../list';
@Module({
  imports: [AwsModule, ListModule],
  controllers: [],
  providers: [ListCopyMoveService],
  exports: [ListCopyMoveService],
})
export class ListCopyMoveModule {}
