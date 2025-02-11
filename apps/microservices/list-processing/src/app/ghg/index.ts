import { Module } from '@nestjs/common';
import { GHGController } from './ghg.controller';
import { GHGService } from './ghg.service';
import { GHGAnalyses, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [SqlModule, TypeOrmModule.forFeature([GHGAnalyses], 'default')],
  controllers: [GHGController],
  providers: [GHGService],
})
export class GHGModule {}
