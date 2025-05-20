// src/user/user.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';

import { AuthService } from './auth.service';
import { APIKeyController } from './api-key.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { ServerConfigType } from '../validators/server-config';
import { ExternalAPIKey, FeatureFlag, Organization, UserRoutes } from '@wri-monorepos/sql';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, ExternalAPIKey, UserRoutes, FeatureFlag], 'default'),
    ConfigModule,
  ],
  providers: [
    TokenService,
    AuthService,
    {
      provide: '',
      inject: [ConfigService],
      useFactory: (config: ConfigService<ServerConfigType, true>) => {
        new S3Client({
          credentials: {
            accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
          },
          region: config.get('AWS_REGION'),
        });
      },
    },
  ],
  exports: [TokenService, AuthService],
  controllers: [APIKeyController],
})
export class TokenModule {}
