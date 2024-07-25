import { Module } from '@nestjs/common';
import { ValidateCSVController } from './validation/validate.csv.controller';
import { ValidateCSVService } from './validation/validate.csv.service';
import { S3Service } from '@wri-monorepos/aws';
import { ListTemplate } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidateCsvRepository } from './validation/validate.csv.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ListTemplate], 'default')],
  controllers: [ValidateCSVController],
  providers: [ValidateCSVService, S3Service, ValidateCsvRepository],
})
export class ListUploadModule {}
