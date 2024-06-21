import { Module } from '@nestjs/common';

import { SesModule } from '@nextnm/nestjs-ses';
import { EmailService } from './email.service';
import { S3Service } from './s3.service';
import { HttpModule } from '@nestjs/axios';
import { MetadataService } from './metadata.service';

@Module({
  imports: [
    HttpModule,
    SesModule.forRoot({
      SECRET: process.env.AWS_SECRET_ACCESS_KEY,
      AKI_KEY: process.env.AWS_ACCESS_KEY_ID,
      REGION: process.env.AWS_REGION,
    }),
  ],
  controllers: [],
  providers: [EmailService, S3Service, MetadataService],
  exports: [EmailService, S3Service, MetadataService],
})
export class AwsModule {}
