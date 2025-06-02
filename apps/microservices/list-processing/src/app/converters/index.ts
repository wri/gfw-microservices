import { Module } from '@nestjs/common';
import { ConvertersService } from './converters.service';
import { ConvertersController } from './converters.controller.js';

@Module({
  controllers: [ConvertersController],
  providers: [ConvertersService],
})
export class ConvertersModule {}
