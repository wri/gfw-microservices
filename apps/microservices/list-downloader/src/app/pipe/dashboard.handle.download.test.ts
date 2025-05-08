import * as fs from 'fs';
import { PassThrough } from 'stream';
import { DashboardHandleDownload } from './dashboard.handle.download';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  createWriteStream: jest.fn(() => ({
    on: jest.fn(),
    end: jest.fn(),
    destroy: jest.fn(),
  })),
}));

jest.mock('stream/promises', () => ({
  finished: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../transform/convert.object.2.csv');

describe('DashboardHandleDownload', () => {
  let service: DashboardHandleDownload;
  let mockFilters: ListFieldsFileRequest;

  beforeEach(() => {
    service = new DashboardHandleDownload();
    mockFilters = {
      listId: 123,
      key: 'example-key',
      listName: 'example-list',
      selectedLocationsList: [],
      listLevelAnalysis: false,
    } as unknown as ListFieldsFileRequest;

    jest.clearAllMocks();
  });

  it('should start the download process and write the CSV header', () => {
    const mockTable = 'exampleTable';
    const mockFileSuffix = 'exampleSuffix';
    EXCEL_TEMPLATES[mockTable] = [];
    EXCEL_TEMPLATE_HEADERS[mockTable] = ['header1', 'header2'];

    service.start(mockFilters, mockTable, mockFileSuffix);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `/tmp/wri-example-key/example-list_exampleSuffix.csv`,
      'header1,header2\n'
    );
  });

  it('should process data and write to the stream', () => {
    const mockData = [{ field1: 'value1' }, { field2: 'value2' }];
    const writeSpy = jest.spyOn(PassThrough.prototype, 'write');

    service.start(mockFilters, 'exampleTable', 'exampleSuffix');
    service.process(mockData, mockFilters);

    expect(writeSpy).toHaveBeenCalledTimes(2);
    expect(writeSpy).toHaveBeenCalledWith({ list_name: 'example-list', field1: 'value1' });
    expect(writeSpy).toHaveBeenCalledWith({ list_name: 'example-list', field2: 'value2' });
  });
});
