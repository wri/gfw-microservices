import { Module } from '@nestjs/common';
import { ConvertersService } from './converters.service';
import { ConvertersController } from './converters.controller';
import { ConverterRepository } from './converter.repository';
import { ClientStoreConnection } from '@wri-monorepos/sql';

@Module({
  controllers: [ConvertersController],
  providers: [ConvertersService, ConverterRepository, ClientStoreConnection],
})
export class ConvertersModule {}
