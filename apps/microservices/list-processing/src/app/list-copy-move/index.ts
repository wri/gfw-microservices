import { Module } from '@nestjs/common';
import { ListCopyMoveService } from './list.copy.move.service';
import { AwsModule } from '@wri-monorepos/aws';

@Module({
  imports: [AwsModule],
  controllers: [],
  providers: [ListCopyMoveService],
  exports: [ListCopyMoveService],
})
export class ListCopyMoveModule {}
