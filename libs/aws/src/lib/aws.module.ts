import { Module } from '@nestjs/common';

import { SesModule } from '@nextnm/nestjs-ses';
import { EmailService } from './email.service';
import { S3Service } from './s3.service';

@Module({
  imports: [
    SesModule.forRoot({
      SECRET: process.env.AWS_SECRET_ACCESS_KEY,
      AKI_KEY: process.env.AWS_ACCESS_KEY_ID,
      REGION: process.env.AWS_REGION,
    }),
  ],
  controllers: [],
  providers: [EmailService, S3Service],
  exports: [EmailService, S3Service],
})
export class AwsModule {}
