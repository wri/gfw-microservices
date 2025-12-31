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
          fs.stat(`/tmp/wri-${key}/${file}`, (err, stats) => {
            if (err) {
              reject(err);
            }
            // Only skip files that are truly empty (size 0)
            if (stats.size > 0) {
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
