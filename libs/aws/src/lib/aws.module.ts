import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { EmailService } from './email.service';
import { S3Service } from './s3.service';
import { MetadataService } from './metadata.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [EmailService, S3Service, MetadataService],
  exports: [EmailService, S3Service, MetadataService],
})
export class AwsModule {}
