import { Test, TestingModule } from '@nestjs/testing';
import { ReadmeService } from './readme.service';
import * as fs from 'fs';

jest.mock('fs');

describe('ReadmeService', () => {
  let service: ReadmeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadmeService],
    }).compile();

    service = module.get<ReadmeService>(ReadmeService);
  });

  describe('buildReadmeData', () => {
    it('should return the formatted readme data', () => {
      const data = [
        {
          header: {
            key1: {
              name: 'Name 1',
              description: 'Description 1',
            },
            key2: {
              name: 'Name 2',
              description: 'Description 2',
            },
          },
          fileName: 'file1',
          description: 'Description 1',
        },
        {
          header: {
            key3: {
              name: 'Name 3',
              description: 'Description 3',
            },
            key4: {
              name: 'Name 4',
              description: 'Description 4',
            },
          },
          fileName: 'file2',
          description: 'Description 2',
        },
      ];

      const expectedOutput =
        'CSV Name;Description;Column;Column Description\n' +
        '<LISTNAME>_file1;Description 1;Name 1;Description 1\n' +
        '<LISTNAME>_file1;Description 1;Name 2;Description 2\n' +
        '<LISTNAME>_file2;Description 2;Name 3;Description 3\n' +
        '<LISTNAME>_file2;Description 2;Name 4;Description 4';

      const result = service.buildReadmeData(data);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('write', () => {
    it('should write the readme data to a file', async () => {
      const filters = {
        type: 'afi',
        key: 'some_key',
      };

      const data = [
        {
          header: {
            key1: {
              name: 'Name 1',
              description: 'Description 1',
            },
            key2: {
              name: 'Name 2',
              description: 'Description 2',
            },
          },
          fileName: 'file1',
          description: 'Description 1',
        },
      ];

      const readmeData =
        'CSV Name;Description;Column;Column Description\n' +
        '<LISTNAME>_file1;Description 1;Name 1;Description 1\n' +
        '<LISTNAME>_file1;Description 1;Name 2;Description 2';

      jest.spyOn(service, 'afiReadmeData').mockReturnValue(data);
      jest.spyOn(service, 'buildReadmeData').mockReturnValue(readmeData);
      jest.spyOn(service, 'writeDataToFile').mockResolvedValue();

      await service.write(filters);

      expect(service.afiReadmeData).toHaveBeenCalled();
      expect(service.buildReadmeData).toHaveBeenCalledWith(data);
      expect(service.writeDataToFile).toHaveBeenCalledWith(filters, readmeData);
    });
  });

  describe('writeDataToFile', () => {
    it('should write the data to a file', async () => {
      const filters = {
        type: 'afi',
        key: 'some_key',
      };
      const data = 'CSV Name;Description;Column;Column Description';
      const expectedFilePath = '/tmp/wri-some_key/README.csv';

      (fs.writeFile as unknown as jest.Mock).mockImplementation(
        (filePath, data, encoding, callback) => {
          callback(null);
        }
      );

      await service.writeDataToFile(filters, data);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expectedFilePath,
        data,
        'utf8',
        expect.any(Function)
      );
    });

    it('should reject with an error if writing to file fails', async () => {
      const filters = {
        type: 'afi',
        key: 'some_key',
      };
      const data = 'CSV Name;Description;Column;Column Description';

      (fs.writeFile as unknown as jest.Mock).mockImplementation(
        (filePath, data, encoding, callback) => {
          callback(new Error('Error! Write error'));
        }
      );

      await expect(service.writeDataToFile(filters, data)).rejects.toThrow('Error! Write error');
    });
  });
});
