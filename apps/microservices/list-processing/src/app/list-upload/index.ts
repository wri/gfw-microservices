import { Module } from '@nestjs/common';
import { ValidateCSVController } from './validate.csv.controller';
import { ValidateCSVService } from './validate.csv.service';
import { S3Service } from '@wri-monorepos/aws';
import { ListTemplate } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidateCsvRepository } from './validate.csv.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ListTemplate], 'default')],
  controllers: [ValidateCSVController],
  providers: [ValidateCSVService, S3Service, ValidateCsvRepository],
})
export class ListUploadModule {}
