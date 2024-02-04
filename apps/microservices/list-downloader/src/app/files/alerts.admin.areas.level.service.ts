import { Injectable } from '@nestjs/common';
import { AlertFieldsFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';

/*
{
  organizationDatabase: 'clientstore-DevCo',
  type: 'alerts',
  key: 'tmp-47778-3E50yfUBEfP2',
  listId: '5479',
  userEmail: 'gustavo.figueiredo.5@wriconsultant.org',
  listName: 'GPV 1651',
  rowsPerPage: 5000
}

 */
@Injectable()
export class AlertsAdminAreasLevelService extends IPipeService {
  start(filters: AlertFieldsFileRequest, table?: string, fileSuffix?: string) {
    // console.log(filters);
  }
  process(data: any, filters: AlertFieldsFileRequest) {
    console.log(data);
  }
  finish(filters: AlertFieldsFileRequest) {
    // console.log(filters)
  }
}
