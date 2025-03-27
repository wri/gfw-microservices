import { Module } from '@nestjs/common';
import { ListCopyMoveService } from './list.copy.move.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ListCopyMoveService],
  exports: [ListCopyMoveService],
})
export class ListCopyMoveModule {}
