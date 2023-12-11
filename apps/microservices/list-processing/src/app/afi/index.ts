import { Module } from '@nestjs/common';
import { AfiController } from './afi.controller';
import { AfiService } from './afi.service';

@Module({
  imports: [],
  controllers: [AfiController],
  providers: [AfiService],
})
export class AFIModule {}
