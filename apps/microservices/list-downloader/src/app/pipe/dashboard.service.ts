import { Logger, Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from './IPipeService';

import { ForestLossService } from './forest.loss.service';
import { S3Service } from '@wri-monorepos/aws';
import { EmailService } from '@wri-monorepos/aws';

@Injectable()
export class DashboardService extends IPipeService{
  private readonly logger = new Logger(DashboardService.name);
  private filters: GenerationFileRequest;

  constructor(
    public s3Service: S3Service,
    public emailService: EmailService,
    private forestLossService:ForestLossService,
  ){
    super(emailService, s3Service)
  }

  start(filters: GenerationFileRequest) {
    this.filters = filters;
    const { listView } = this.filters;
    if(listView === 'forest_change'){
      this.forestLossService.start(filters);
    }
  }

  process(data: any) {
    const { listView , type } = this.filters;

    if(listView === 'forest_change' || type == 'forestLoss' || type == 'everything'){
      this.forestLossService.process(data);
    }

  }

  finish(filters: GenerationFileRequest) {

  }
}
