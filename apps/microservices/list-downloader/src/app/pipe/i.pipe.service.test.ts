/* eslint-disable @typescript-eslint/no-unused-vars */
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from './i.pipe.service';
import { SQLUtils } from '@wri-monorepos/sql';

class IPipeServiceStub extends IPipeService {
  start(_filters: BasicFieldsFileRequest, _table?: string, _fileSuffix?: string) {
    console.log('Method not implemented.');
  }
  process(_data: unknown, _filters: BasicFieldsFileRequest) {
    console.log('Method not implemented.');
  }
  finish(_filters: BasicFieldsFileRequest) {
    console.log('Method not implemented.');
  }
}

describe('IPipeService', () => {
  const iPipeServiceStub = new IPipeServiceStub();

  const filter = {
    listId: 123,
    organizationDatabase: 'test-QO',
    type: 'afi',
    file: 'csv',
    isGFWList: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('If is a userlist should save s3 url on the database', () => {
    const runDbQuery = jest.spyOn(SQLUtils, 'queryDB').mockResolvedValue('ok');
    iPipeServiceStub.saveS3UrlAtDatabase(filter, 'file-location');
    expect(runDbQuery).toHaveBeenCalledTimes(1);
  });

  it('If is gfwlist should not save s3 url on the database', () => {
    const runDbQuery = jest.spyOn(SQLUtils, 'queryDB').mockResolvedValue('ok');
    iPipeServiceStub.saveS3UrlAtDatabase(
      {
        ...filter,
        isGFWList: true,
      },
      'file-location'
    );
    expect(runDbQuery).toHaveBeenCalledTimes(0);
  });
});
