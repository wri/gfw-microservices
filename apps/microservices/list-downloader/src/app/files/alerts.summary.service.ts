import { Injectable } from '@nestjs/common';
import { AlertFieldsFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';

@Injectable()
export class AlertsSummaryService extends IPipeService {
  start(filters: AlertFieldsFileRequest, table?: string, fileSuffix?: string) {
    throw new Error('Method not implemented.');
  }
  process(data: any, filters: AlertFieldsFileRequest) {
    throw new Error('Method not implemented.');
  }
  finish(filters: AlertFieldsFileRequest) {
    throw new Error('Method not implemented.');
  }
}
