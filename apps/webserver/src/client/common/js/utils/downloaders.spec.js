import { downloadCSV, downloadZIP } from './downloaders';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

describe('CSV and ZIP Download Utils', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL = URL;
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    navigator.msSaveOrOpenBlob = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadCSV', () => {
    it('should use msSaveOrOpenBlob if available', () => {
      const csvData = [
        ['col1', 'col2'],
        ['val1', 'val2'],
      ];

      downloadCSV(csvData);

      expect(navigator.msSaveOrOpenBlob).toHaveBeenCalled();
    });
  });

  describe('downloadZIP', () => {
    it('should create and save a ZIP file', async () => {
      const csvDataArr = [
        [
          ['col1', 'col2'],
          ['val1', 'val2'],
        ],
      ];
      const names = ['file1'];

      const fileMock = jest.spyOn(JSZip.prototype, 'file');
      const generateAsyncMock = jest
        .spyOn(JSZip.prototype, 'generateAsync')
        .mockResolvedValue(new Blob());

      await downloadZIP(csvDataArr, names);

      expect(fileMock).toHaveBeenCalledWith('file1.csv', 'col1,col2\nval1,val2\n');
      expect(FileSaver.saveAs).toHaveBeenCalled();

      fileMock.mockRestore();
      generateAsyncMock.mockRestore();
    });
  });
});
