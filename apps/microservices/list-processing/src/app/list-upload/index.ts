import { Module } from '@nestjs/common';
import { ValidateCSVController } from './validation/validate.csv.controller';
import { ValidateCSVService } from './validation/validate.csv.service';
import { S3Service } from '@wri-monorepos/aws';
import { ListTemplate, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidateCsvRepository } from './validation/validate.csv.repository';
import { DeprecatedStartAnalysisService } from './deprecated.start.analysis.service';
import { StartAnalysisService } from './start.analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListTemplate], 'default'), SqlModule],
  controllers: [ValidateCSVController],
  providers: [
    ValidateCSVService,
    S3Service,
    ValidateCsvRepository,
    DeprecatedStartAnalysisService,
    StartAnalysisService,
  ],
  exports: [DeprecatedStartAnalysisService, StartAnalysisService],
})
export class ListUploadModule {}
