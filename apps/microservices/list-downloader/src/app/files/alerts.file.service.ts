import { Injectable } from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';


@Injectable()
export class AlertsFileService extends IPipeService {
    start(filters: BasicFieldsFileRequest, table?: string, fileSuffix?: string) {
        throw new Error('Method not implemented.');
    }
    process(data: any, filters: BasicFieldsFileRequest) {
        throw new Error('Method not implemented.');
    }
    finish(filters: BasicFieldsFileRequest) {
        throw new Error('Method not implemented.');
    }
}
