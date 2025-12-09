import { Module } from '@nestjs/common';

import { SesModule } from '@nextnm/nestjs-ses';
import { EmailService } from './email.service';
import { S3Service } from './s3.service';
import { HttpModule } from '@nestjs/axios';
import * as http from 'http';
import * as https from 'https';
import { MetadataService } from './metadata.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      // Enable persistent connections for better performance
      httpAgent: new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 50,
        maxFreeSockets: 10,
      }),
      httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 50,
        maxFreeSockets: 10,
      }),
    }),
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
