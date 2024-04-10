import { Module } from '@nestjs/common';
import { ValidateCSVController } from './validate.csv.controller';
import { ValidateCSVService } from './validate.csv.service';
import { S3Service } from '@wri-monorepos/aws';

@Module({
  imports: [],
  controllers: [ValidateCSVController],
  providers: [ValidateCSVService, S3Service],
})
export class ListUploadModule {}
