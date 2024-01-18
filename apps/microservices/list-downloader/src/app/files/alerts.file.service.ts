import { Injectable } from '@nestjs/common';
import { IPipeService } from '../pipe/i.pipe.service';
import { GenerationFileRequest } from '@wri-monorepos/sql';

@Injectable()
export class AlertsFileService extends IPipeService {
  start(filters: GenerationFileRequest, table?: string, fileSuffix?: string) {
    console.log('filters', filters);
  }
  process(data: any, filters: GenerationFileRequest) {
    console.log('data', data);
  }
  finish(filters: GenerationFileRequest) {
    console.log('filters', filters);
  }
}
