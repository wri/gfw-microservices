import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LLPMessageHandler } from './llp.message.handler';
import { ShapefileService } from './shapefile.service';
import { CSVService } from './csv.service';

import { SqlModule } from '@wri-monorepos/sql';
import { AwsModule } from '@wri-monorepos/aws';
console.log(process.env.AWS_ACCESS_KEY_ID);

@Module({
  imports: [AwsModule, ConfigModule.forRoot({ isGlobal: true }), SqlModule],
  controllers: [],
  providers: [CSVService, LLPMessageHandler, ShapefileService],
  exports: [LLPMessageHandler],
})
export class LLPModule {}
