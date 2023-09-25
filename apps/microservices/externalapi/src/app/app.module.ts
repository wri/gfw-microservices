import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from '../api-keys';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../api-keys/external-api-key.entity';
import { Organization } from '../api-keys/organization.entity';
import { ConfigModule } from '@nestjs/config';
import { User } from '../api-keys/user.entity';
import { ListsAnalysisModule } from '../list-analysis';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.production'],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'sqlite',
      database: 'db.default.sqlite',
      synchronize: true,
      logging: true,
      entities: [Organization],
    }),
    TypeOrmModule.forRoot({
      name: 'client',
      type: 'sqlite',
      database: 'db.sqlite',
      synchronize: true,
      logging: true,
      entities: [Token, User],
    }),
    TokenModule,
    ListsAnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
