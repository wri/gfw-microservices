import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from '../tokens';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../tokens/token.entity';
import { Organization } from '../tokens/organization.entity';
import { ConfigModule } from '@nestjs/config';
import { User } from '../tokens/user.entity';
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
