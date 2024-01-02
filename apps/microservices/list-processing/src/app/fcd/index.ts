import { Module } from '@nestjs/common';
import { FCDService } from './fcd.service';
import { FCDController } from './fcd.controller';

@Module({
  imports: [],
  controllers: [FCDController],
  providers: [FCDService],
})
export class FCDModule {}
