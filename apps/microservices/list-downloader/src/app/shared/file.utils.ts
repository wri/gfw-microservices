import * as archiver from 'archiver';
import * as fs from 'fs';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';

const createDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getAllFilesAndZip = async (filter: BasicFieldsFileRequest) => {
  Logger.log('Started zipping the files');
  return new Promise((resolve, reject) => {
    const { key, listName } = filter;
    const output = fs.createWriteStream(`/tmp/${key}.zip`);

    output.on('finish', async () => {
      output.destroy();
      resolve('ok');
    });

    output.on('error', (err) => {
      output.destroy();
      reject(err);
    });

    fs.readdir(`/tmp/wri-${key}`, async (err, filenames) => {
      const files = filenames.filter(
        (name) => name.includes(`${listName}`) || name.includes('README')
      );

      new Promise((resolve, reject) => {
        const array = [];
        let count = 1;
        files.forEach((file) => {
          fs.readFile(`/tmp/wri-${key}/${file}`, 'utf8', (err, content) => {
            if (err) {
              reject(err);
            }
            const lineCount = content.split('\n').filter(line => line.trim()).length;
            // Include files with header + at least one data row
            if (lineCount >= 2) {
              array.push(file);
            }
            if (files.length === count) {
              resolve(array);
            }
            count += 1;
          });
        });
      }).then((filesToAppend: string[]) => {
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Sets the compression level.
        });
        filesToAppend.forEach((file) => {
          archive.append(fs.createReadStream(`/tmp/wri-${key}/${file}`), {
            name: `${file}`,
          });
        });
        archive.pipe(output);
        archive.finalize();
      });
    });
  });
};

export { getAllFilesAndZip, createDirectory };
